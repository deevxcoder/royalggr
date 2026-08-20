import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/apiKeyAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateApiRequest(req);
    if (!auth.valid) {
      return NextResponse.json(
        { status: 0, error: auth.error || "Unauthorized" },
        { status: auth.statusCode || 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const brandId = searchParams.get("brand_id");
    const query = searchParams.get("q")?.toLowerCase();
    const limit = Math.min(200, Number(searchParams.get("limit")) || 100);
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

    const enabledProvidersParam = searchParams.get("enabled_providers");

    const where: any = {
      isActive: true,
      provider: { isActive: true },
    };

    // Check operator disabled games
    const disabledToggles = await prisma.operatorGameToggle.findMany({
      where: { operatorId: auth.operator.id, isEnabled: false },
      select: { gameUid: true },
    });
    const disabledUids = disabledToggles.map((t) => t.gameUid);
    if (disabledUids.length > 0) {
      where.gameUid = { notIn: disabledUids };
    }

    if (category && category !== "all") {
      where.category = category;
    }
    if (brandId) {
      where.provider.brandId = Number(brandId);
    } else if (enabledProvidersParam) {
      const brandIds = enabledProvidersParam
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n) && n > 0);
      if (brandIds.length > 0) {
        where.provider.brandId = { in: brandIds };
      }
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
        select: { brandId: true, name: true, type: true, logo: true },
      }),
    ]);

    const formattedGames = games.map((g) => ({
      game_id: g.gameId || 1000 + Math.floor(Math.random() * 9000),
      game_uid: g.gameUid,
      game_name: g.name,
      name: g.name,
      brand_id: g.provider.brandId,
      brand_name: g.provider.name,
      provider: g.provider.name,
      category: g.category,
      rtp: g.rtp,
      volatility: g.volatility,
      max_multiplier: g.maxMultiplier,
      banner: g.banner || g.thumbnail,
      thumbnail: g.thumbnail,
      logo: g.thumbnail,
      is_active: g.isActive,
      is_featured: g.isFeatured,
    }));

    return NextResponse.json({
      status: 1,
      code: 0,
      msg: "Active games catalog",
      count: formattedGames.length,
      total,
      brands: providers.map((p) => ({
        brand_id: p.brandId,
        brand_name: p.name,
        name: p.name,
        is_native: p.type === "ROYAL_NATIVE",
      })),
      data: {
        games: formattedGames,
        total,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message || "Internal server error" }, { status: 500 });
  }
}
