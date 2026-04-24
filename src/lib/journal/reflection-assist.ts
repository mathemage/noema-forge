import { z } from "zod";
import { readServerEnv, type ServerEnv } from "@/lib/env";

export type ReflectionAssistInput = {
  body: string;
  feeling?: string;
  nextStep?: string;
  rootIssue?: string;
};

export type ReflectionAssistance = {
  followUpQuestion: string;
  message: string;
  source: "fallback" | "ollama";
  suggestions: string[];
};

type Fetch = typeof fetch;

const ollamaGenerateResponseSchema = z.object({
  response: z.string(),
});

const ollamaReflectionSchema = z.object({
  followUpQuestion: z.string().trim().min(1),
  suggestions: z.array(z.string().trim().min(1)).min(2).max(3),
});

export const reflectionAssistRequestSchema = z.object({
  body: z.string().trim().min(1).max(20_000),
  feeling: z.string().trim().max(2_000).optional(),
  nextStep: z.string().trim().max(2_000).optional(),
  rootIssue: z.string().trim().max(2_000).optional(),
});

function fallbackReflectionAssistance(message: string): ReflectionAssistance {
  return {
    followUpQuestion: "What is the smallest honest next step you can take today?",
    message,
    source: "fallback",
    suggestions: [
      "Name one concrete action that can be finished in 10 minutes.",
      "Choose what needs your attention first.",
      "Set a time to revisit this reflection.",
    ],
  };
}

function buildOllamaPrompt(input: ReflectionAssistInput) {
  return [
    "You are a narrow journaling reflection helper, not a chat assistant.",
    "Return only JSON with keys followUpQuestion and suggestions.",
    "Use one concise follow-up question and 2 or 3 concrete next-step suggestions.",
    "Do not diagnose, moralize, or expand into general coaching.",
    "",
    `Raw entry:\n${input.body.trim()}`,
    input.feeling ? `Feeling:\n${input.feeling.trim()}` : "",
    input.rootIssue ? `Root issue:\n${input.rootIssue.trim()}` : "",
    input.nextStep ? `Draft next step:\n${input.nextStep.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function parseOllamaReflection(responseText: string): Pick<
  ReflectionAssistance,
  "followUpQuestion" | "suggestions"
> {
  const parsed = ollamaReflectionSchema.parse(JSON.parse(responseText));

  return {
    followUpQuestion: parsed.followUpQuestion,
    suggestions: parsed.suggestions.slice(0, 3),
  };
}

export async function requestReflectionAssistance(
  input: ReflectionAssistInput,
  env: ServerEnv = readServerEnv(),
  fetchImpl: Fetch = fetch,
): Promise<ReflectionAssistance> {
  if (!env.OLLAMA_BASE_URL || !env.OLLAMA_MODEL) {
    return fallbackReflectionAssistance(
      "Ollama is not configured, so local reflection guidance was used.",
    );
  }

  try {
    const response = await fetchImpl(
      new URL("/api/generate", env.OLLAMA_BASE_URL),
      {
        body: JSON.stringify({
          format: "json",
          model: env.OLLAMA_MODEL,
          prompt: buildOllamaPrompt(input),
          stream: false,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
        signal: AbortSignal.timeout(8_000),
      },
    );

    if (!response.ok) {
      return fallbackReflectionAssistance(
        "Ollama did not return guidance, so local reflection guidance was used.",
      );
    }

    const payload = ollamaGenerateResponseSchema.parse(await response.json());
    const assistance = parseOllamaReflection(payload.response);

    return {
      ...assistance,
      message: "Ollama generated a narrow follow-up question and next steps.",
      source: "ollama",
    };
  } catch {
    return fallbackReflectionAssistance(
      "Ollama is unavailable, so local reflection guidance was used.",
    );
  }
}
