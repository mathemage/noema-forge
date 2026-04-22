import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/auth", () => ({
  handlers: {
    GET: vi.fn(() => Response.json({ ok: true })),
    POST: vi.fn(() => Response.json({ ok: true })),
  },
}));

vi.mock("@/lib/env", () => ({
  usesAuthJsCredentials: vi.fn(),
}));

import { GET, POST } from "@/app/api/auth/[...nextauth]/route";
import { handlers } from "@/auth";
import { usesAuthJsCredentials } from "@/lib/env";

afterEach(() => {
  vi.clearAllMocks();
});

describe("/api/auth/[...nextauth]", () => {
  it("returns 404 when the optional Auth.js mode is disabled", async () => {
    vi.mocked(usesAuthJsCredentials).mockReturnValue(false);

    const response = await GET(
      new NextRequest("http://127.0.0.1:3000/api/auth/session"),
    );

    expect(response.status).toBe(404);
    expect(handlers.GET).not.toHaveBeenCalled();
  });

  it("delegates to Auth.js handlers when the optional mode is enabled", async () => {
    vi.mocked(usesAuthJsCredentials).mockReturnValue(true);

    await POST(new NextRequest("http://127.0.0.1:3000/api/auth/signin"));

    expect(handlers.POST).toHaveBeenCalledTimes(1);
  });
});
