import type { Session } from "next-auth";
import { describe, expect, it } from "vitest";
import { getAuthUserFromAuthJsSession } from "@/lib/auth/authjs-session";

function createSession(overrides?: Partial<Session["user"]>): Session {
  return {
    expires: "2030-01-01T00:00:00.000Z",
    user: {
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      ...overrides,
    },
  };
}

describe("getAuthUserFromAuthJsSession", () => {
  it("maps a valid Auth.js session to an AuthUser", () => {
    expect(getAuthUserFromAuthJsSession(createSession())).toEqual({
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    });
  });

  it("returns null when id or email is missing", () => {
    expect(getAuthUserFromAuthJsSession(createSession({ email: "" }))).toBeNull();
    expect(getAuthUserFromAuthJsSession(createSession({ id: "" }))).toBeNull();
  });

  it("returns null when createdAt or updatedAt is invalid", () => {
    expect(
      getAuthUserFromAuthJsSession(
        createSession({
          createdAt: "not-a-date" as unknown as Date,
        }),
      ),
    ).toBeNull();

    expect(
      getAuthUserFromAuthJsSession(
        createSession({
          updatedAt: "not-a-date" as unknown as Date,
        }),
      ),
    ).toBeNull();
  });
});
