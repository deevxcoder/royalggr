import { NextRequest, NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!operator.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Master Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brand_id");
    const category = searchParams.get("category");
    const search = searchParams.get("q");

    const where: any = {};
    if (brandId) {
      where.provider = { brandId: Number(brandId) };
    }
    if (category && category !== "all") {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { gameUid: { contains: search } },
      ];
    }

    const games = await prisma.externalGame.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        provider: {
          select: { brandId: true, name: true, type: true, logo: true, isActive: true },
        },
      },
    });

    return NextResponse.json({ success: true, count: games.length, games });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!operator.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Master Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const {
      providerId,
      gameUid,
      name,
      category = "slots",
      rtp = 96.5,
      volatility = "MEDIUM",
      maxMultiplier = "5000x",
      thumbnail = "",
      isActive = true,
      isFeatured = false,
    } = body;

    if (!providerId || !gameUid || !name) {
      return NextResponse.json(
        { error: "providerId, gameUid, and name are required" },
        { status: 400 }
      );
    }

    const game = await prisma.externalGame.upsert({
      where: { gameUid },
      update: {
        providerId,
        name,
        category,
        rtp: Number(rtp),
        volatility,
        maxMultiplier,
        thumbnail,
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
      },
      create: {
        providerId,
        gameUid,
        name,
        category,
        rtp: Number(rtp),
        volatility,
        maxMultiplier,
        thumbnail,
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
      },
    });

    return NextResponse.json({ success: true, game });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!operator.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Master Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    await prisma.externalGame.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
