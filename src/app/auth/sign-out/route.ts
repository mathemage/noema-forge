import { NextRequest } from "next/server";
import {
  deleteSessionByToken,
  getClearedSessionCookie,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { redirectToRequestOrigin } from "@/lib/request-url";

export async function POST(request: NextRequest) {
  await deleteSessionByToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  const response = redirectToRequestOrigin("/sign-in?message=signed-out");

  response.cookies.set(getClearedSessionCookie(request));

  return response;
}
