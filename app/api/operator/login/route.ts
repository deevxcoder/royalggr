import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signOperatorToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const operator = await prisma.operator.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!operator) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = comparePassword(password, operator.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signOperatorToken({ operatorId: operator.id, email: operator.email });

    const response = NextResponse.json({
      success: true,
      operator: {
        id: operator.id,
        companyName: operator.companyName,
        email: operator.email,
        balance: operator.balance,
        currency: operator.currency,
      },
    });

    response.cookies.set("royalggr_operator_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
