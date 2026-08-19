import { NextRequest, NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/operator/settings
export async function GET(req: NextRequest) {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenRecord = await prisma.apiToken.findFirst({
      where: { operatorId: operator.id, isLive: true },
    });

    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";

    return NextResponse.json({
      success: true,
      settings: {
        callbackUrl: operator.callbackUrl || "https://ggrcasinotest.vercel.app/api/callback",
        encryptCallbacks: Boolean(operator.encryptCallbacks),
        ipWhitelist: tokenRecord?.ipWhitelist || null,
        callerIp: clientIp.split(",")[0].trim(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

// POST /api/operator/settings
export async function POST(req: NextRequest) {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { callbackUrl, encryptCallbacks, ipWhitelist } = body;

    const updateData: any = {};
    if (typeof callbackUrl === "string") {
      updateData.callbackUrl = callbackUrl.trim();
    }
    if (typeof encryptCallbacks === "boolean") {
      updateData.encryptCallbacks = encryptCallbacks;
    }

    const updatedOperator = await prisma.operator.update({
      where: { id: operator.id },
      data: updateData,
    });

    // Update IP Whitelist on primary token if provided
    if (typeof ipWhitelist !== "undefined") {
      const tokenRecord = await prisma.apiToken.findFirst({
        where: { operatorId: operator.id, isLive: true },
      });
      if (tokenRecord) {
        await prisma.apiToken.update({
          where: { id: tokenRecord.id },
          data: {
            ipWhitelist: typeof ipWhitelist === "string" ? ipWhitelist.trim() || null : null,
          },
        });
      }
    }

    const updatedToken = await prisma.apiToken.findFirst({
      where: { operatorId: operator.id, isLive: true },
    });

    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";

    return NextResponse.json({
      success: true,
      message: "Integration settings updated successfully",
      settings: {
        callbackUrl: updatedOperator.callbackUrl || "https://ggrcasinotest.vercel.app/api/callback",
        encryptCallbacks: Boolean(updatedOperator.encryptCallbacks),
        ipWhitelist: updatedToken?.ipWhitelist || null,
        callerIp: clientIp.split(",")[0].trim(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
