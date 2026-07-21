import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth/session", () => ({
  deleteSessionByToken: vi.fn(),
  getClearedSessionCookie: vi.fn(() => ({
    expires: new Date(0),
    httpOnly: true,
    maxAge: 0,
    name: "noema_forge_session",
    path: "/",
    sameSite: "lax" as const,
    secure: false,
    value: "",
  })),
  SESSION_COOKIE_NAME: "noema_forge_session",
}));

import { POST } from "@/app/auth/sign-out/route";
import { deleteSessionByToken, getClearedSessionCookie } from "@/lib/auth/session";

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /auth/sign-out", () => {
  it("clears the session cookie and redirects on the Vercel Preview origin", async () => {
    const response = await POST(
      new NextRequest(
        "https://noema-forge-git-fix-redirects.vercel.app/auth/sign-out",
        {
          headers: {
            cookie: "noema_forge_session=session-token",
            origin: "https://attacker.example.com",
            "x-forwarded-host": "attacker.example.com",
            "x-forwarded-proto": "http",
          },
          method: "POST",
        },
      ),
    );
    const locationHeader = response.headers.get("location") ?? "";
    const location = new URL(
      locationHeader,
      "https://noema-forge-git-fix-redirects.vercel.app",
    );

    expect(response.status).toBe(303);
    expect(locationHeader).toBe("/sign-in?message=signed-out");
    expect(location.origin).toBe(
      "https://noema-forge-git-fix-redirects.vercel.app",
    );
    expect(location.pathname).toBe("/sign-in");
    expect(location.search).toBe("?message=signed-out");
    expect(deleteSessionByToken).toHaveBeenCalledWith("session-token");
    expect(getClearedSessionCookie).toHaveBeenCalledWith(expect.any(NextRequest));
    expect(response.cookies.get("noema_forge_session")?.value).toBe("");
  });
});
