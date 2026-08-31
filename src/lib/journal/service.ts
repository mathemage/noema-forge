import { randomUUID } from "node:crypto";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { journalEntries, journalSessions } from "@/db/schema";
import { getDatabase, type Database } from "@/lib/db/client";
import {
  JOURNAL_ENTRY_BODY_MAX_LENGTH,
  JOURNAL_HISTORY_PAGE_SIZE,
} from "@/lib/journal/limits";
import {
  composeJournalEntryBody,
  type GuidedReflectionInput,
} from "@/lib/journal/reflection";
import {
  journalEntryCreateInputSchema,
  journalEntryUpdateInputSchema,
  journalSearchSchema,
  type JournalEntryCreateInput,
  type JournalSearchInput,
  type JournalEntryUpdateInput,
} from "@/lib/journal/validation";
import { type CaptureSource } from "@/lib/journal/capture-source";

export type JournalErrorCode = "entry-too-long" | "invalid-input" | "not-found";

export class JournalError extends Error {
  constructor(readonly code: JournalErrorCode) {
    super(code);
    this.name = "JournalError";
  }
}

export type JournalEntryRecord = {
  assistanceSource: "fallback" | "ollama" | null;
  body: string;
  createdAt: Date;
  feeling: string | null;
  followUpQuestion: string | null;
  id: string;
  nextStep: string | null;
  rawBody: string;
  rootIssue: string | null;
  sessionId: string;
  source: CaptureSource;
  suggestions: string[];
  updatedAt: Date;
  userId: string;
};

export type JournalHistoryPage = {
  entries: JournalEntryRecord[];
  hasNextPage: boolean;
  page: number;
};

const journalEntrySelect = {
  assistanceSource: journalEntries.assistanceSource,
  body: journalEntries.body,
  createdAt: journalEntries.createdAt,
  feeling: journalEntries.feeling,
  followUpQuestion: journalEntries.followUpQuestion,
  id: journalEntries.id,
  nextStep: journalEntries.nextStep,
  rawBody: journalEntries.rawBody,
  rootIssue: journalEntries.rootIssue,
  sessionId: journalEntries.sessionId,
  source: journalEntries.source,
  suggestions: journalEntries.suggestions,
  updatedAt: journalEntries.updatedAt,
  userId: journalEntries.userId,
};

function parseCreateEntryInput(input: JournalEntryCreateInput) {
  const result = journalEntryCreateInputSchema.safeParse(input);

  if (!result.success) {
    throw new JournalError("invalid-input");
  }

  return result.data;
}

function parseUpdateEntryInput(input: JournalEntryUpdateInput) {
  const result = journalEntryUpdateInputSchema.safeParse(input);

  if (!result.success) {
    throw new JournalError("invalid-input");
  }

  return result.data;
}

/** The stored `body` is always derived here, never supplied by a caller. */
function renderEntryBody(input: GuidedReflectionInput) {
  const body = composeJournalEntryBody(input);

  if (body.length > JOURNAL_ENTRY_BODY_MAX_LENGTH) {
    throw new JournalError("entry-too-long");
  }

  return body;
}

function startOfUtcDay(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function startOfNextUtcDay(date: string) {
  const start = startOfUtcDay(date);
  start.setUTCDate(start.getUTCDate() + 1);

  return start;
}

export async function createJournalEntry(
  input: JournalEntryCreateInput,
  userId: string,
  db: Database = getDatabase(),
) {
  const entry = parseCreateEntryInput(input);
  const body = renderEntryBody({
    assistanceSource: entry.assistanceSource,
    body: entry.rawBody,
    feeling: entry.feeling,
    followUpQuestion: entry.followUpQuestion,
    nextStep: entry.nextStep,
    rootIssue: entry.rootIssue,
    suggestions: entry.suggestions,
  });
  const sessionId = randomUUID();

  return db.transaction(async (tx) => {
    await tx.insert(journalSessions).values({
      id: sessionId,
      protocolVariant: entry.protocolVariant,
      type: entry.sessionType,
      userId,
    });

    const [createdEntry] = await tx
      .insert(journalEntries)
      .values({
        assistanceSource: entry.assistanceSource ?? null,
        body,
        feeling: entry.feeling ?? null,
        followUpQuestion: entry.followUpQuestion ?? null,
        id: randomUUID(),
        nextStep: entry.nextStep ?? null,
        rawBody: entry.rawBody,
        rootIssue: entry.rootIssue ?? null,
        sessionId,
        source: entry.source,
        suggestions: entry.suggestions,
        userId,
      })
      .returning(journalEntrySelect);

    return createdEntry;
  });
}

export async function updateJournalEntry(
  entryId: string,
  input: JournalEntryUpdateInput,
  userId: string,
  db: Database = getDatabase(),
) {
  const update = parseUpdateEntryInput(input);
  const existingEntry = await getJournalEntry(entryId, userId, db);

  if (!existingEntry) {
    throw new JournalError("not-found");
  }

  // Assist output belongs to the session that produced it, so an edit rewrites
  // the capture and the three distillation fields and leaves it alone.
  const body = renderEntryBody({
    assistanceSource: existingEntry.assistanceSource ?? undefined,
    body: update.rawBody,
    feeling: update.feeling,
    followUpQuestion: existingEntry.followUpQuestion ?? undefined,
    nextStep: update.nextStep,
    rootIssue: update.rootIssue,
    suggestions: existingEntry.suggestions,
  });
  const [updatedEntry] = await db
    .update(journalEntries)
    .set({
      body,
      feeling: update.feeling ?? null,
      nextStep: update.nextStep ?? null,
      rawBody: update.rawBody,
      rootIssue: update.rootIssue ?? null,
    })
    .where(
      and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)),
    )
    .returning(journalEntrySelect);

  if (!updatedEntry) {
    throw new JournalError("not-found");
  }

  return updatedEntry;
}

export async function getJournalEntry(
  entryId: string,
  userId: string,
  db: Database = getDatabase(),
) {
  const [entry] = await db
    .select(journalEntrySelect)
    .from(journalEntries)
    .where(
      and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)),
    )
    .limit(1);

  return entry ?? null;
}

export async function listJournalEntries(
  input: JournalSearchInput,
  userId: string,
  db: Database = getDatabase(),
): Promise<JournalHistoryPage> {
  const { from, page, query, to } = journalSearchSchema.parse(input);
  const filter = and(
    eq(journalEntries.userId, userId),
    query
      ? sql`to_tsvector('simple', ${journalEntries.body}) @@ plainto_tsquery('simple', ${query})`
      : undefined,
    from ? gte(journalEntries.createdAt, startOfUtcDay(from)) : undefined,
    to ? lt(journalEntries.createdAt, startOfNextUtcDay(to)) : undefined,
  );
  // One extra row answers "is there a next page" without a second count query.
  const rows = await db
    .select(journalEntrySelect)
    .from(journalEntries)
    .where(filter)
    .orderBy(desc(journalEntries.createdAt))
    .limit(JOURNAL_HISTORY_PAGE_SIZE + 1)
    .offset((page - 1) * JOURNAL_HISTORY_PAGE_SIZE);

  return {
    entries: rows.slice(0, JOURNAL_HISTORY_PAGE_SIZE),
    hasNextPage: rows.length > JOURNAL_HISTORY_PAGE_SIZE,
    page,
  };
}
