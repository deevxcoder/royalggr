import { PrismaClient } from "@prisma/client";
import { fetchNexxProviders, fetchNexxGames, DEFAULT_NEXX_TOKEN, DEFAULT_NEXX_SECRET } from "../lib/nexxApi";

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching live providers from NexxAPI Master Aggregator...");
  const providers = await fetchNexxProviders(undefined, DEFAULT_NEXX_TOKEN);

  console.log(`Received ${providers.length} providers from NexxAPI!`);

  let totalGamesSynced = 0;

  for (const p of providers) {
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

    // Fetch games for this brand
    const { games: nexxGames } = await fetchNexxGames(undefined, DEFAULT_NEXX_TOKEN, brandId, 200);
    console.log(`Syncing ${nexxGames.length} games for provider [${brandId}] ${p.name}...`);

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
      totalGamesSynced++;
    }
  }

  console.log(`Live NexxAPI catalog sync complete! Total games synced: ${totalGamesSynced}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
