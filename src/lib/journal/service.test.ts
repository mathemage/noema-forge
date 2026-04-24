import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/db/client";
import {
  createJournalEntry,
  getJournalEntry,
  JOURNAL_HISTORY_PAGE_SIZE,
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

const MOCK_VOICE_ENTRY = {
  ...MOCK_ENTRY,
  source: "voice" as const,
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
  const limitFromOrderBy = vi.fn().mockResolvedValue(returnRows);
  const orderBy = vi.fn().mockReturnValue({
    limit: limitFromOrderBy,
  });
  const limit = vi.fn().mockResolvedValue(returnRows);

  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
          orderBy,
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
    expect(valuesMock.mock.calls[0][0]).toMatchObject({
      source: "typed",
      userId: "user-1",
    });
  });

  it("persists the selected non-typed source", async () => {
    const db = mockInsertDb([MOCK_VOICE_ENTRY]);
    const result = await createJournalEntry(
      { body: "Test entry", source: "voice" },
      "user-1",
      db,
    );
    const valuesMock = (db.insert as ReturnType<typeof vi.fn>).mock.results[0]
      .value.values as ReturnType<typeof vi.fn>;

    expect(result).toEqual(MOCK_VOICE_ENTRY);
    expect(valuesMock.mock.calls[0][0]).toMatchObject({ source: "voice" });
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

  it("limits journal history to the default page size", async () => {
    const db = mockSelectDb([MOCK_ENTRY]);
    await listJournalEntries({}, "user-1", db);
    const orderByMock = (db.select as ReturnType<typeof vi.fn>).mock.results[0].value
      .from.mock.results[0].value.where.mock.results[0].value.orderBy as ReturnType<
      typeof vi.fn
    >;
    const listLimitMock = orderByMock.mock.results[0].value.limit as ReturnType<
      typeof vi.fn
    >;
    expect(listLimitMock).toHaveBeenCalledWith(JOURNAL_HISTORY_PAGE_SIZE);
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
