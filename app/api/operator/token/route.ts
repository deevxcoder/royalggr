import { NextRequest, NextResponse } from "next/server";
import { getCurrentOperator, generateApiKey } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name = "New API Key", isLive = true, ipWhitelist = null } = await req.json().catch(() => ({}));
    const keys = generateApiKey();

    const token = await prisma.apiToken.create({
      data: {
        operatorId: operator.id,
        name,
        token: keys.token,
        secretKey: keys.secretKey,
        isLive: Boolean(isLive),
        ipWhitelist: ipWhitelist ? String(ipWhitelist).trim() : null,
      },
    });

    return NextResponse.json({ success: true, token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
