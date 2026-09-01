import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/db/client";
import {
  JOURNAL_HISTORY_PAGE_SIZE,
  REFLECTION_FIELD_MAX_LENGTH,
} from "@/lib/journal/limits";
import {
  createJournalEntry,
  getJournalEntry,
  JournalError,
  listJournalEntries,
  updateJournalEntry,
  type JournalEntryRecord,
} from "@/lib/journal/service";

const MOCK_ENTRY: JournalEntryRecord = {
  assistanceSource: null,
  body: "Test entry",
  createdAt: new Date("2024-01-01"),
  feeling: null,
  followUpQuestion: null,
  id: "entry-1",
  nextStep: null,
  rawBody: "Test entry",
  rootIssue: null,
  sessionId: "session-1",
  source: "typed",
  suggestions: [],
  updatedAt: new Date("2024-01-01"),
  userId: "user-1",
};

const MOCK_ASSISTED_ENTRY: JournalEntryRecord = {
  ...MOCK_ENTRY,
  assistanceSource: "ollama",
  followUpQuestion: "What matters most?",
  suggestions: ["Open the draft."],
};

function mockTransactionDb(returnRows: unknown[]) {
  const values = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue(returnRows),
  });
  const insert = vi.fn().mockReturnValue({ values });
  const db = {
    transaction: vi.fn(
      async (run: (tx: { insert: typeof insert }) => Promise<unknown>) =>
        run({ insert }),
    ),
  } as unknown as Database;

  // The session row is inserted first, then the entry that points at it.
  return {
    db,
    insertedEntry: () => values.mock.calls[1][0],
    insertedSession: () => values.mock.calls[0][0],
  };
}

function mockSelectDb(returnRows: unknown[]) {
  const limitFromOrderBy = vi.fn().mockReturnValue({
    offset: vi.fn().mockResolvedValue(returnRows),
  });
  const orderBy = vi.fn().mockReturnValue({ limit: limitFromOrderBy });
  const limit = vi.fn().mockResolvedValue(returnRows);
  const where = vi.fn().mockReturnValue({ limit, orderBy });

  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({ where }),
      }),
    } as unknown as Database,
    limitFromOrderBy,
    where,
  };
}

function mockUpdateDb(existingRows: unknown[], updatedRows: unknown[]) {
  const set = vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(updatedRows),
    }),
  });
  const db = {
    ...mockSelectDb(existingRows).db,
    update: vi.fn().mockReturnValue({ set }),
  } as unknown as Database;

  return { db, set };
}

describe("createJournalEntry", () => {
  it("creates and returns a journal entry", async () => {
    const { db } = mockTransactionDb([MOCK_ENTRY]);
    const result = await createJournalEntry({ rawBody: "Test entry" }, "user-1", db);
    expect(result).toEqual(MOCK_ENTRY);
  });

  it("opens a reflection session and attaches the entry to it", async () => {
    const { db, insertedEntry, insertedSession } = mockTransactionDb([MOCK_ENTRY]);
    await createJournalEntry({ rawBody: "Test entry" }, "user-1", db);
    const session = insertedSession();
    const entry = insertedEntry();

    expect(session).toMatchObject({
      protocolVariant: "guided-reflection-v1",
      type: "reflection",
      userId: "user-1",
    });
    expect(entry).toMatchObject({
      body: "Test entry",
      rawBody: "Test entry",
      sessionId: session.id,
      source: "typed",
      userId: "user-1",
    });
  });

  it("stores reflection fields as columns and renders them into the body", async () => {
    const { db, insertedEntry } = mockTransactionDb([MOCK_ENTRY]);
    await createJournalEntry(
      {
        assistanceSource: "ollama",
        feeling: "Tense",
        followUpQuestion: "What matters most?",
        nextStep: "Write one sentence",
        rawBody: "A raw entry",
        rootIssue: "Unclear priority",
        suggestions: ["Set a timer."],
      },
      "user-1",
      db,
    );

    expect(insertedEntry()).toMatchObject({
      assistanceSource: "ollama",
      body: [
        "Raw capture:\nA raw entry",
        "Guided reflection:",
        "Feeling:\nTense",
        "Root issue:\nUnclear priority",
        "Next step:\nWrite one sentence",
        "Ollama assist:\n\nFollow-up question:\nWhat matters most?\n\nSuggestions:\n- Set a timer.",
      ].join("\n\n"),
      feeling: "Tense",
      followUpQuestion: "What matters most?",
      nextStep: "Write one sentence",
      rawBody: "A raw entry",
      rootIssue: "Unclear priority",
      suggestions: ["Set a timer."],
    });
  });

  it("persists the selected non-typed source", async () => {
    const { db, insertedEntry } = mockTransactionDb([
      { ...MOCK_ENTRY, source: "voice" },
    ]);
    await createJournalEntry({ rawBody: "Test entry", source: "voice" }, "user-1", db);
    expect(insertedEntry()).toMatchObject({ source: "voice" });
  });

  it("throws JournalError for an empty raw capture", async () => {
    const { db } = mockTransactionDb([]);
    await expect(createJournalEntry({ rawBody: "" }, "user-1", db)).rejects.toThrow(
      new JournalError("invalid-input"),
    );
  });

  it("throws JournalError for an oversized reflection field", async () => {
    const { db } = mockTransactionDb([]);
    await expect(
      createJournalEntry(
        {
          feeling: "a".repeat(REFLECTION_FIELD_MAX_LENGTH + 1),
          rawBody: "Test entry",
        },
        "user-1",
        db,
      ),
    ).rejects.toThrow(new JournalError("invalid-input"));
  });

  it("throws JournalError when the rendered body exceeds the limit", async () => {
    const { db } = mockTransactionDb([]);
    await expect(
      createJournalEntry(
        { feeling: "Tense", rawBody: "a".repeat(20_000) },
        "user-1",
        db,
      ),
    ).rejects.toThrow(new JournalError("entry-too-long"));
  });

  // Blocking a user's own entry is a documented harm, not a safety feature.
  it("stores distressing text exactly as written, with nothing filtered", async () => {
    const rawBody =
      "I want to die and I have been thinking about how I would do it.";
    const { db, insertedEntry } = mockTransactionDb([MOCK_ENTRY]);

    await createJournalEntry({ feeling: "Numb", rawBody }, "user-1", db);

    const entry = insertedEntry();
    expect(entry.rawBody).toBe(rawBody);
    expect(entry.body).toContain(rawBody);
  });
});

