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

import { POST } from "@/app/entries/route";
import { getRequestUser } from "@/lib/auth/request";
import { createJournalEntry, JournalError } from "@/lib/journal/service";

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /entries", () => {
  it("redirects unauthenticated requests to sign-in", async () => {
    vi.mocked(getRequestUser).mockResolvedValue(null);

    const formData = new FormData();
    formData.set("body", "A typed entry");

    const response = await POST(
      new NextRequest("http://127.0.0.1:3000/entries", {
        body: formData,
        method: "POST",
      }),
    );
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(303);
    expect(location.pathname).toBe("/sign-in");
    expect(location.search).toBe("");
  });

  it("creates a typed entry and redirects to the detail page", async () => {
    vi.mocked(getRequestUser).mockResolvedValue({
      createdAt: new Date(),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date(),
    });
    vi.mocked(createJournalEntry).mockResolvedValue({
      body: "A typed entry",
      createdAt: new Date(),
      id: "entry-1",
      source: "typed",
      updatedAt: new Date(),
      userId: "user-1",
    });

    const formData = new FormData();
    formData.set("body", "A typed entry");

    const response = await POST(
      new NextRequest("http://127.0.0.1:3000/entries", {
        body: formData,
        method: "POST",
      }),
    );
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(303);
    expect(location.pathname).toBe("/entries/entry-1");
    expect(location.search).toBe("?message=created");
    expect(createJournalEntry).toHaveBeenCalledWith(
      { body: "A typed entry", source: undefined },
      "user-1",
    );
  });

  it("passes the selected capture source when present", async () => {
    vi.mocked(getRequestUser).mockResolvedValue({
      createdAt: new Date(),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date(),
    });
    vi.mocked(createJournalEntry).mockResolvedValue({
      body: "A dictated entry",
      createdAt: new Date(),
      id: "entry-2",
      source: "voice",
      updatedAt: new Date(),
      userId: "user-1",
    });

    const formData = new FormData();
    formData.set("body", "A dictated entry");
    formData.set("source", "voice");

    const response = await POST(
      new NextRequest("http://127.0.0.1:3000/entries", {
        body: formData,
        method: "POST",
      }),
    );
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(303);
    expect(location.pathname).toBe("/entries/entry-2");
    expect(location.search).toBe("?message=created");
    expect(createJournalEntry).toHaveBeenCalledWith(
      { body: "A dictated entry", source: "voice" },
      "user-1",
    );
  });

  it("redirects back to the journal when entry validation fails", async () => {
    vi.mocked(getRequestUser).mockResolvedValue({
      createdAt: new Date(),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date(),
    });
    vi.mocked(createJournalEntry).mockRejectedValue(
      new JournalError("invalid-input"),
    );

    const formData = new FormData();
    formData.set("body", "");

    const response = await POST(
      new NextRequest("http://127.0.0.1:3000/entries", {
        body: formData,
        method: "POST",
      }),
    );
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(303);
    expect(location.pathname).toBe("/");
    expect(location.search).toBe("?error=invalid-input");
  });
});
