import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  getRequestOrigin,
  redirectToRequestOrigin,
} from "@/lib/request-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("request URL helpers", () => {
  it("builds redirect URLs from the current Vercel Preview origin", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://noema-forge.vercel.app");

    const request = new NextRequest(
      "https://noema-forge-git-fix-redirects.vercel.app/auth/sign-out",
    );
    const response = redirectToRequestOrigin("/sign-in?message=signed-out");
    const location = response.headers.get("location") ?? "";

    expect(response.status).toBe(303);
    expect(location).toBe("/sign-in?message=signed-out");
    expect(new URL(location, request.url).toString()).toBe(
      "https://noema-forge-git-fix-redirects.vercel.app/sign-in?message=signed-out",
    );
  });

  it("uses the request host behind an HTTPS proxy", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.com");

    const request = new NextRequest("http://localhost:3000/auth/sign-out", {
      headers: {
        host: "journal.example.com",
        "x-forwarded-proto": "https,http",
      },
    });

    expect(getRequestOrigin(request)).toBe("https://journal.example.com");
  });

  it("does not let request headers override redirect destinations", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://noema-forge.vercel.app");

    const request = new NextRequest(
      "https://noema-forge-git-fix-redirects.vercel.app/auth/sign-out",
      {
        headers: {
          origin: "https://attacker.example.com",
          "x-forwarded-host": "attacker.example.com",
          "x-forwarded-proto": "http",
        },
      },
    );
    const location =
      redirectToRequestOrigin("/sign-in").headers.get("location") ?? "";

    expect(location).toBe("/sign-in");
    expect(new URL(location, request.url).origin).toBe(
      "https://noema-forge-git-fix-redirects.vercel.app",
    );
  });

  it("does not let forwarded HTTP downgrade an HTTPS request", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.example.com");

    const request = new NextRequest("https://journal.example.com/auth/sign-out", {
      headers: {
        "x-forwarded-proto": "javascript",
      },
    });

    expect(getRequestOrigin(request)).toBe("https://journal.example.com");
  });
});
