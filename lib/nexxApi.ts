import crypto from "crypto";

export const DEFAULT_NEXX_API_URL = "https://api.nexxapi.tech/api/v1";
export const DEFAULT_NEXX_TOKEN = "79b49f0e7f96cb36a53abeba98126bc7";
export const DEFAULT_NEXX_SECRET = "67d048e3b071c6e06177054ea7062647";

/**
 * Encrypt launch payload using AES-256-ECB with PKCS7 padding, returned as Base64 string.
 */
export function encryptNexxPayload(payload: object, secret: string = DEFAULT_NEXX_SECRET): string {
  const json = JSON.stringify(payload);
  const cipher = crypto.createCipheriv("aes-256-ecb", Buffer.from(secret, "utf8"), null);
  cipher.setAutoPadding(true);
  return Buffer.concat([cipher.update(json, "utf8"), cipher.final()]).toString("base64");
}

/**
 * Decrypt incoming encrypted webhook payload from NexxAPI.
 */
export function decryptNexxPayload(b64Ciphertext: string, secret: string = DEFAULT_NEXX_SECRET): any {
  const decipher = crypto.createDecipheriv("aes-256-ecb", Buffer.from(secret, "utf8"), null);
  decipher.setAutoPadding(true);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(b64Ciphertext, "base64")), decipher.final()]).toString("utf8");
  return JSON.parse(decrypted);
}

/**
 * Fetch live provider list from NexxAPI upstream aggregator.
 */
export async function fetchNexxProviders(
  apiUrl: string = DEFAULT_NEXX_API_URL,
  token: string = DEFAULT_NEXX_TOKEN
): Promise<any[]> {
  try {
    const url = `${apiUrl.replace(/\/$/, "")}/providers?token=${token}`;
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    const json = await res.json();
    if (json.code === 0 && json.data?.providers) {
      return json.data.providers;
    }
    return [];
  } catch (err) {
    console.error("fetchNexxProviders Error:", err);
    return [];
  }
}

/**
 * Fetch live games list from NexxAPI upstream aggregator.
 */
export async function fetchNexxGames(
  apiUrl: string = DEFAULT_NEXX_API_URL,
  token: string = DEFAULT_NEXX_TOKEN,
  brandId?: number,
  limit: number = 200,
  offset: number = 0
): Promise<{ total: number; games: any[] }> {
  try {
    const params = new URLSearchParams({
      token,
      limit: String(limit),
      offset: String(offset),
    });
    if (brandId) params.append("brand_id", String(brandId));

    const url = `${apiUrl.replace(/\/$/, "")}/games?${params.toString()}`;
    const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
    const json = await res.json();
    if (json.code === 0 && json.data?.games) {
      return {
        total: json.data.total || json.data.games.length,
        games: json.data.games,
      };
    }
    return { total: 0, games: [] };
  } catch (err) {
    console.error("fetchNexxGames Error:", err);
    return { total: 0, games: [] };
  }
}

/**
 * Request real live game launch URL from NexxAPI using encrypted AES-256-ECB payload.
 */
export async function launchNexxGame(params: {
  apiUrl?: string;
  token?: string;
  secret?: string;
  userId: string;
  balance: number;
  gameUid: string;
  currency?: string;
  callbackUrl: string;
  returnUrl: string;
}): Promise<{ success: boolean; launchUrl?: string; error?: string }> {
  try {
    const apiUrl = (params.apiUrl && params.apiUrl.trim()) ? params.apiUrl : DEFAULT_NEXX_API_URL;
    const token = (params.token && params.token.trim()) ? params.token : DEFAULT_NEXX_TOKEN;
    const secret = (params.secret && params.secret.trim()) ? params.secret : DEFAULT_NEXX_SECRET;

    // NexxAPI requires both callback and return URLs to start with https://
    let callbackUrl = params.callbackUrl;
    if (!callbackUrl.startsWith("https://")) {
      callbackUrl = "https://royalggr.com/api/callback";
    }

    let returnUrl = params.returnUrl;
    if (!returnUrl.startsWith("https://")) {
      returnUrl = "https://royalggr.com";
    }

    const unencryptedPayload = {
      user_id: params.userId,
      balance: Number(params.balance) || 1000,
      game_uid: params.gameUid,
      token,
      timestamp: Date.now(),
      return: returnUrl,
      callback: callbackUrl,
    };

    const encryptedPayload = encryptNexxPayload(unencryptedPayload, secret);

    const postEndpoint = apiUrl.replace(/\/$/, "");
    const res = await fetch(postEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        payload: encryptedPayload,
      }),
    });

    const json = await res.json();
    if (json.code === 0 && json.data?.url) {
      return {
        success: true,
        launchUrl: json.data.url,
      };
    }

    return {
      success: false,
      error: json.msg || json.error || "NexxAPI game launch failed",
    };
  } catch (err: any) {
    console.error("launchNexxGame Error:", err);
    return {
      success: false,
      error: err.message || "Upstream NexxAPI connection failed",
    };
  }
}
