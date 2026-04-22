import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { getUserBySessionToken } = vi.hoisted(() => ({
  getUserBySessionToken: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getUserBySessionToken,
  SESSION_COOKIE_NAME: "noema_forge_session",
}));

import { getRequestUser } from "@/lib/auth/request";

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("getRequestUser", () => {
  it("maps an Auth.js session attached by the route wrapper", async () => {
    vi.stubEnv("AUTH_SIGN_IN_MODE", "authjs-credentials");
    vi.mocked(getUserBySessionToken).mockResolvedValue(null);

    const request = new NextRequest("http://127.0.0.1:3000/entries", {
      method: "POST",
    }) as NextRequest & {
      auth: {
        expires: string;
        user: {
          createdAt: Date;
          displayName: string | null;
          email: string;
          id: string;
          updatedAt: Date;
        };
      };
    };

    request.auth = {
      expires: "2030-01-01T00:00:00.000Z",
      user: {
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        displayName: null,
        email: "user@example.com",
        id: "user-1",
        updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      },
    };

    await expect(getRequestUser(request)).resolves.toEqual({
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    });
  });

  it("ignores an attached Auth.js session when the optional mode is disabled", async () => {
    vi.stubEnv("AUTH_SIGN_IN_MODE", "journal");
    vi.mocked(getUserBySessionToken).mockResolvedValue(null);

    const request = new NextRequest("http://127.0.0.1:3000/entries", {
      method: "POST",
    }) as NextRequest & {
      auth: {
        expires: string;
        user: {
          createdAt: Date;
          displayName: string | null;
          email: string;
          id: string;
          updatedAt: Date;
        };
      };
    };

    request.auth = {
      expires: "2030-01-01T00:00:00.000Z",
      user: {
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        displayName: null,
        email: "user@example.com",
        id: "user-1",
        updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      },
    };

    await expect(getRequestUser(request)).resolves.toBeNull();
  });

  it("prefers the first-party session over an attached Auth.js session", async () => {
    vi.stubEnv("AUTH_SIGN_IN_MODE", "authjs-credentials");
    vi.mocked(getUserBySessionToken).mockResolvedValue({
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    });

    const request = new NextRequest("http://127.0.0.1:3000/entries", {
      headers: {
        cookie: "noema_forge_session=session-token",
      },
      method: "POST",
    }) as NextRequest & {
      auth: {
        expires: string;
        user: {
          createdAt: Date;
          displayName: string | null;
          email: string;
          id: string;
          updatedAt: Date;
        };
      };
    };

    request.auth = {
      expires: "2030-01-01T00:00:00.000Z",
      user: {
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
        displayName: "Different user",
        email: "other@example.com",
        id: "user-2",
        updatedAt: new Date("2030-01-02T00:00:00.000Z"),
      },
    };

    await expect(getRequestUser(request)).resolves.toEqual({
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    });
  });
});
