import { afterEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/db/client";

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

import { AuthError, authenticateUser, registerUser } from "@/lib/auth/service";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const AUTH_USER = {
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  displayName: null,
  email: "user@example.com",
  id: "user-1",
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

afterEach(() => {
  vi.clearAllMocks();
});

function createRegisterDb({
  existingUsers = [],
  insertError,
  insertedUsers = [AUTH_USER],
}: {
  existingUsers?: Array<{ id: string }>;
  insertError?: unknown;
  insertedUsers?: Array<typeof AUTH_USER>;
}) {
  return {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: insertError
          ? vi.fn().mockRejectedValue(insertError)
          : vi.fn().mockResolvedValue(insertedUsers),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(existingUsers),
        }),
      }),
    }),
  } as unknown as Database;
}

function createAuthenticateDb(user: (typeof AUTH_USER & { passwordHash: string | null }) | undefined) {
  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(user ? [user] : []),
        }),
      }),
    }),
  } as unknown as Database;
}

describe("registerUser", () => {
  it("creates a user with a hashed password", async () => {
    vi.mocked(hashPassword).mockResolvedValue("hashed-password");
    const db = createRegisterDb({});

    await expect(
      registerUser(
        {
          email: "USER@example.com",
          password: "journal-pass-123",
        },
        db,
      ),
    ).resolves.toEqual(AUTH_USER);
  });

  it("rejects duplicate emails found before insert", async () => {
    const db = createRegisterDb({
      existingUsers: [{ id: "existing-user" }],
    });

    await expect(
      registerUser(
        {
          email: "user@example.com",
          password: "journal-pass-123",
        },
        db,
      ),
    ).rejects.toMatchObject({ code: "email-taken" satisfies AuthError["code"] });
  });

  it("translates insert unique violations into email-taken", async () => {
    vi.mocked(hashPassword).mockResolvedValue("hashed-password");
    const db = createRegisterDb({
      insertError: {
        code: "23505",
        constraint_name: "users_email_unique",
      },
    });

    await expect(
      registerUser(
        {
          email: "user@example.com",
          password: "journal-pass-123",
        },
        db,
      ),
    ).rejects.toMatchObject({ code: "email-taken" satisfies AuthError["code"] });
  });
});

describe("authenticateUser", () => {
  it("rejects users without a password hash", async () => {
    const db = createAuthenticateDb({
      ...AUTH_USER,
      passwordHash: null,
    });

    await expect(
      authenticateUser(
        {
          email: "user@example.com",
          password: "journal-pass-123",
        },
        db,
      ),
    ).rejects.toMatchObject({
      code: "invalid-credentials" satisfies AuthError["code"],
    });
  });

  it("returns the user when the password is valid", async () => {
    vi.mocked(verifyPassword).mockResolvedValue(true);
    const db = createAuthenticateDb({
      ...AUTH_USER,
      passwordHash: "stored-hash",
    });

    await expect(
      authenticateUser(
        {
          email: "user@example.com",
          password: "journal-pass-123",
        },
        db,
      ),
    ).resolves.toEqual(AUTH_USER);
  });
});
