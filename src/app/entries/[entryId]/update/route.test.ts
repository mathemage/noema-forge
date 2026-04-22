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

import { POST } from "@/app/entries/[entryId]/update/route";
import { getRequestUser } from "@/lib/auth/request";
import { JournalError, updateJournalEntry } from "@/lib/journal/service";

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /entries/[entryId]/update", () => {
  it("updates an entry and redirects to the detail page", async () => {
    vi.mocked(getRequestUser).mockResolvedValue({
      createdAt: new Date(),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date(),
    });
    vi.mocked(updateJournalEntry).mockResolvedValue({
      body: "Updated entry",
      createdAt: new Date(),
      id: "entry-1",
      source: "typed",
      updatedAt: new Date(),
      userId: "user-1",
    });

    const formData = new FormData();
    formData.set("body", "Updated entry");

    const response = await POST(
      new NextRequest("http://127.0.0.1:3000/entries/entry-1/update", {
        body: formData,
        method: "POST",
      }),
      { params: Promise.resolve({ entryId: "entry-1" }) },
    );
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(303);
    expect(location.pathname).toBe("/entries/entry-1");
    expect(location.search).toBe("?message=updated");
    expect(updateJournalEntry).toHaveBeenCalledWith(
      "entry-1",
      { body: "Updated entry" },
      "user-1",
    );
  });

  it("redirects back to edit when validation fails", async () => {
    vi.mocked(getRequestUser).mockResolvedValue({
      createdAt: new Date(),
      displayName: null,
      email: "user@example.com",
      id: "user-1",
      updatedAt: new Date(),
    });
    vi.mocked(updateJournalEntry).mockRejectedValue(
      new JournalError("invalid-input"),
    );

    const formData = new FormData();
    formData.set("body", "");

    const response = await POST(
      new NextRequest("http://127.0.0.1:3000/entries/entry-1/update", {
        body: formData,
        method: "POST",
      }),
      { params: Promise.resolve({ entryId: "entry-1" }) },
    );
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(303);
    expect(location.pathname).toBe("/entries/entry-1/edit");
    expect(location.search).toBe("?error=invalid-input");
  });
});
