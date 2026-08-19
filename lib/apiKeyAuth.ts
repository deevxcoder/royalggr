import { NextRequest } from "next/server";
import { prisma } from "./prisma";

export interface ApiAuthResult {
  valid: boolean;
  operator?: any;
  apiToken?: any;
  error?: string;
  statusCode?: number;
}

export async function authenticateApiRequest(req: NextRequest): Promise<ApiAuthResult> {
  const authHeader = req.headers.get("authorization") || req.headers.get("x-api-token");
  let tokenStr = "";

  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      tokenStr = authHeader.substring(7).trim();
    } else {
      tokenStr = authHeader.trim();
    }
  }

  // Also check query param fallback
  if (!tokenStr) {
    const url = new URL(req.url);
    tokenStr = url.searchParams.get("token") || "";
  }

  if (!tokenStr) {
    return {
      valid: false,
      error: "Missing Authorization header or API token. Provide 'Authorization: Bearer <API_TOKEN>'",
      statusCode: 401,
    };
  }

  const apiToken = await prisma.apiToken.findUnique({
    where: { token: tokenStr },
    include: { operator: true },
  });

  if (!apiToken) {
    return {
      valid: false,
      error: "Invalid API Token",
      statusCode: 401,
    };
  }

  if (apiToken.operator.status !== "ACTIVE") {
    return {
      valid: false,
      error: "Operator account is suspended or inactive",
      statusCode: 403,
    };
  }

  // Check IP Whitelist if configured
  if (apiToken.ipWhitelist && apiToken.ipWhitelist.trim() !== "") {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const allowedIps = apiToken.ipWhitelist.split(",").map((ip) => ip.trim());
    const isAllowed =
      allowedIps.includes("*") ||
      allowedIps.includes(clientIp) ||
      clientIp === "127.0.0.1" ||
      clientIp === "::1" ||
      clientIp === "localhost";

    if (!isAllowed) {
      return {
        valid: false,
        error: `IP address ${clientIp} is not in the whitelist for this API Token`,
        statusCode: 403,
      };
    }
  }

  return {
    valid: true,
    operator: apiToken.operator,
    apiToken,
  };
}
