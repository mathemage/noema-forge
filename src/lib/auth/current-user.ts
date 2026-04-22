import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAuthUserFromAuthJsSession } from "@/lib/auth/authjs-session";
import { getUserBySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionUser = await getUserBySessionToken(
    cookieStore.get(SESSION_COOKIE_NAME)?.value,
  );

  if (sessionUser) {
    return sessionUser;
  }

  return getAuthUserFromAuthJsSession(await auth());
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }
}
