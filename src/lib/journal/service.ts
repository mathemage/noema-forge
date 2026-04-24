import { randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { journalEntries } from "@/db/schema";
import { getDatabase, type Database } from "@/lib/db/client";
import {
  journalEntryCreateInputSchema,
  journalEntryUpdateInputSchema,
  journalSearchSchema,
  type JournalEntryCreateInput,
  type JournalSearchInput,
  type JournalEntryUpdateInput,
} from "@/lib/journal/validation";
import { type CaptureSource } from "@/lib/journal/capture-source";

export type JournalErrorCode = "invalid-input" | "not-found";

export class JournalError extends Error {
  constructor(readonly code: JournalErrorCode) {
    super(code);
    this.name = "JournalError";
  }
}

export type JournalEntryRecord = {
  body: string;
  createdAt: Date;
  id: string;
  source: CaptureSource;
  updatedAt: Date;
  userId: string;
};

export const JOURNAL_HISTORY_PAGE_SIZE = 100;

const journalEntrySelect = {
  body: journalEntries.body,
  createdAt: journalEntries.createdAt,
  id: journalEntries.id,
  source: journalEntries.source,
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

export async function createJournalEntry(
  input: JournalEntryCreateInput,
  userId: string,
  db: Database = getDatabase(),
) {
  const entry = parseCreateEntryInput(input);
  const [createdEntry] = await db
    .insert(journalEntries)
    .values({
      body: entry.body,
      id: randomUUID(),
      source: entry.source,
      userId,
    })
    .returning(journalEntrySelect);

  return createdEntry;
}

export async function updateJournalEntry(
  entryId: string,
  input: JournalEntryUpdateInput,
  userId: string,
  db: Database = getDatabase(),
) {
  const entry = parseUpdateEntryInput(input);
  const [updatedEntry] = await db
    .update(journalEntries)
    .set({
      body: entry.body,
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
) {
  const result = journalSearchSchema.safeParse(input);
  const query = result.success ? result.data.query : undefined;
  const filter = query
    ? and(
        eq(journalEntries.userId, userId),
        sql`to_tsvector('simple', ${journalEntries.body}) @@ plainto_tsquery('simple', ${query})`,
      )
    : eq(journalEntries.userId, userId);

  return db
    .select(journalEntrySelect)
    .from(journalEntries)
    .where(filter)
    .orderBy(desc(journalEntries.createdAt))
    .limit(JOURNAL_HISTORY_PAGE_SIZE);
}
