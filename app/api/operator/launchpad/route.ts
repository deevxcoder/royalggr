import { NextRequest, NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { launchNexxGame, encryptNexxPayload, decryptNexxPayload, DEFAULT_NEXX_SECRET } from "@/lib/nexxApi";

export async function GET(req: NextRequest) {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active providers that have games
    const providers = await prisma.externalProvider.findMany({
      where: { isActive: true },
      orderBy: { brandId: "asc" },
      include: {
        games: {
          where: { isActive: true },
          select: { gameUid: true, name: true, category: true, gameId: true },
          orderBy: { name: "asc" },
        },
      },
    });

    const formattedProviders = providers.map((p) => ({
      brandId: p.brandId,
      name: p.name,
      type: p.type,
      gameCount: p.games.length,
      games: p.games.map((g) => ({
        gameUid: g.gameUid,
        name: g.name,
        category: g.category,
        gameId: g.gameId,
      })),
    }));

    // Find operator's primary API token and secret
    const tokenRecord = await prisma.apiToken.findFirst({
      where: { operatorId: operator.id, isLive: true },
    });

    return NextResponse.json({
      success: true,
      operator: {
        id: operator.id,
        email: operator.email,
        companyName: operator.companyName,
        apiToken: tokenRecord?.token || "roy_live_demo1234567890abcdef",
        apiSecret: tokenRecord?.secretKey || "sec_royal_master_demo_secret_2026",
      },
      providers: formattedProviders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action || "launch";

    // 1. ACTION: TEST LAUNCH
    if (action === "launch") {
      const { gameUid, userId, balance, callbackUrl, currency } = body;
      if (!gameUid) {
        return NextResponse.json({ error: "gameUid is required" }, { status: 400 });
      }

      const startTime = Date.now();

      // Check game record
      const gameRecord = await prisma.externalGame.findUnique({
        where: { gameUid: String(gameUid) },
        include: { provider: true },
      });

      const provider = gameRecord?.provider;
      const studioBaseUrl = process.env.ROYAL_STUDIO_URL || "http://localhost:3002";
      let launchUrl = "";

      if (String(gameUid).startsWith("royal_")) {
        // Native Royal Studio Game
        const sessionId = `sess_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
        launchUrl = `${studioBaseUrl}/play/${sessionId}?game=${gameUid}&returnUrl=${encodeURIComponent(
          "https://royalggr.com/portal/launchpad"
        )}`;
      } else {
        // Aggregated External Game (NexxAPI)
        const launchResult = await launchNexxGame({
          apiUrl: provider?.apiUrl || undefined,
          token: provider?.apiToken || undefined,
          secret: provider?.apiSecret || undefined,
          userId: userId || "test-player-1",
          balance: Number(balance) || 100,
          gameUid: String(gameUid),
          currency: currency || "INR",
          callbackUrl: callbackUrl || "https://royalggr.com/api/callback",
          returnUrl: "https://royalggr.com/portal/launchpad",
        });

        if (launchResult.success && launchResult.launchUrl) {
          launchUrl = launchResult.launchUrl;
        } else {
          // Fallback URL if upstream offline
          const sessionId = `sess_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
          launchUrl = `${studioBaseUrl}/play/${sessionId}?game=${gameUid}&returnUrl=${encodeURIComponent(
            "https://royalggr.com/portal/launchpad"
          )}`;
        }
      }

      const durationMs = Date.now() - startTime;
      const sessionId = `sess_${Math.random().toString(36).substring(2, 10)}`;

      return NextResponse.json({
        ok: true,
        url: launchUrl,
        durationMs,
        sessionId,
        gameUid,
        gameName: gameRecord?.name || gameUid,
        providerName: gameRecord?.provider?.name || "Aggregated Studio",
      });
    }

    // 2. ACTION: CHECK ENCRYPTION
    if (action === "check-payload") {
      const { ciphertext, secret } = body;
      if (!ciphertext || !ciphertext.trim()) {
        return NextResponse.json({ error: "Please enter Base64 ciphertext" }, { status: 400 });
      }

      try {
        const decrypted = decryptNexxPayload(ciphertext.trim(), secret || DEFAULT_NEXX_SECRET);
        return NextResponse.json({
          ok: true,
          decrypted,
          valid: true,
        });
      } catch (err: any) {
        return NextResponse.json({
          ok: false,
          error: `Decryption failed: ${err.message || "Invalid ciphertext or AES key"}`,
        });
      }
    }

    // 3. ACTION: REFERENCE PAYLOAD GENERATION
    if (action === "sample-payload") {
      const { gameUid, userId, balance, token, secret } = body;
      const sampleToken = token || "roy_live_demo1234567890abcdef";
      const sampleSecret = secret || DEFAULT_NEXX_SECRET;

      const plaintextPayload = {
        user_id: userId || "test-player-1",
        balance: Number(balance) || 100,
        game_uid: gameUid || "10509",
        token: sampleToken,
        timestamp: Date.now(),
        return: "https://your-site.com/lobby",
        callback: "https://your-site.com/api/callback",
      };

      const encrypted = encryptNexxPayload(plaintextPayload, sampleSecret);

      const curl = `curl -X POST https://api.nexxapi.tech/api/v1 \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ token: sampleToken, payload: encrypted })}'`;

      return NextResponse.json({
        ok: true,
        plaintext: plaintextPayload,
        encrypted,
        curl,
        note: "This request is pre-signed with your test credentials and ready to execute.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
