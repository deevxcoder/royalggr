import { NextRequest, NextResponse } from "next/server";
import { getOperatorFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const operator = await getOperatorFromCookie();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deposits = await prisma.operatorDepositRequest.findMany({
      where: { operatorId: operator.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, deposits });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load deposits" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const operator = await getOperatorFromCookie();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, paymentMethod, transactionRef, proofImage } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      return NextResponse.json(
        { error: "Minimum deposit request amount is ₹100" },
        { status: 400 }
      );
    }

    if (!transactionRef || !String(transactionRef).trim()) {
      return NextResponse.json(
        { error: "Transaction Reference (UTR Number / TxHash) is required" },
        { status: 400 }
      );
    }

    const deposit = await prisma.operatorDepositRequest.create({
      data: {
        operatorId: operator.id,
        amount: numAmount,
        currency: operator.currency || "INR",
        paymentMethod: paymentMethod || "UPI",
        transactionRef: String(transactionRef).trim(),
        proofImage: proofImage || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Deposit request submitted successfully. Super Admin will verify and credit your balance manually.",
      deposit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit deposit request" }, { status: 500 });
  }
}
