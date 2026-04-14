import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { getDatabase, type Database } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { credentialsSchema, type CredentialsInput } from "@/lib/auth/validation";

export type AuthErrorCode = "email-taken" | "invalid-credentials" | "invalid-input";

export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code);
    this.name = "AuthError";
  }
}

export type AuthUser = {
  createdAt: Date;
  displayName: string | null;
  email: string;
  id: string;
  updatedAt: Date;
};

const authUserSelect = {
  createdAt: users.createdAt,
  displayName: users.displayName,
  email: users.email,
  id: users.id,
  updatedAt: users.updatedAt,
};

function parseCredentials(input: CredentialsInput) {
  const result = credentialsSchema.safeParse(input);

  if (!result.success) {
    throw new AuthError("invalid-input");
  }

  return result.data;
}

function isEmailTakenError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505" &&
    "constraint_name" in error &&
    error.constraint_name === "users_email_unique"
  );
}

export async function registerUser(
  input: CredentialsInput,
  db: Database = getDatabase(),
) {
  const credentials = parseCredentials(input);
  const existingUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, credentials.email))
    .limit(1);

  if (existingUsers.length > 0) {
    throw new AuthError("email-taken");
  }

  const passwordHash = await hashPassword(credentials.password);

  try {
    const [user] = await db
      .insert(users)
      .values({
        email: credentials.email,
        id: randomUUID(),
        passwordHash,
      })
      .returning(authUserSelect);

    return user;
  } catch (error) {
    if (isEmailTakenError(error)) {
      throw new AuthError("email-taken");
    }

    throw error;
  }
}

export async function authenticateUser(
  input: CredentialsInput,
  db: Database = getDatabase(),
) {
  const credentials = parseCredentials(input);
  const [user] = await db
    .select({
      ...authUserSelect,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, credentials.email))
    .limit(1);

  if (!user || !user.passwordHash) {
    throw new AuthError("invalid-credentials");
  }

  const isValid = await verifyPassword(credentials.password, user.passwordHash);

  if (!isValid) {
    throw new AuthError("invalid-credentials");
  }

  return {
    createdAt: user.createdAt,
    displayName: user.displayName,
    email: user.email,
    id: user.id,
    updatedAt: user.updatedAt,
  };
}
