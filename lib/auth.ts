import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "royal_ggr_super_secret_jwt_key_2026";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signOperatorToken(payload: { operatorId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyOperatorToken(token: string): { operatorId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { operatorId: string; email: string };
  } catch {
    return null;
  }
}

export async function getCurrentOperator() {
  const cookieStore = await cookies();
  const token = cookieStore.get("royalggr_operator_token")?.value;
  if (!token) return null;

  const decoded = verifyOperatorToken(token);
  if (!decoded) return null;

  const operator = await prisma.operator.findUnique({
    where: { id: decoded.operatorId },
    include: {
      tokens: { orderBy: { createdAt: "desc" } },
    },
  });

  return operator;
}

export function generateApiKey(): { token: string; secretKey: string } {
  const tokenBytes = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
  ).join("");
  const secretBytes = Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
  ).join("");

  return {
    token: `roy_live_${tokenBytes}`,
    secretKey: `sec_${secretBytes}`,
  };
}

export function signGameSession(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyGameSession(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