describe("updateJournalEntry", () => {
  it("re-renders the body and keeps the stored assist output", async () => {
    const { db, set } = mockUpdateDb([MOCK_ASSISTED_ENTRY], [MOCK_ASSISTED_ENTRY]);
    const result = await updateJournalEntry(
      "entry-1",
      { feeling: "Calmer", rawBody: "A revised entry" },
      "user-1",
      db,
    );

    expect(result).toEqual(MOCK_ASSISTED_ENTRY);
    expect(set.mock.calls[0][0]).toEqual({
      body: [
        "Raw capture:\nA revised entry",
        "Guided reflection:",
        "Feeling:\nCalmer",
        "Ollama assist:\n\nFollow-up question:\nWhat matters most?\n\nSuggestions:\n- Open the draft.",
      ].join("\n\n"),
      feeling: "Calmer",
      nextStep: null,
      rawBody: "A revised entry",
      rootIssue: null,
    });
  });

  it("clears a reflection field the writer emptied", async () => {
    const { db, set } = mockUpdateDb(
      [{ ...MOCK_ENTRY, feeling: "Tense" }],
      [MOCK_ENTRY],
    );
    await updateJournalEntry(
      "entry-1",
      { feeling: "", rawBody: "A revised entry" },
      "user-1",
      db,
    );

    expect(set.mock.calls[0][0]).toMatchObject({
      body: "A revised entry",
      feeling: null,
    });
  });

  it("throws JournalError not-found when entry does not exist", async () => {
    const { db } = mockUpdateDb([], []);
    await expect(
      updateJournalEntry("missing-id", { rawBody: "Test entry" }, "user-1", db),
    ).rejects.toThrow(new JournalError("not-found"));
  });

  it("throws JournalError for invalid input", async () => {
    const { db } = mockUpdateDb([MOCK_ENTRY], []);
    await expect(
      updateJournalEntry("entry-1", { rawBody: "" }, "user-1", db),
    ).rejects.toThrow(new JournalError("invalid-input"));
  });
});

describe("getJournalEntry", () => {
  it("returns the entry when found", async () => {
    const { db } = mockSelectDb([MOCK_ENTRY]);
    const result = await getJournalEntry("entry-1", "user-1", db);
    expect(result).toEqual(MOCK_ENTRY);
  });

  it("returns null when not found", async () => {
    const { db } = mockSelectDb([]);
    const result = await getJournalEntry("missing-id", "user-1", db);
    expect(result).toBeNull();
  });
});

describe("listJournalEntries", () => {
  it("returns the first page and reports that there is nothing after it", async () => {
    const { db } = mockSelectDb([MOCK_ENTRY]);
    const result = await listJournalEntries({}, "user-1", db);

    expect(result).toEqual({ entries: [MOCK_ENTRY], hasNextPage: false, page: 1 });
  });

  it("reads one row past the page to detect a next page without keeping it", async () => {
    const rows = Array.from({ length: JOURNAL_HISTORY_PAGE_SIZE + 1 }, (_, index) => ({
      ...MOCK_ENTRY,
      id: `entry-${index}`,
    }));
    const { db, limitFromOrderBy } = mockSelectDb(rows);
    const result = await listJournalEntries({}, "user-1", db);

    expect(limitFromOrderBy).toHaveBeenCalledWith(JOURNAL_HISTORY_PAGE_SIZE + 1);
    expect(result.entries).toHaveLength(JOURNAL_HISTORY_PAGE_SIZE);
    expect(result.hasNextPage).toBe(true);
  });

  it("offsets later pages by whole pages", async () => {
    const { db, limitFromOrderBy } = mockSelectDb([MOCK_ENTRY]);
    const result = await listJournalEntries({ page: "3" }, "user-1", db);
    const offset = limitFromOrderBy.mock.results[0].value.offset;

    expect(offset).toHaveBeenCalledWith(JOURNAL_HISTORY_PAGE_SIZE * 2);
    expect(result.page).toBe(3);
  });

  it("returns entries when a valid search query is provided", async () => {
    const { db } = mockSelectDb([MOCK_ENTRY]);
    const result = await listJournalEntries({ query: "test" }, "user-1", db);
    expect(result.entries).toEqual([MOCK_ENTRY]);
  });

  it("narrows rather than fails on unusable search parameters", async () => {
    const { db } = mockSelectDb([MOCK_ENTRY]);
    const result = await listJournalEntries(
      { from: "not-a-date", page: "0", query: "a".repeat(201) },
      "user-1",
      db,
    );

    expect(result).toEqual({ entries: [MOCK_ENTRY], hasNextPage: false, page: 1 });
  });
});
