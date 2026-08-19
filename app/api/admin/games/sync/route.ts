import { NextRequest, NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { INITIAL_PROVIDERS_SEED } from "@/lib/seedCatalog";
import { fetchNexxProviders, fetchNexxGames, DEFAULT_NEXX_TOKEN, DEFAULT_NEXX_SECRET } from "@/lib/nexxApi";

export async function POST(req: NextRequest) {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!operator.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Master Admin access required" }, { status: 403 });
    }

    let syncedProvidersCount = 0;
    let syncedGamesCount = 0;

    // 1. Fetch live providers from NexxAPI Upstream Aggregator
    const liveNexxProviders = await fetchNexxProviders(undefined, DEFAULT_NEXX_TOKEN);

    if (liveNexxProviders && liveNexxProviders.length > 0) {
      console.log(`Syncing ${liveNexxProviders.length} live providers from NexxAPI...`);

      for (const p of liveNexxProviders) {
        const brandId = Number(p.brand_id || p.brandId);
        if (!brandId) continue;

        const provider = await prisma.externalProvider.upsert({
          where: { brandId },
          update: {
            name: p.name,
            type: "NEXX_AGGREGATOR",
            apiUrl: "https://api.nexxapi.tech/api/v1",
            apiToken: DEFAULT_NEXX_TOKEN,
            apiSecret: DEFAULT_NEXX_SECRET,
            logo: p.logo || null,
            gameCount: p.game_count || 0,
            isActive: true,
          },
          create: {
            brandId,
            name: p.name,
            type: "NEXX_AGGREGATOR",
            apiUrl: "https://api.nexxapi.tech/api/v1",
            apiToken: DEFAULT_NEXX_TOKEN,
            apiSecret: DEFAULT_NEXX_SECRET,
            logo: p.logo || null,
            gameCount: p.game_count || 0,
            ggrMargin: 10.0,
            isActive: true,
          },
        });
        syncedProvidersCount++;

        // Fetch live games for this provider from NexxAPI
        const { games: nexxGames } = await fetchNexxGames(undefined, DEFAULT_NEXX_TOKEN, brandId, 200);

        for (const g of nexxGames) {
          const gameUid = String(g.game_uid || g.game_id || g.id);
          if (!gameUid) continue;

          let cat = String(g.category || "slots").toLowerCase();
          if (cat.includes("slot")) cat = "slots";
          else if (cat.includes("crash") || cat.includes("fly")) cat = "crash";
          else if (cat.includes("live") || cat.includes("table")) cat = "live";

          await prisma.externalGame.upsert({
            where: { gameUid },
            update: {
              providerId: provider.id,
              gameId: Number(g.game_id) || undefined,
              name: g.name || gameUid,
              category: cat,
              thumbnail: g.logo || g.banner || null,
              isActive: true,
            },
            create: {
              providerId: provider.id,
              gameId: Number(g.game_id) || undefined,
              gameUid,
              name: g.name || gameUid,
              category: cat,
              rtp: 96.5,
              volatility: "MEDIUM",
              maxMultiplier: "5000x",
              thumbnail: g.logo || g.banner || null,
              isActive: true,
            },
          });
          syncedGamesCount++;
        }
      }
    }

    // 2. Also ensure Local Native Royal Games Studio seed is present
    for (const provSeed of INITIAL_PROVIDERS_SEED) {
      if (provSeed.brandId === 1) { // Royal Native Studio
        const provider = await prisma.externalProvider.upsert({
          where: { brandId: 1 },
          update: {
            name: provSeed.name,
            type: provSeed.type,
            apiUrl: provSeed.apiUrl,
            logo: provSeed.logo,
            gameCount: provSeed.games.length,
            ggrMargin: provSeed.ggrMargin,
            isActive: true,
          },
          create: {
            brandId: 1,
            name: provSeed.name,
            type: provSeed.type,
            apiUrl: provSeed.apiUrl,
            logo: provSeed.logo,
            gameCount: provSeed.games.length,
            ggrMargin: provSeed.ggrMargin,
            isActive: true,
          },
        });
        syncedProvidersCount++;

        for (const g of provSeed.games) {
          await prisma.externalGame.upsert({
            where: { gameUid: g.gameUid },
            update: {
              providerId: provider.id,
              gameId: g.gameId,
              name: g.name,
              category: g.category,
              rtp: g.rtp,
              volatility: g.volatility,
              maxMultiplier: g.maxMultiplier,
              thumbnail: g.thumbnail,
              isActive: true,
              isFeatured: g.isFeatured || false,
            },
            create: {
              providerId: provider.id,
              gameId: g.gameId,
              gameUid: g.gameUid,
              name: g.name,
              category: g.category,
              rtp: g.rtp,
              volatility: g.volatility,
              maxMultiplier: g.maxMultiplier,
              thumbnail: g.thumbnail,
              isActive: true,
              isFeatured: g.isFeatured || false,
            },
          });
          syncedGamesCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${syncedProvidersCount} providers and ${syncedGamesCount} games directly from NexxAPI Master Aggregator!`,
      syncedProvidersCount,
      syncedGamesCount,
    });
  } catch (err: any) {
    console.error("Sync API Error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
