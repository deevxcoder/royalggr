import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const brandId = searchParams.get("brand_id");
    const query = searchParams.get("q")?.trim();
    const limit = Math.min(200, Number(searchParams.get("limit")) || 100);
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

    const where: any = {
      isActive: true,
      provider: { isActive: true },
    };

    if (category && category !== "all") {
      where.category = category;
    }
    if (brandId) {
      where.provider = { brandId: Number(brandId) };
    }
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { gameUid: { contains: query } },
      ];
    }

    const [total, games, providers] = await Promise.all([
      prisma.externalGame.count({ where }),
      prisma.externalGame.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: {
          provider: {
            select: { brandId: true, name: true, type: true, logo: true },
          },
        },
      }),
      prisma.externalProvider.findMany({
        where: { isActive: true },
        orderBy: { brandId: "asc" },
        include: {
          _count: {
            select: { games: { where: { isActive: true } } },
          },
        },
      }),
    ]);

    const formatImageUrl = (url?: string | null) => {
      if (!url) return null;
      if (url.includes("nexxapi.tech")) {
        return `/api/media?url=${encodeURIComponent(url)}`;
      }
      return url;
    };

    const formattedGames = games.map((g) => ({
      id: g.id,
      gameId: g.gameId || 1000 + Math.floor(Math.random() * 9000),
      gameUid: g.gameUid,
      name: g.name,
      category: g.category,
      rtp: g.rtp,
      volatility: g.volatility,
      maxMultiplier: g.maxMultiplier,
      thumbnail: formatImageUrl(g.thumbnail || g.banner),
      isFeatured: g.isFeatured,
      provider: {
        brandId: g.provider.brandId,
        name: g.provider.name,
        type: g.provider.type,
      },
    }));

    const formattedProviders = providers.map((p) => ({
      brandId: p.brandId,
      name: p.name,
      type: p.type,
      logo: formatImageUrl(p.logo),
      gameCount: p._count.games,
      isNative: p.type === "ROYAL_NATIVE",
    }));

    return NextResponse.json({
      success: true,
      total,
      count: formattedGames.length,
      providers: formattedProviders,
      games: formattedGames,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
