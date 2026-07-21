import { NextRequest } from "next/server";
import { AuthError, registerUser } from "@/lib/auth/service";
import { createUserSession, getSessionCookie } from "@/lib/auth/session";
import { redirectToRequestOrigin } from "@/lib/request-url";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  try {
    const user = await registerUser({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    const session = await createUserSession(user.id);
    const response = redirectToRequestOrigin("/");

    response.cookies.set(getSessionCookie(session.token, session.expiresAt, request));

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return redirectToRequestOrigin(`/sign-in?error=${error.code}`);
    }

    throw error;
  }
}
