import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/auth", () => ({
  auth: vi.fn((handler) => handler),
}));

vi.mock("@/lib/auth/request", () => ({
  getRequestUser: vi.fn(),
}));

vi.mock("@/lib/journal/reflection-assist", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/journal/reflection-assist")>();

  return {
    ...actual,
    requestReflectionAssistance: vi.fn(),
  };
});

import { POST } from "@/app/api/reflection/assist/route";
import { getRequestUser } from "@/lib/auth/request";
import { requestReflectionAssistance } from "@/lib/journal/reflection-assist";

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/reflection/assist", () => {
  it("rejects unauthenticated requests", async () => {
    vi.mocked(getRequestUser).mockResolvedValue(null);

    const response = await POST(
      new NextRequest("http://127.0.0.1:3000/api/reflection/assist", {
        body: JSON.stringify({ body: "Raw entry" }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
  });

  it("returns reflection assistance for a valid draft", async () => {
    vi.mocked(getRequestUser).mockResolvedValue({
      createdAt: new Date(),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date(),
    });
    vi.mocked(requestReflectionAssistance).mockResolvedValue({
      followUpQuestion: "What is the smallest next step?",
      message: "Local guidance used.",
      source: "fallback",
      suggestions: ["Write one sentence.", "Set a timer."],
    });

    const response = await POST(
      new NextRequest("http://127.0.0.1:3000/api/reflection/assist", {
        body: JSON.stringify({
          body: "Raw entry",
          feeling: "Tense",
          nextStep: "",
          rootIssue: "Unclear priority",
        }),
        method: "POST",
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      followUpQuestion: "What is the smallest next step?",
      source: "fallback",
    });
    expect(requestReflectionAssistance).toHaveBeenCalledWith({
      body: "Raw entry",
      feeling: "Tense",
      nextStep: "",
      rootIssue: "Unclear priority",
    });
  });

  it("rejects an empty draft", async () => {
    vi.mocked(getRequestUser).mockResolvedValue({
      createdAt: new Date(),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date(),
    });

    const response = await POST(
      new NextRequest("http://127.0.0.1:3000/api/reflection/assist", {
        body: JSON.stringify({ body: "" }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    expect(requestReflectionAssistance).not.toHaveBeenCalled();
  });
});
