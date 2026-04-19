import { NextRequest, NextResponse } from "next/server";
import {
  deleteSessionByToken,
  getClearedSessionCookie,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { getRequestUrl } from "@/lib/request-url";

export async function POST(request: NextRequest) {
  await deleteSessionByToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  const response = NextResponse.redirect(
    getRequestUrl("/sign-in?message=signed-out"),
    303,
  );

  response.cookies.set(getClearedSessionCookie(request));

  return response;
}
