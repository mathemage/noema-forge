import { describe, expect, it, vi } from "vitest";
import { requestReflectionAssistance } from "@/lib/journal/reflection-assist";
import type { ServerEnv } from "@/lib/env";

const BASE_ENV: ServerEnv = {
  AUTH_SIGN_IN_MODE: "journal",
  AUTH_TRUST_HOST: "false",
  NEXT_PUBLIC_APP_NAME: "NoemaForge",
  NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
  S3_FORCE_PATH_STYLE: "true",
  S3_REGION: "us-east-1",
};

describe("requestReflectionAssistance", () => {
  it("uses local guidance when Ollama is not configured", async () => {
    const assistance = await requestReflectionAssistance(
      { body: "A difficult day" },
      BASE_ENV,
      vi.fn(),
    );

    expect(assistance.source).toBe("fallback");
    expect(assistance.followUpQuestion).toContain("next step");
    expect(assistance.suggestions).toHaveLength(3);
  });

  it("uses an Ollama JSON response when configured", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          response: JSON.stringify({
            followUpQuestion: "What matters most here?",
            suggestions: ["Pause for two minutes.", "Send one clear note."],
          }),
        }),
        { status: 200 },
      ),
    );

    const assistance = await requestReflectionAssistance(
      { body: "I need to make a decision." },
      {
        ...BASE_ENV,
        OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        OLLAMA_MODEL: "test-model",
      },
      fetchImpl,
    );

    expect(assistance).toMatchObject({
      followUpQuestion: "What matters most here?",
      source: "ollama",
      suggestions: ["Pause for two minutes.", "Send one clear note."],
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      new URL("/api/generate", "http://127.0.0.1:11434"),
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("falls back when Ollama returns invalid guidance", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ response: "not json" }), { status: 200 }),
    );

    const assistance = await requestReflectionAssistance(
      { body: "A difficult day" },
      {
        ...BASE_ENV,
        OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        OLLAMA_MODEL: "test-model",
      },
      fetchImpl,
    );

    expect(assistance.source).toBe("fallback");
    expect(assistance.message).toContain("unavailable");
  });
});
