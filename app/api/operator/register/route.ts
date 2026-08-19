import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateApiKey, signOperatorToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { companyName, email, password } = await req.json();

    if (!companyName || !email || !password) {
      return NextResponse.json({ error: "Company name, email, and password are required" }, { status: 400 });
    }

    const existing = await prisma.operator.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "An operator with this email already exists" }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    const keys = generateApiKey();

    const operator = await prisma.operator.create({
      data: {
        companyName: companyName.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        balance: 10000.0, // Starting demo prepaid GGR credit
        currency: "INR",
        ggrRate: 10.0,
        tokens: {
          create: {
            token: keys.token,
            secretKey: keys.secretKey,
            name: "Production Master Key",
            isLive: true,
          },
        },
      },
    });

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
