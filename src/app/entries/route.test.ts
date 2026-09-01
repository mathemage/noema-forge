import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/auth", () => ({
  auth: vi.fn((handler) => handler),
}));

vi.mock("@/lib/auth/request", () => ({
  getRequestUser: vi.fn(),
}));

vi.mock("@/lib/journal/service", () => ({
  JournalError: class JournalError extends Error {
    code: string;

    constructor(code: string) {
      super(code);
      this.code = code;
      this.name = "JournalError";
    }
  },
  createJournalEntry: vi.fn(),
}));

vi.mock("@/lib/safety/service", () => ({
  hasAcknowledgedLimits: vi.fn(),
}));

import { POST } from "@/app/entries/route";
import { getRequestUser } from "@/lib/auth/request";
import { hasAcknowledgedLimits } from "@/lib/safety/service";
import {
  createJournalEntry,
  JournalError,
  type JournalEntryRecord,
} from "@/lib/journal/service";

function mockEntry(overrides: Partial<JournalEntryRecord> = {}): JournalEntryRecord {
  return {
    assistanceSource: null,
    body: "An entry",
    createdAt: new Date(),
    feeling: null,
    followUpQuestion: null,
    id: "entry-1",
    nextStep: null,
    rawBody: "An entry",
    rootIssue: null,
    sessionId: "session-1",
    source: "typed",
    suggestions: [],
    updatedAt: new Date(),
    userId: "user-1",
    ...overrides,
  };
}

function signIn(acknowledgedLimits = true) {
  vi.mocked(getRequestUser).mockResolvedValue({
    createdAt: new Date(),
    displayName: null,
    email: "user@example.com",
    id: "user-1",
    updatedAt: new Date(),
  });
  vi.mocked(hasAcknowledgedLimits).mockResolvedValue(acknowledgedLimits);
}

async function post(formData: FormData) {
  const response = await POST(
    new NextRequest("http://127.0.0.1:3000/entries", {
      body: formData,
      method: "POST",
    }),
  );

  return {
    location: new URL(
      response.headers.get("location") ?? "",
      "http://127.0.0.1:3000",
    ),
    status: response.status,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /entries", () => {
  it("redirects unauthenticated requests to sign-in", async () => {
    vi.mocked(getRequestUser).mockResolvedValue(null);

    const formData = new FormData();
    formData.set("body", "A typed entry");

    const { location, status } = await post(formData);

    expect(status).toBe(303);
    expect(location.pathname).toBe("/sign-in");
    expect(location.search).toBe("");
  });

  it("sends a user who has not read the limits statement there before writing", async () => {
    signIn(false);

    const formData = new FormData();
    formData.set("body", "A typed entry");

    const { location, status } = await post(formData);

    expect(status).toBe(303);
    expect(location.pathname).toBe("/safety/limits");
    expect(createJournalEntry).not.toHaveBeenCalled();
  });

  it("creates a typed entry and redirects to the detail page", async () => {
    signIn();
    vi.mocked(createJournalEntry).mockResolvedValue(mockEntry());

    const formData = new FormData();
    formData.set("body", "A typed entry");

    const { location, status } = await post(formData);

    expect(status).toBe(303);
    expect(location.pathname).toBe("/entries/entry-1");
    expect(location.search).toBe("?message=created");
    expect(createJournalEntry).toHaveBeenCalledWith(
      expect.objectContaining({ rawBody: "A typed entry", source: undefined }),
      "user-1",
    );
  });

  it("passes the selected capture source when present", async () => {
    signIn();
    vi.mocked(createJournalEntry).mockResolvedValue(
      mockEntry({ id: "entry-2", source: "voice" }),
    );

    const formData = new FormData();
    formData.set("body", "A dictated entry");
    formData.set("source", "voice");

    const { location } = await post(formData);

    expect(location.pathname).toBe("/entries/entry-2");
    expect(createJournalEntry).toHaveBeenCalledWith(
      expect.objectContaining({ rawBody: "A dictated entry", source: "voice" }),
      "user-1",
    );
  });

  it("hands the reflection fields to the service as separate values", async () => {
    signIn();
    vi.mocked(createJournalEntry).mockResolvedValue(mockEntry({ id: "entry-3" }));

    const formData = new FormData();
    formData.set("body", "A raw entry");
    formData.set("feeling", "Tense");
    formData.set("rootIssue", "Unclear priority");
    formData.set("nextStep", "Write one sentence");
    formData.set("assistanceSource", "fallback");
    formData.set("followUpQuestion", "What matters most?");
    formData.append("suggestions", "Set a timer.");
    formData.append("suggestions", "Open the draft.");

    const { location } = await post(formData);

    expect(location.pathname).toBe("/entries/entry-3");
    expect(createJournalEntry).toHaveBeenCalledWith(
      {
        assistanceSource: "fallback",
        feeling: "Tense",
        followUpQuestion: "What matters most?",
        nextStep: "Write one sentence",
        rawBody: "A raw entry",
        rootIssue: "Unclear priority",
        source: undefined,
        suggestions: ["Set a timer.", "Open the draft."],
      },
      "user-1",
    );
  });

  it("ignores an assistance source the form did not produce", async () => {
    signIn();
    vi.mocked(createJournalEntry).mockResolvedValue(mockEntry());

    const formData = new FormData();
    formData.set("body", "A raw entry");
    formData.set("assistanceSource", "something-else");

    await post(formData);

    expect(createJournalEntry).toHaveBeenCalledWith(
      expect.objectContaining({ assistanceSource: undefined }),
      "user-1",
    );
  });

  it("does not let reflection fields satisfy the raw entry requirement", async () => {
    signIn();
    vi.mocked(createJournalEntry).mockRejectedValue(
      new JournalError("invalid-input"),
    );

    const formData = new FormData();
    formData.set("body", "");
    formData.set("feeling", "Tense");

    const { location } = await post(formData);

    expect(location.pathname).toBe("/");
    expect(location.search).toBe("?error=invalid-input");
    expect(createJournalEntry).toHaveBeenCalledWith(
      expect.objectContaining({ rawBody: "" }),
      "user-1",
    );
  });

  it.each(["entry-too-long", "invalid-input", "not-found"])(
    "reports a %s failure back on the journal page",
    async (code) => {
      signIn();
      vi.mocked(createJournalEntry).mockRejectedValue(new JournalError(code));

      const formData = new FormData();
      formData.set("body", "A raw entry");

      const { location } = await post(formData);

      expect(location.pathname).toBe("/");
      expect(location.search).toBe(`?error=${code}`);
    },
  );
});
