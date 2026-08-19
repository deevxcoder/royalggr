import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/apiKeyAuth";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateApiRequest(req);
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!auth.valid) {
      return NextResponse.json(
        {
          status: 0,
          client_ip: clientIp,
          authenticated: false,
          error: auth.error,
        },
        { status: auth.statusCode || 401 }
      );
    }

    return NextResponse.json({
      status: 1,
      authenticated: true,
      client_ip: clientIp,
      operator: {
        id: auth.operator.id,
        company_name: auth.operator.companyName,
        email: auth.operator.email,
        ggr_balance: auth.operator.balance,
        currency: auth.operator.currency,
      },
      token: {
        name: auth.apiToken.name,
        is_live: auth.apiToken.isLive,
        ip_whitelist: auth.apiToken.ipWhitelist || "ALL_IPS_ALLOWED (*)",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message || "Internal server error" }, { status: 500 });
  }
}
