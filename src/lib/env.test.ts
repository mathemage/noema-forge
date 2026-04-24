import { describe, expect, it } from "vitest";
import { getAuthSecret, readServerEnv, shouldTrustAuthHost, usesAuthJsCredentials } from "@/lib/env";

describe("auth environment helpers", () => {
  it("defaults to the first-party journal auth flow and trusts localhost", () => {
    const env = readServerEnv({
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
    });

    expect(env.AUTH_SIGN_IN_MODE).toBe("journal");
    expect(usesAuthJsCredentials(env)).toBe(false);
    expect(shouldTrustAuthHost(env)).toBe(true);
  });

  it("parses the optional Auth.js credentials mode", () => {
    const env = readServerEnv({
      AUTH_SECRET: "test-secret",
      AUTH_SIGN_IN_MODE: "authjs-credentials",
      AUTH_TRUST_HOST: "true",
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
    });

    expect(usesAuthJsCredentials(env)).toBe(true);
    expect(shouldTrustAuthHost(env)).toBe(true);
    expect(getAuthSecret(env)).toBe("test-secret");
  });

  it("parses optional Ollama reflection assistance settings", () => {
    const env = readServerEnv({
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
      OLLAMA_BASE_URL: "http://127.0.0.1:11434",
      OLLAMA_MODEL: "llama3.2",
    });

    expect(env.OLLAMA_BASE_URL).toBe("http://127.0.0.1:11434");
    expect(env.OLLAMA_MODEL).toBe("llama3.2");
  });

  it("requires an Auth.js secret when the alternative mode is enabled", () => {
    const env = readServerEnv({
      AUTH_SIGN_IN_MODE: "authjs-credentials",
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
    });

    expect(() => getAuthSecret(env)).toThrow(
      "AUTH_SECRET is required when AUTH_SIGN_IN_MODE=authjs-credentials.",
    );
  });
});
