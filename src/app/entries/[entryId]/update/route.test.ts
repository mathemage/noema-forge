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
  updateJournalEntry: vi.fn(),
}));

vi.mock("@/lib/safety/service", () => ({
  hasAcknowledgedLimits: vi.fn(),
}));

import { POST } from "@/app/entries/[entryId]/update/route";
import { getRequestUser } from "@/lib/auth/request";
import { hasAcknowledgedLimits } from "@/lib/safety/service";
import {
  JournalError,
  updateJournalEntry,
  type JournalEntryRecord,
} from "@/lib/journal/service";

function mockEntry(overrides: Partial<JournalEntryRecord> = {}): JournalEntryRecord {
  return {
    assistanceSource: null,
    body: "Updated entry",
    createdAt: new Date(),
    feeling: null,
    followUpQuestion: null,
    id: "entry-1",
    nextStep: null,
    rawBody: "Updated entry",
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
    new NextRequest("http://127.0.0.1:3000/entries/entry-1/update", {
      body: formData,
      method: "POST",
    }),
    { params: Promise.resolve({ entryId: "entry-1" }) },
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

describe("POST /entries/[entryId]/update", () => {
  it("sends a user who has not read the limits statement there before writing", async () => {
    signIn(false);

    const formData = new FormData();
    formData.set("body", "Updated entry");

    const { location, status } = await post(formData);

    expect(status).toBe(303);
    expect(location.pathname).toBe("/safety/limits");
    expect(updateJournalEntry).not.toHaveBeenCalled();
  });

  it("updates the capture and its reflection, then redirects to the detail page", async () => {
    signIn();
    vi.mocked(updateJournalEntry).mockResolvedValue(mockEntry());

    const formData = new FormData();
    formData.set("body", "Updated entry");
    formData.set("feeling", "Steadier");
    formData.set("rootIssue", "");
    formData.set("nextStep", "Send the email");

    const { location, status } = await post(formData);

    expect(status).toBe(303);
    expect(location.pathname).toBe("/entries/entry-1");
    expect(location.search).toBe("?message=updated");
    expect(updateJournalEntry).toHaveBeenCalledWith(
      "entry-1",
      {
        feeling: "Steadier",
        nextStep: "Send the email",
        rawBody: "Updated entry",
        rootIssue: "",
      },
      "user-1",
    );
  });

  it.each(["entry-too-long", "invalid-input"])(
    "redirects back to edit on a %s failure",
    async (code) => {
      signIn();
      vi.mocked(updateJournalEntry).mockRejectedValue(new JournalError(code));

      const formData = new FormData();
      formData.set("body", "");

      const { location } = await post(formData);

      expect(location.pathname).toBe("/entries/entry-1/edit");
      expect(location.search).toBe(`?error=${code}`);
    },
  );

  it("sends a missing entry back to the journal", async () => {
    signIn();
    vi.mocked(updateJournalEntry).mockRejectedValue(new JournalError("not-found"));

    const formData = new FormData();
    formData.set("body", "Updated entry");

    const { location } = await post(formData);

    expect(location.pathname).toBe("/");
    expect(location.search).toBe("?error=not-found");
  });
});
