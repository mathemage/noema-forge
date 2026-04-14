import type { NextRequest } from "next/server";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { userSessions, users } from "@/db/schema";
import { getDatabase, type Database } from "@/lib/db/client";
import { readServerEnv } from "@/lib/env";
import { getRequestOrigin } from "@/lib/request-url";
import type { AuthUser } from "@/lib/auth/service";

export const SESSION_COOKIE_NAME = "noema_forge_session";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_TTL_MS);
}

function shouldUseSecureSessionCookie(request?: NextRequest) {
  const origin = request ? getRequestOrigin(request) : readServerEnv().NEXT_PUBLIC_APP_URL;
  return new URL(origin).protocol === "https:";
}

export function getSessionCookie(
  token: string,
  expiresAt: Date,
  request?: NextRequest,
) {
  return {
    expires: expiresAt,
    httpOnly: true,
    name: SESSION_COOKIE_NAME,
    path: "/",
    sameSite: "lax" as const,
    secure: shouldUseSecureSessionCookie(request),
    value: token,
  };
}

export function getClearedSessionCookie(request?: NextRequest) {
  return {
    expires: new Date(0),
    httpOnly: true,
    maxAge: 0,
    name: SESSION_COOKIE_NAME,
    path: "/",
    sameSite: "lax" as const,
    secure: shouldUseSecureSessionCookie(request),
    value: "",
  };
}

export async function createUserSession(
  userId: string,
  db: Database = getDatabase(),
) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = getSessionExpiryDate();

  await db.insert(userSessions).values({
    expiresAt,
    id: randomUUID(),
    tokenHash: hashSessionToken(token),
    userId,
  });

  return { expiresAt, token };
}

export async function deleteSessionByToken(
  token: string | undefined,
  db?: Database,
) {
  if (!token) {
    return;
  }

  const database = db ?? getDatabase();

  await database
    .delete(userSessions)
    .where(eq(userSessions.tokenHash, hashSessionToken(token)));
}

export async function getUserBySessionToken(
  token: string | undefined,
  db?: Database,
): Promise<AuthUser | null> {
  if (!token) {
    return null;
  }

  const database = db ?? getDatabase();

  const [sessionUser] = await database
    .select({
      createdAt: users.createdAt,
      displayName: users.displayName,
      email: users.email,
      expiresAt: userSessions.expiresAt,
      id: users.id,
      updatedAt: users.updatedAt,
    })
    .from(userSessions)
    .innerJoin(users, eq(userSessions.userId, users.id))
    .where(eq(userSessions.tokenHash, hashSessionToken(token)))
    .limit(1);

  if (!sessionUser) {
    return null;
  }

  if (sessionUser.expiresAt <= new Date()) {
    await deleteSessionByToken(token, database);
    return null;
  }

  return {
    createdAt: sessionUser.createdAt,
    displayName: sessionUser.displayName,
    email: sessionUser.email,
    id: sessionUser.id,
    updatedAt: sessionUser.updatedAt,
  };
}
