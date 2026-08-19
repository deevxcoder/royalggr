import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    const parsed = new URL(imageUrl);
    if (!parsed.hostname.includes("nexxapi.tech") && !parsed.hostname.includes("ibb.co") && !parsed.hostname.includes("unsplash.com")) {
      return new NextResponse("Forbidden domain", { status: 403 });
    }

    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) {
      return new NextResponse("Failed to fetch upstream image", { status: res.status });
    }

    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/png";

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Media proxy error:", error.message);
    return new NextResponse("Failed to load image", { status: 502 });
  }
}
