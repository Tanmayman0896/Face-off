import { cookies } from "next/headers";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "auth_session";
const SESSION_SECRET = process.env.NEON_AUTH_COOKIE_SECRET || "default-faceoff-secret-key-32bytes-min";

export interface AuthSession {
  userId: string;
  email?: string;
  createdAt: number;
}

function sign(payload: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(payload);
  const signature = hmac.digest("hex");
  return `${payload}.${signature}`;
}

function verify(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");
  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return payload;
  }
  return null;
}

export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payloadStr = verify(token);
    if (!payloadStr) return null;

    const decoded = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf-8"));
    if (!decoded.userId) return null;

    return {
      userId: decoded.userId,
      email: decoded.email,
      createdAt: decoded.createdAt,
    };
  } catch (error) {
    console.error("Error reading auth session:", error);
    return null;
  }
}

export async function createAuthSession(userId: string, email?: string): Promise<void> {
  const sessionData = {
    userId,
    email,
    createdAt: Date.now(),
  };
  const payloadBase64 = Buffer.from(JSON.stringify(sessionData)).toString("base64url");
  const token = sign(payloadBase64);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function destroyAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentTeam() {
  const session = await getAuthSession();
  if (!session?.userId) {
    return null;
  }

  const teamList = await db
    .select()
    .from(teams)
    .where(eq(teams.authUserId, session.userId))
    .limit(1);

  if (teamList.length === 0) {
    return null;
  }

  return teamList[0];
}
