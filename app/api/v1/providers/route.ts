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

    const providers = await prisma.externalProvider.findMany({
      where: { isActive: true },
      orderBy: { brandId: "asc" },
      include: {
        _count: {
          select: { games: { where: { isActive: true } } },
        },
      },
    });

    const formatted = providers.map((p) => ({
      brand_id: p.brandId,
      name: p.name,
      type: p.type,
      logo: p.logo,
      game_count: p._count.games,
      is_native: p.type === "ROYAL_NATIVE",
    }));

    return NextResponse.json({
      status: 1,
      code: 0,
      msg: "Active providers catalog",
      count: formatted.length,
      data: {
        providers: formatted,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message || "Internal server error" }, { status: 500 });
  }
}
