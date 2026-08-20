import axios from "axios";

export interface LaunchStudioGameParams {
  apiUrl?: string;
  apiToken?: string;
  apiSecret?: string;
  userId: string;
  gameUid: string;
  balance: number;
  currency?: string;
  callbackUrl?: string;
  returnUrl?: string;
}

export interface LaunchStudioGameResult {
  success: boolean;
  launchUrl?: string;
  sessionId?: string;
  error?: string;
}

export async function launchRoyalStudioGame(params: LaunchStudioGameParams): Promise<LaunchStudioGameResult> {
  const studioApiUrl = (params.apiUrl || process.env.ROYAL_STUDIO_URL || "http://localhost:3002").replace(/\/$/, "");
  const endpoint = studioApiUrl.endsWith("/api/v1") ? `${studioApiUrl}/launch` : `${studioApiUrl}/api/v1/launch`;

  const token = params.apiToken || process.env.ROYAL_STUDIO_TOKEN || "rgs_live_royalggr_master_2026";
  const secret = params.apiSecret || process.env.ROYAL_STUDIO_SECRET || "rgs_sec_royalggr_master_secret_2026";

  try {
    const res = await axios.post(
      endpoint,
      {
        user_id: params.userId,
        game_uid: params.gameUid,
        balance: params.balance,
        currency: params.currency || "INR",
        callback_url: params.callbackUrl,
        return_url: params.returnUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-secret-key": secret,
          "Content-Type": "application/json",
        },
        timeout: 8000,
      }
    );

    if (res.data?.status === 1 && res.data?.data?.launch_url) {
      return {
        success: true,
        launchUrl: res.data.data.launch_url,
        sessionId: res.data.data.session_id,
      };
    }

    return {
      success: false,
      error: res.data?.error || "Failed to launch game from Royal Studio API",
    };
  } catch (err: any) {
    console.error("Error calling Royal Games Studio API:", err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data?.error || err.message || "Studio API Gateway connection error",
    };
  }
}
