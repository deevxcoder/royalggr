import axios from "axios";
import crypto from "crypto";
import { prisma } from "./prisma";

export interface WebhookPayload {
  serial_number: string;
  member_account: string;
  game_id: number | null;
  game_uid: string;
  game_name: string;
  bet_amount: number;
  win_amount: number;
  credit_amount: number;
  currency: string;
  timestamp: number;
  signature?: string;
}

export function signPayload(payload: any, secretKey: string): string {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(JSON.stringify(payload));
  return hmac.digest("hex");
}

export async function dispatchWebhook(params: {
  operatorId: string;
  sessionId?: string;
  targetUrl: string;
  payload: WebhookPayload;
  secretKey?: string;
}) {
  const { operatorId, sessionId, targetUrl, payload, secretKey } = params;

  if (secretKey) {
    payload.signature = signPayload(payload, secretKey);
  }

  let responseCode: number | null = null;
  let responseBody: string | null = null;
  let status = "SUCCESS";

  try {
    const res = await axios.post(targetUrl, payload, {
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
        "X-Royal-Signature": payload.signature || "",
      },
    });

    responseCode = res.status;
    responseBody = typeof res.data === "object" ? JSON.stringify(res.data) : String(res.data);
    if (res.status >= 400) {
      status = "FAILED";
    }
  } catch (err: any) {
    status = "FAILED";
    if (err.response) {
      responseCode = err.response.status;
      responseBody =
        typeof err.response.data === "object"
          ? JSON.stringify(err.response.data)
          : String(err.response.data);
    } else {
      responseBody = err.message || "Network Timeout or Connection Refused";
    }
  }

  const log = await prisma.webhookLog.create({
    data: {
      operatorId,
      sessionId: sessionId || null,
      serialNumber: payload.serial_number,
      targetUrl,
      payload: JSON.stringify(payload),
      responseCode,
      responseBody: responseBody ? responseBody.substring(0, 1000) : null,
      status,
      attempts: 1,
    },
  });

  return { success: status === "SUCCESS", log };
}
