import { NextRequest, NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, method = "UPI", referenceId } = await req.json();
    const depositAmount = Math.max(100, Number(amount) || 0);

    if (depositAmount <= 0) {
      return NextResponse.json({ error: "Invalid recharge amount" }, { status: 400 });
    }

    const ref = referenceId || `RECH_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const updated = await prisma.operator.update({
      where: { id: operator.id },
      data: {
        balance: {
          increment: depositAmount,
        },
      },
    });

    await prisma.operatorTransaction.create({
      data: {
        operatorId: operator.id,
        type: "DEPOSIT",
        amount: depositAmount,
        balanceAfter: updated.balance,
        referenceId: ref,
        description: `Prepaid GGR Wallet Recharge via ${method}`,
      },
    });

    return NextResponse.json({
      success: true,
      newBalance: updated.balance,
      transactionRef: ref,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
