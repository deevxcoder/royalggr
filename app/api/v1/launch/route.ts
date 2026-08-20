import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/apiKeyAuth";
import { prisma } from "@/lib/prisma";
import { signGameSession } from "@/lib/auth";
import { launchNexxGame } from "@/lib/nexxApi";
import { launchRoyalStudioGame } from "@/lib/studioClient";
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

    // Check if operator disabled this game
    const isGameDisabled = await prisma.operatorGameToggle.findFirst({
      where: {
        operatorId: auth.operator.id,
        gameUid: selectedGame,
        isEnabled: false,
      },
    });

    if (isGameDisabled) {
      return NextResponse.json(
        {
          status: 0,
          error: `Game '${selectedGame}' is currently disabled in your operator portal catalog.`,
        },
        { status: 403 }
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

    if (String(selectedGame).startsWith("royal_") || gameRecord?.provider?.type === "ROYAL_NATIVE") {
      // Standardized REST API call to Royal Games Studio (Port 3002)
      const provider = gameRecord?.provider;
      const studioLaunch = await launchRoyalStudioGame({
        apiUrl: provider?.apiUrl || undefined,
        apiToken: provider?.apiToken || undefined,
        apiSecret: provider?.apiSecret || undefined,
        userId: sessionRecord.userId,
        balance: sessionRecord.balance,
        gameUid: selectedGame,
        currency: sessionRecord.currency,
        callbackUrl: callback_url || "http://localhost:3000/api/callback",
        returnUrl: return_url,
      });

      if (studioLaunch.success && studioLaunch.launchUrl) {
        launchUrl = studioLaunch.launchUrl;
      } else {
        throw new Error(studioLaunch.error || "Failed to launch game from Studio API Gateway");
      }
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

      if (nexxLaunch.success && nexxLaunch.launchUrl) {
        launchUrl = nexxLaunch.launchUrl;
      } else {
        throw new Error(nexxLaunch.error || "External game launch failed");
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
