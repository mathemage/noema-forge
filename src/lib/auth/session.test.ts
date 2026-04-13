import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getClearedSessionCookie, getSessionCookie } from "@/lib/auth/session";

const expiresAt = new Date("2030-01-01T00:00:00.000Z");

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("session cookie helpers", () => {
  it("keeps local HTTP app cookies non-secure", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://127.0.0.1:3000");

    const cookie = getSessionCookie("session-token", expiresAt);

    expect(cookie.secure).toBe(false);
  });

  it("marks cookies secure for HTTPS app URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://journal.example.com");

    const cookie = getSessionCookie("session-token", expiresAt);

    expect(cookie.secure).toBe(true);
  });

  it("uses the current request origin when deciding cookie security", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://journal.example.com");

    const cookie = getSessionCookie(
      "session-token",
      expiresAt,
      new NextRequest("http://127.0.0.1:3000/auth/register", {
        method: "POST",
      }),
    );

    expect(cookie.secure).toBe(false);
  });

  it("preserves secure cookies when a proxy forwards HTTPS requests", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://127.0.0.1:3000");

    const cookie = getClearedSessionCookie(
      new NextRequest("http://127.0.0.1:3000/auth/sign-out", {
        headers: {
          "x-forwarded-host": "journal.example.com",
          "x-forwarded-proto": "https",
        },
        method: "POST",
      }),
    );

    expect(cookie.secure).toBe(true);
    expect(cookie.maxAge).toBe(0);
  });
});
