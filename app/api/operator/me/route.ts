import { NextRequest, NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [recentRounds, recentWebhooks, recentTransactions, roundStats] = await Promise.all([
      prisma.gameRound.findMany({
        where: { operatorId: operator.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.webhookLog.findMany({
        where: { operatorId: operator.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.operatorTransaction.findMany({
        where: { operatorId: operator.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.gameRound.aggregate({
        where: { operatorId: operator.id },
        _count: { id: true },
        _sum: { betAmount: true, winAmount: true, ggrFeeDeducted: true },
      }),
    ]);

    return NextResponse.json({
      operator: {
        id: operator.id,
        companyName: operator.companyName,
        email: operator.email,
        balance: operator.balance,
        currency: operator.currency,
        ggrRate: operator.ggrRate,
        isAdmin: operator.isAdmin,
        tokens: operator.tokens,
      },
      stats: {
        totalRounds: roundStats._count.id || 0,
        totalBetVolume: roundStats._sum.betAmount || 0,
        totalWinVolume: roundStats._sum.winAmount || 0,
        totalGgrFees: roundStats._sum.ggrFeeDeducted || 0,
      },
      recentRounds,
      recentWebhooks,
      recentTransactions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
