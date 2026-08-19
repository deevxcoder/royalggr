import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyGameSession } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhookDispatcher";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      sessionToken,
      sessionId,
      gameUid,
      gameName = "Royal Game",
      betAmount = 0,
      winAmount = 0,
      newPlayerBalance,
      gameRoundInfo = {},
    } = body;

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: "Missing session token" }, { status: 401 });
    }

    const decoded = verifyGameSession(sessionToken);
    if (!decoded || !decoded.sessionId) {
      return NextResponse.json({ success: false, error: "Invalid or expired session token" }, { status: 401 });
    }

    const session = await prisma.gameSession.findUnique({
      where: { sessionId: decoded.sessionId },
      include: {
        operator: {
          include: {
            tokens: { where: { isLive: true }, take: 1 },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Game session not found" }, { status: 404 });
    }

    const operator = session.operator;
    const ggrRate = operator.ggrRate || 10.0; // 10%
    const ggrFee = Number(((betAmount * ggrRate) / 100).toFixed(2));

    // Update Operator Balance with GGR deduction
    const updatedOperator = await prisma.operator.update({
      where: { id: operator.id },
      data: {
        balance: {
          decrement: ggrFee,
        },
      },
    });

    // Record operator fee transaction
    if (ggrFee > 0) {
      await prisma.operatorTransaction.create({
        data: {
          operatorId: operator.id,
          type: "GGR_FEE",
          amount: -ggrFee,
          balanceAfter: updatedOperator.balance,
          description: `GGR Fee (${ggrRate}%) on ${gameName} bet of ${betAmount} ${session.currency}`,
        },
      });
    }

    // Unique Serial Number for Idempotency
    const serialNumber = `SN_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    // Record Game Round
    const roundRecord = await prisma.gameRound.create({
      data: {
        serialNumber,
        sessionId: session.id,
        operatorId: operator.id,
        userId: session.userId,
        gameUid: gameUid || session.gameUid,
        gameName,
        betAmount: Number(betAmount),
        winAmount: Number(winAmount),
        creditAmount: Number(newPlayerBalance),
        ggrFeeDeducted: ggrFee,
        rawPayload: JSON.stringify(gameRoundInfo),
      },
    });

    // Secret key for signature
    const secretKey = operator.tokens[0]?.secretKey || "sec_royal_default";

    // Asynchronously dispatch webhook to client casino callbackUrl
    const webhookPayload = {
      serial_number: serialNumber,
      member_account: session.userId,
      game_id: null,
      game_uid: gameUid || session.gameUid,
      game_name: gameName,
      bet_amount: Number(betAmount),
      win_amount: Number(winAmount),
      credit_amount: Number(newPlayerBalance),
      currency: session.currency,
      timestamp: Date.now(),
    };

    // Dispatch webhook (fire & log)
    dispatchWebhook({
      operatorId: operator.id,
      sessionId: session.id,
      targetUrl: session.callbackUrl,
      payload: webhookPayload,
      secretKey,
    }).catch((err) => console.error("Async Webhook Error:", err));

    return NextResponse.json({
      success: true,
      serialNumber,
      ggrFeeDeducted: ggrFee,
      operatorBalanceAfter: updatedOperator.balance,
      playerBalance: newPlayerBalance,
    });
  } catch (err: any) {
    console.error("Studio Round Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
