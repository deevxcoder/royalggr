import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/apiKeyAuth";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateApiRequest(req);
    if (!auth.valid) {
      return NextResponse.json(
        { status: 0, error: auth.error || "Unauthorized" },
        { status: auth.statusCode || 401 }
      );
    }

    return NextResponse.json({
      status: 1,
      data: {
        operator_id: auth.operator.id,
        company_name: auth.operator.companyName,
        email: auth.operator.email,
        balance: auth.operator.balance,
        currency: auth.operator.currency,
        ggr_rate_pct: auth.operator.ggrRate,
        status: auth.operator.status,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ status: 0, error: err.message || "Internal server error" }, { status: 500 });
  }
}
