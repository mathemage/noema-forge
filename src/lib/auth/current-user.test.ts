import { afterEach, describe, expect, it, vi } from "vitest";

const { auth, cookies } = vi.hoisted(() => ({
  auth: vi.fn(),
  cookies: vi.fn(),
}));

const { getUserBySessionToken } = vi.hoisted(() => ({
  getUserBySessionToken: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth,
}));

vi.mock("next/headers", () => ({
  cookies,
}));

vi.mock("@/lib/auth/session", () => ({
  getUserBySessionToken,
  SESSION_COOKIE_NAME: "noema_forge_session",
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("getCurrentUser", () => {
  it("does not consult Auth.js sessions in journal mode", async () => {
    vi.stubEnv("AUTH_SIGN_IN_MODE", "journal");
    cookies.mockResolvedValue({
      get: vi.fn(() => undefined),
    });
    vi.mocked(getUserBySessionToken).mockResolvedValue(null);

    const { getCurrentUser } = await import("@/lib/auth/current-user");

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(auth).not.toHaveBeenCalled();
  });

  it("falls back to Auth.js sessions when the optional mode is enabled", async () => {
    vi.stubEnv("AUTH_SIGN_IN_MODE", "authjs-credentials");
    cookies.mockResolvedValue({
      get: vi.fn(() => undefined),
    });
    vi.mocked(getUserBySessionToken).mockResolvedValue(null);
    vi.mocked(auth).mockResolvedValue({
      expires: "2030-01-01T00:00:00.000Z",
      user: {
        createdAt: "2024-01-01T00:00:00.000Z",
        displayName: null,
        email: "user@example.com",
        id: "user-1",
        updatedAt: "2024-01-02T00:00:00.000Z",
      },
    });

    const { getCurrentUser } = await import("@/lib/auth/current-user");

    await expect(getCurrentUser()).resolves.toEqual({
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date("2024-01-02T00:00:00.000Z"),
    });
    expect(auth).toHaveBeenCalledTimes(1);
  });
});
