import { NextRequest, NextResponse } from "next/server";
import { getOperatorFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const operator = await getOperatorFromCookie();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Number(searchParams.get("limit")) || 50);

    const [sessions, rounds] = await Promise.all([
      prisma.gameSession.findMany({
        where: { operatorId: operator.id },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.gameRound.findMany({
        where: { operatorId: operator.id },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      sessions,
      rounds,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch sessions" }, { status: 500 });
  }
}
