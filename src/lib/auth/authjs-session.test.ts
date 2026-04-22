import { describe, expect, it } from "vitest";
import { getAuthUserFromAuthJsSession } from "@/lib/auth/authjs-session";

describe("getAuthUserFromAuthJsSession", () => {
  it("maps a valid Auth.js session to an AuthUser", () => {
    expect(
      getAuthUserFromAuthJsSession({
        expires: "2030-01-01T00:00:00.000Z",
        user: {
          createdAt: "2024-01-01T00:00:00.000Z",
          displayName: null,
          email: "user@example.com",
          id: "user-1",
          updatedAt: "2024-01-02T00:00:00.000Z",
        },
      }),
    ).toEqual({
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    });
  });

  it("returns null when id or email is missing", () => {
    expect(
      getAuthUserFromAuthJsSession({
        expires: "2030-01-01T00:00:00.000Z",
        user: {
          createdAt: "2024-01-01T00:00:00.000Z",
          displayName: null,
          email: "",
          id: "user-1",
          updatedAt: "2024-01-02T00:00:00.000Z",
        },
      }),
    ).toBeNull();

    expect(
      getAuthUserFromAuthJsSession({
        expires: "2030-01-01T00:00:00.000Z",
        user: {
          createdAt: "2024-01-01T00:00:00.000Z",
          displayName: null,
          email: "user@example.com",
          id: "",
          updatedAt: "2024-01-02T00:00:00.000Z",
        },
      }),
    ).toBeNull();
  });

  it("returns null when createdAt or updatedAt is invalid", () => {
    expect(
      getAuthUserFromAuthJsSession({
        expires: "2030-01-01T00:00:00.000Z",
        user: {
          createdAt: "not-a-date",
          displayName: null,
          email: "user@example.com",
          id: "user-1",
          updatedAt: "2024-01-02T00:00:00.000Z",
        },
      }),
    ).toBeNull();

    expect(
      getAuthUserFromAuthJsSession({
        expires: "2030-01-01T00:00:00.000Z",
        user: {
          createdAt: "2024-01-01T00:00:00.000Z",
          displayName: null,
          email: "user@example.com",
          id: "user-1",
          updatedAt: "not-a-date",
        },
      }),
    ).toBeNull();
  });
});
