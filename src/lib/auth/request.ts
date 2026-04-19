import type { NextRequest } from "next/server";
import { getUserBySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export function getSessionTokenFromRequest(request: NextRequest) {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value;
}

export async function getRequestUser(request: NextRequest) {
  return getUserBySessionToken(getSessionTokenFromRequest(request));
}
