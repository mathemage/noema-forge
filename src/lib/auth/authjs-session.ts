import type { Session } from "next-auth";
import type { AuthUser } from "@/lib/auth/service";

function parseSessionDate(value: Date | string | undefined) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getAuthUserFromAuthJsSession(
  session: Session | null | undefined,
): AuthUser | null {
  const user = session?.user;

  if (!user?.id || !user.email) {
    return null;
  }

  const createdAt = parseSessionDate(user.createdAt);
  const updatedAt = parseSessionDate(user.updatedAt);

  if (!createdAt || !updatedAt) {
    return null;
  }

  return {
    createdAt,
    displayName: user.displayName ?? null,
    email: user.email,
    id: user.id,
    updatedAt,
  };
}
