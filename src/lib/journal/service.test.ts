import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/db/client";
import {
  createJournalEntry,
  getJournalEntry,
  JournalError,
  listJournalEntries,
  updateJournalEntry,
} from "@/lib/journal/service";

const MOCK_ENTRY = {
  body: "Test entry",
  createdAt: new Date("2024-01-01"),
  id: "entry-1",
  source: "typed" as const,
  updatedAt: new Date("2024-01-01"),
  userId: "user-1",
};

function mockInsertDb(returnRows: unknown[]) {
  return {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue(returnRows),
      }),
    }),
  } as unknown as Database;
}

function mockUpdateDb(returnRows: unknown[]) {
  return {
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue(returnRows),
        }),
      }),
    }),
  } as unknown as Database;
}

function mockSelectDb(returnRows: unknown[]) {
  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(returnRows),
          orderBy: vi.fn().mockResolvedValue(returnRows),
        }),
      }),
    }),
  } as unknown as Database;
}

describe("createJournalEntry", () => {
  it("creates and returns a journal entry", async () => {
    const db = mockInsertDb([MOCK_ENTRY]);
    const result = await createJournalEntry({ body: "Test entry" }, "user-1", db);
    expect(result).toEqual(MOCK_ENTRY);
  });

  it("scopes the entry to the given user", async () => {
    const db = mockInsertDb([MOCK_ENTRY]);
    await createJournalEntry({ body: "Test entry" }, "user-1", db);
    const valuesMock = (db.insert as ReturnType<typeof vi.fn>).mock.results[0]
      .value.values as ReturnType<typeof vi.fn>;
    expect(valuesMock.mock.calls[0][0]).toMatchObject({ userId: "user-1" });
  });

  it("throws JournalError for empty body", async () => {
    const db = mockInsertDb([]);
    await expect(createJournalEntry({ body: "" }, "user-1", db)).rejects.toThrow(
      new JournalError("invalid-input"),
    );
  });

  it("throws JournalError for body exceeding max length", async () => {
    const db = mockInsertDb([]);
    await expect(
      createJournalEntry({ body: "a".repeat(20_001) }, "user-1", db),
    ).rejects.toThrow(new JournalError("invalid-input"));
  });
});

describe("updateJournalEntry", () => {
  it("updates and returns the entry", async () => {
    const db = mockUpdateDb([MOCK_ENTRY]);
    const result = await updateJournalEntry(
      "entry-1",
      { body: "Test entry" },
      "user-1",
      db,
    );
    expect(result).toEqual(MOCK_ENTRY);
  });

  it("throws JournalError not-found when entry does not exist", async () => {
    const db = mockUpdateDb([]);
    await expect(
      updateJournalEntry("missing-id", { body: "Test entry" }, "user-1", db),
    ).rejects.toThrow(new JournalError("not-found"));
  });

  it("throws JournalError for invalid input", async () => {
    const db = mockUpdateDb([]);
    await expect(
      updateJournalEntry("entry-1", { body: "" }, "user-1", db),
    ).rejects.toThrow(new JournalError("invalid-input"));
  });
});

describe("getJournalEntry", () => {
  it("returns the entry when found", async () => {
    const db = mockSelectDb([MOCK_ENTRY]);
    const result = await getJournalEntry("entry-1", "user-1", db);
    expect(result).toEqual(MOCK_ENTRY);
  });

  it("returns null when not found", async () => {
    const db = mockSelectDb([]);
    const result = await getJournalEntry("missing-id", "user-1", db);
    expect(result).toBeNull();
  });
});

describe("listJournalEntries", () => {
  it("returns all entries for a user when no query is given", async () => {
    const db = mockSelectDb([MOCK_ENTRY]);
    const results = await listJournalEntries({}, "user-1", db);
    expect(results).toEqual([MOCK_ENTRY]);
  });

  it("returns entries when a valid search query is provided", async () => {
    const db = mockSelectDb([MOCK_ENTRY]);
    const results = await listJournalEntries({ query: "test" }, "user-1", db);
    expect(results).toEqual([MOCK_ENTRY]);
  });

  it("falls back gracefully when the query string is invalid (too long)", async () => {
    const db = mockSelectDb([MOCK_ENTRY]);
    const results = await listJournalEntries(
      { query: "a".repeat(201) },
      "user-1",
      db,
    );
    expect(results).toEqual([MOCK_ENTRY]);
  });
});
