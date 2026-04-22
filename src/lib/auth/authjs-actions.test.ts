import { afterEach, describe, expect, it, vi } from "vitest";

const { cookieStore, cookies, redirect } = vi.hoisted(() => ({
  cookieStore: {
    get: vi.fn(),
    set: vi.fn(),
  },
  cookies: vi.fn(),
  redirect: vi.fn((location: string) => {
    throw new Error(`redirect:${location}`);
  }),
}));

vi.mock("next/headers", () => ({
  cookies,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("next-auth", () => {
  class AuthError extends Error {
    type: string;

    constructor(type = "AuthError") {
      super(type);
      this.name = type;
      this.type = type;
    }
  }

  class CredentialsSignin extends AuthError {
    constructor() {
      super("CredentialsSignin");
    }
  }

  return {
    AuthError,
    CredentialsSignin,
  };
});

vi.mock("@/auth", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/auth/service", () => ({
  AuthError: class AuthError extends Error {
    code: string;

    constructor(code: string) {
      super(code);
      this.code = code;
      this.name = "AuthError";
    }
  },
  registerUser: vi.fn(),
}));

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

import { CredentialsSignin } from "next-auth";
import {
  registerWithAuthJsCredentials,
  signInWithAuthJsCredentials,
  signOutWithAuthJsCredentials,
} from "@/lib/auth/authjs-actions";
import { signIn, signOut } from "@/auth";
import { registerUser } from "@/lib/auth/service";
import {
  deleteSessionByToken,
  getClearedSessionCookie,
} from "@/lib/auth/session";

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe("Auth.js credential actions", () => {
  it("passes validated credentials to Auth.js sign-in", async () => {
    vi.stubEnv("AUTH_SIGN_IN_MODE", "authjs-credentials");
    vi.mocked(signIn).mockResolvedValue(undefined as never);

    const formData = new FormData();
    formData.set("email", "USER@example.com");
    formData.set("password", "journal-pass-123");

    await expect(signInWithAuthJsCredentials(formData)).resolves.toBeUndefined();
    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "user@example.com",
      password: "journal-pass-123",
      redirectTo: "/",
    });
  });

  it("redirects invalid credentials back to sign-in", async () => {
    vi.stubEnv("AUTH_SIGN_IN_MODE", "authjs-credentials");
    vi.mocked(signIn).mockRejectedValue(new CredentialsSignin());

    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "journal-pass-123");

    await expect(signInWithAuthJsCredentials(formData)).rejects.toThrow(
      "redirect:/sign-in?error=invalid-credentials",
    );
  });

  it("registers the journal user before delegating the session to Auth.js", async () => {
    vi.stubEnv("AUTH_SIGN_IN_MODE", "authjs-credentials");
    vi.mocked(signIn).mockResolvedValue(undefined as never);

    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "journal-pass-123");

    await expect(registerWithAuthJsCredentials(formData)).resolves.toBeUndefined();
    expect(registerUser).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "journal-pass-123",
    });
    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "user@example.com",
      password: "journal-pass-123",
      redirectTo: "/",
    });
  });

  it("routes sign-out through Auth.js when the alternative mode is enabled", async () => {
    vi.stubEnv("AUTH_SIGN_IN_MODE", "authjs-credentials");
    vi.mocked(signOut).mockResolvedValue(undefined as never);
    cookieStore.get.mockReturnValue({ value: "session-token" });
    cookies.mockResolvedValue(cookieStore);

    await expect(signOutWithAuthJsCredentials(new FormData())).resolves.toBeUndefined();
    expect(deleteSessionByToken).toHaveBeenCalledWith("session-token");
    expect(getClearedSessionCookie).toHaveBeenCalledWith();
    expect(cookieStore.set).toHaveBeenCalledWith({
      expires: new Date(0),
      httpOnly: true,
      maxAge: 0,
      name: "noema_forge_session",
      path: "/",
      sameSite: "lax",
      secure: false,
      value: "",
    });
    expect(signOut).toHaveBeenCalledWith({
      redirectTo: "/sign-in?message=signed-out",
    });
  });
});
