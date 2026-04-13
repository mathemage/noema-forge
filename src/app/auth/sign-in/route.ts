import { NextRequest, NextResponse } from "next/server";
import { AuthError, authenticateUser } from "@/lib/auth/service";
import { createUserSession, getSessionCookie } from "@/lib/auth/session";
import { getRequestUrl } from "@/lib/request-url";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  try {
    const user = await authenticateUser({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    const session = await createUserSession(user.id);
    const response = NextResponse.redirect(getRequestUrl(request, "/"), 303);

    response.cookies.set(getSessionCookie(session.token, session.expiresAt));

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.redirect(
        getRequestUrl(request, `/sign-in?error=${error.code}`),
        303,
      );
    }

    throw error;
  }
}
