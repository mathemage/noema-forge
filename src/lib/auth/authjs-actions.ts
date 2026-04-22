"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError as NextAuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { AuthError, registerUser } from "@/lib/auth/service";
import {
  deleteSessionByToken,
  getClearedSessionCookie,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { credentialsSchema, type CredentialsInput } from "@/lib/auth/validation";
import { usesAuthJsCredentials } from "@/lib/env";

function redirectToAuthError(code: string) {
  redirect(`/sign-in?error=${code}`);
}

function parseCredentials(formData: FormData): CredentialsInput {
  const result = credentialsSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!result.success) {
    redirectToAuthError("invalid-input");
    throw new Error("unreachable");
  }

  return result.data;
}

function assertAuthJsCredentialsEnabled() {
  if (!usesAuthJsCredentials()) {
    throw new Error(
      "Auth.js credentials actions are only available when AUTH_SIGN_IN_MODE=authjs-credentials.",
    );
  }
}

async function signInWithCredentials(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (
      error instanceof NextAuthError &&
      error.type === "CredentialsSignin"
    ) {
      redirectToAuthError("invalid-credentials");
    }

    throw error;
  }
}

export async function registerWithAuthJsCredentials(formData: FormData) {
  assertAuthJsCredentialsEnabled();

  const credentials = parseCredentials(formData);

  try {
    await registerUser(credentials);
  } catch (error) {
    if (error instanceof AuthError) {
      redirectToAuthError(error.code);
    }

    throw error;
  }

  await signInWithCredentials(credentials.email, credentials.password);
}

export async function signInWithAuthJsCredentials(formData: FormData) {
  assertAuthJsCredentialsEnabled();

  const credentials = parseCredentials(formData);

  await signInWithCredentials(credentials.email, credentials.password);
}

export async function signOutWithAuthJsCredentials(formData: FormData) {
  assertAuthJsCredentialsEnabled();
  void formData;

  const cookieStore = await cookies();
  await deleteSessionByToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  cookieStore.set(getClearedSessionCookie());

  await signOut({
    redirectTo: "/sign-in?message=signed-out",
  });
}
