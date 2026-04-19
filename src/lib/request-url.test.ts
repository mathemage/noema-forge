import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getRequestOrigin, getRequestUrl } from "@/lib/request-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("request URL helpers", () => {
  it("builds redirect URLs from the configured app origin", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://journal.example.com");

    expect(getRequestUrl("/sign-in?message=signed-out").toString()).toBe(
      "https://journal.example.com/sign-in?message=signed-out",
    );
  });

  it("normalizes comma-separated forwarded headers", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.com");

    const request = new NextRequest("http://127.0.0.1:3000/auth/sign-out", {
      headers: {
        "x-forwarded-host": "journal.example.com,proxy.internal",
        "x-forwarded-proto": "https,http",
      },
    });

    expect(getRequestOrigin(request)).toBe("https://journal.example.com");
  });

  it("falls back to the configured origin for invalid forwarded protocols", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.com");

    const request = new NextRequest("http://127.0.0.1:3000/auth/sign-out", {
      headers: {
        "x-forwarded-host": "journal.example.com",
        "x-forwarded-proto": "javascript",
      },
    });

    expect(getRequestOrigin(request)).toBe("https://app.example.com");
  });
});
