import { NextRequest, NextResponse } from "next/server";
import { getOperatorFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const operator = await getOperatorFromCookie();
    if (!operator || !operator.isAdmin) {
      return NextResponse.json({ error: "Master Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Number(searchParams.get("limit")) || 50);

    const [sessions, recentRounds] = await Promise.all([
      prisma.gameSession.findMany({
        include: {
          operator: {
            select: { companyName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.gameRound.findMany({
        include: {
          operator: {
            select: { companyName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      sessions,
      recentRounds,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load live sessions" }, { status: 500 });
  }
}
