import { afterEach, describe, expect, it, vi } from "vitest";

const { credentialsProvider, nextAuth } = vi.hoisted(() => ({
  credentialsProvider: vi.fn((config) => config),
  nextAuth: vi.fn(() => ({
    auth: vi.fn(),
    handlers: {
      GET: vi.fn(),
      POST: vi.fn(),
    },
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

vi.mock("next-auth", () => ({
  default: nextAuth,
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: credentialsProvider,
}));

vi.mock("@/lib/auth/service", () => ({
  AuthError: class AuthError extends Error {},
  authenticateUser: vi.fn(),
}));

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("auth configuration", () => {
  it("passes static config to NextAuth so route wrappers stay synchronous", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_NAME", "NoemaForge");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://127.0.0.1:3000");

    await import("@/auth");

    expect(nextAuth).toHaveBeenCalledTimes(1);
    expect(typeof vi.mocked(nextAuth).mock.calls[0]?.[0]).toBe("object");
  });

  it("only adds the credentials provider when the optional mode is enabled", async () => {
    vi.stubEnv("AUTH_SECRET", "test-secret");
    vi.stubEnv("AUTH_SIGN_IN_MODE", "authjs-credentials");
    vi.stubEnv("NEXT_PUBLIC_APP_NAME", "NoemaForge");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://127.0.0.1:3000");

    await import("@/auth");

    expect(credentialsProvider).toHaveBeenCalledTimes(1);
  });
});
