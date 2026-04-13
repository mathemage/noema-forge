import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/service", () => ({
  AuthError: class AuthError extends Error {
    code: string;

    constructor(code: string) {
      super(code);
      this.code = code;
      this.name = "AuthError";
    }
  },
  authenticateUser: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  createUserSession: vi.fn(),
  getSessionCookie: vi.fn(() => ({
    expires: new Date("2030-01-01T00:00:00.000Z"),
    httpOnly: true,
    name: "noema_forge_session",
    path: "/",
    sameSite: "lax" as const,
    secure: false,
    value: "session-token",
  })),
}));

import { POST } from "@/app/auth/sign-in/route";
import { authenticateUser, AuthError } from "@/lib/auth/service";
import { createUserSession, getSessionCookie } from "@/lib/auth/session";

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /auth/sign-in", () => {
  it("creates a session and redirects home when credentials are valid", async () => {
    const expiresAt = new Date("2030-01-01T00:00:00.000Z");

    vi.mocked(authenticateUser).mockResolvedValue({
      createdAt: new Date(),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date(),
    });
    vi.mocked(createUserSession).mockResolvedValue({
      expiresAt,
      token: "session-token",
    });

    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "journal-pass-123");

    const response = await POST(
      new NextRequest("http://127.0.0.1:3000/auth/sign-in", {
        body: formData,
        method: "POST",
      }),
    );
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(303);
    expect(location.pathname).toBe("/");
    expect(location.search).toBe("");
    expect(response.cookies.get("noema_forge_session")?.value).toBe("session-token");
    expect(authenticateUser).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "journal-pass-123",
    });
    expect(createUserSession).toHaveBeenCalledWith("user-1");
    expect(getSessionCookie).toHaveBeenCalledWith(
      "session-token",
      expiresAt,
      expect.any(NextRequest),
    );
  });

  it("redirects back to sign-in when credentials are invalid", async () => {
    vi.mocked(authenticateUser).mockRejectedValue(
      new AuthError("invalid-credentials"),
    );

    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "journal-pass-123");

    const response = await POST(
      new NextRequest("http://127.0.0.1:3000/auth/sign-in", {
        body: formData,
        method: "POST",
      }),
    );
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(303);
    expect(location.pathname).toBe("/sign-in");
    expect(location.search).toBe("?error=invalid-credentials");
  });
});
