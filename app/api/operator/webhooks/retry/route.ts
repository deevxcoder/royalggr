import { NextRequest, NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { webhookLogId } = await req.json();

    const log = await prisma.webhookLog.findFirst({
      where: { id: webhookLogId, operatorId: operator.id },
    });

    if (!log) {
      return NextResponse.json({ error: "Webhook log record not found" }, { status: 404 });
    }

    let payloadObj = {};
    try {
      payloadObj = JSON.parse(log.payload);
    } catch {
      payloadObj = { raw: log.payload };
    }

    let responseCode: number | null = null;
    let responseBody: string | null = null;
    let newStatus = "SUCCESS";

    try {
      const res = await axios.post(log.targetUrl, payloadObj, {
        timeout: 5000,
        headers: { "Content-Type": "application/json" },
      });
      responseCode = res.status;
      responseBody = typeof res.data === "object" ? JSON.stringify(res.data) : String(res.data);
      if (res.status >= 400) newStatus = "FAILED";
    } catch (err: any) {
      newStatus = "FAILED";
      if (err.response) {
        responseCode = err.response.status;
        responseBody =
          typeof err.response.data === "object"
            ? JSON.stringify(err.response.data)
            : String(err.response.data);
      } else {
        responseBody = err.message || "Connection refused";
      }
    }

    const updatedLog = await prisma.webhookLog.update({
      where: { id: log.id },
      data: {
        responseCode,
        responseBody: responseBody ? responseBody.substring(0, 1000) : null,
        status: newStatus,
        attempts: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: newStatus === "SUCCESS",
      log: updatedLog,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
