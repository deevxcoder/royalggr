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

    const providers = await prisma.externalProvider.findMany({
      orderBy: { brandId: "asc" },
      include: {
        _count: {
          select: { games: true },
        },
      },
    });

    return NextResponse.json({ success: true, providers });
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
      id,
      brandId,
      name,
      type = "NEXX_AGGREGATOR",
      apiUrl = "https://api.nexxapi.tech/api/v1",
      apiToken = "",
      apiSecret = "",
      logo = "",
      ggrMargin = 10.0,
      isActive = true,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Provider name is required" }, { status: 400 });
    }

    let bId = Number(brandId);
    if (!bId || isNaN(bId)) {
      const maxBrand = await prisma.externalProvider.findFirst({
        orderBy: { brandId: "desc" },
      });
      bId = (maxBrand?.brandId || 100) + 1;
    }

    const provider = await prisma.externalProvider.upsert({
      where: { brandId: bId },
      update: {
        name,
        type,
        apiUrl,
        apiToken,
        apiSecret,
        logo,
        ggrMargin: Number(ggrMargin),
        isActive: Boolean(isActive),
      },
      create: {
        brandId: bId,
        name,
        type,
        apiUrl,
        apiToken,
        apiSecret,
        logo,
        ggrMargin: Number(ggrMargin),
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, provider });
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
      return NextResponse.json({ error: "Provider ID is required" }, { status: 400 });
    }

    await prisma.externalProvider.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
