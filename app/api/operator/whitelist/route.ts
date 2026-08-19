import { NextRequest, NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tokenId, ipWhitelist } = await req.json();

    const updated = await prisma.apiToken.updateMany({
      where: { id: tokenId, operatorId: operator.id },
      data: {
        ipWhitelist: ipWhitelist ? String(ipWhitelist).trim() : null,
      },
    });

    return NextResponse.json({ success: true, updatedCount: updated.count });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
