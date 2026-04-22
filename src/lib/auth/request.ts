import type { NextRequest } from "next/server";
import type { NextAuthRequest } from "next-auth";
import { getAuthUserFromAuthJsSession } from "@/lib/auth/authjs-session";
import { getUserBySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export function getSessionTokenFromRequest(request: NextRequest) {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value;
}

export async function getRequestUser(request: NextRequest | NextAuthRequest) {
  const sessionUser = await getUserBySessionToken(getSessionTokenFromRequest(request));

  if (sessionUser) {
    return sessionUser;
  }

  return "auth" in request ? getAuthUserFromAuthJsSession(request.auth) : null;
}
