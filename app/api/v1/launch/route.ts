import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/apiKeyAuth";
import { prisma } from "@/lib/prisma";
import { signGameSession } from "@/lib/auth";
import { launchNexxGame } from "@/lib/nexxApi";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateApiRequest(req);
    if (!auth.valid) {
      return NextResponse.json(
        { status: 0, error: auth.error || "Unauthorized" },
        { status: auth.statusCode || 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      user_id,
      member_account,
      game_uid,
      game_id,
      balance,
      currency = "INR",
      callback_url,
      return_url = "http://localhost:3000",
    } = body;

    const playerId = user_id || member_account;
    if (!playerId) {
      return NextResponse.json(
        { status: 0, error: "Missing required parameter: user_id (or member_account)" },
        { status: 400 }
      );
    }

    const selectedGame = game_uid || "royal_coinflip";

    // Operator GGR Balance Check
    if (auth.operator.balance <= 0) {
      return NextResponse.json(
        {
          status: 0,
          error: "Operator prepaid GGR credit depleted. Please recharge wallet in developer portal.",
        },
        { status: 402 }
      );
    }

    // Check game in external_games or native
    const gameRecord = await prisma.externalGame.findFirst({
      where: { gameUid: selectedGame },
      include: { provider: true },
    });

    // Generate unique session
    const rawSessionId = `sess_${crypto.randomUUID().replace(/-/g, "")}`;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 hours

    const sessionRecord = await prisma.gameSession.create({
      data: {
        sessionId: rawSessionId,
        operatorId: auth.operator.id,
        userId: String(playerId),
        gameUid: selectedGame,
        balance: Number(balance) || 1000,
        currency: String(currency).toUpperCase(),
        callbackUrl: callback_url || "http://localhost:3000/api/callback",
        returnUrl: return_url,
        status: "ACTIVE",
        expiresAt,
      },
    });

    const sessionJwt = signGameSession({
      sessionId: sessionRecord.sessionId,
      operatorId: auth.operator.id,
      userId: sessionRecord.userId,
      gameUid: sessionRecord.gameUid,
      currency: sessionRecord.currency,
      callbackUrl: sessionRecord.callbackUrl,
    });

    let launchUrl = "";
    const studioBaseUrl = process.env.ROYAL_STUDIO_URL || "http://localhost:3002";

    if (String(selectedGame).startsWith("royal_")) {
      // Native Royal Studio Game
      launchUrl = `${studioBaseUrl}/play/${sessionRecord.sessionId}?token=${sessionJwt}&game=${selectedGame}&returnUrl=${encodeURIComponent(
        return_url
      )}`;
    } else {
      // Aggregated External Game (e.g. JILI, Pragmatic, PG Soft, Spribe, Evolution, Hacksaw)
      const provider = gameRecord?.provider;
      const nexxLaunch = await launchNexxGame({
        apiUrl: provider?.apiUrl || undefined,
        token: provider?.apiToken || undefined,
        secret: provider?.apiSecret || undefined,
        userId: sessionRecord.userId,
        balance: sessionRecord.balance,
        gameUid: selectedGame,
        currency: sessionRecord.currency,
        callbackUrl: callback_url || "http://localhost:3000/api/callback",
        returnUrl: return_url,
      });

      console.log("NexxAPI Launch result for", selectedGame, "Provider:", provider?.name, ":", nexxLaunch);
      if (nexxLaunch.success && nexxLaunch.launchUrl) {
        launchUrl = nexxLaunch.launchUrl;
      } else {
        console.warn("NexxAPI Launch fallback:", nexxLaunch.error);
        // Fallback to local simulator studio if upstream fails or offline
        launchUrl = `${studioBaseUrl}/play/${sessionRecord.sessionId}?token=${sessionJwt}&game=${selectedGame}&returnUrl=${encodeURIComponent(
          return_url
        )}`;
      }
    }

    return NextResponse.json({
      status: 1,
      code: 0,
      msg: "Game session launched successfully",
      data: {
        session_id: sessionRecord.sessionId,
        game_uid: selectedGame,
        game_name: gameRecord?.name || selectedGame,
        provider_name: gameRecord?.provider?.name || "Aggregated Studio",
        launch_url: launchUrl,
        expires_at: expiresAt.toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Launch API Error:", err);
    return NextResponse.json({ status: 0, error: err.message || "Internal server error" }, { status: 500 });
  }
}
