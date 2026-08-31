import { z } from "zod";
import { captureSourceValues } from "@/lib/journal/capture-source";
import {
  JOURNAL_ENTRY_BODY_MAX_LENGTH,
  REFLECTION_FIELD_MAX_LENGTH,
} from "@/lib/journal/limits";
import {
  GUIDED_REFLECTION_PROTOCOL_VARIANT,
  PROTOCOL_VARIANT_MAX_LENGTH,
  sessionTypeValues,
} from "@/lib/journal/session";

const trimmedText = z.string().trim();
const captureSourceSchema = z.enum(captureSourceValues);
const journalEntryBodyMaxLengthLabel =
  JOURNAL_ENTRY_BODY_MAX_LENGTH.toLocaleString("en-US");
const journalEntryBodySchema = trimmedText
  .min(1, "Write something before saving.")
  .max(
    JOURNAL_ENTRY_BODY_MAX_LENGTH,
    `Keep entries at ${journalEntryBodyMaxLengthLabel} characters or fewer.`,
  );
const reflectionFieldSchema = trimmedText
  .max(REFLECTION_FIELD_MAX_LENGTH)
  .optional()
  .transform((value) => value || undefined);

const reflectionFieldsSchema = {
  feeling: reflectionFieldSchema,
  nextStep: reflectionFieldSchema,
  rawBody: journalEntryBodySchema,
  rootIssue: reflectionFieldSchema,
};

export const journalEntryCreateInputSchema = z.object({
  ...reflectionFieldsSchema,
  assistanceSource: z.enum(["fallback", "ollama"]).optional(),
  followUpQuestion: reflectionFieldSchema,
  protocolVariant: trimmedText
    .min(1)
    .max(PROTOCOL_VARIANT_MAX_LENGTH)
    .default(GUIDED_REFLECTION_PROTOCOL_VARIANT),
  sessionType: z.enum(sessionTypeValues).default("reflection"),
  source: captureSourceSchema.default("typed"),
  suggestions: z.array(trimmedText.max(REFLECTION_FIELD_MAX_LENGTH)).max(3).default([]),
});

export const journalEntryUpdateInputSchema = z.object(reflectionFieldsSchema);

// Every field degrades on its own so a hand-edited query string narrows the
// history rather than failing it.
export const journalSearchSchema = z.object({
  from: z.iso.date().optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
  query: trimmedText
    .max(200)
    .optional()
    .catch(undefined)
    .transform((value) => value || undefined),
  to: z.iso.date().optional().catch(undefined),
});

export type JournalEntryCreateInput = z.input<typeof journalEntryCreateInputSchema>;
export type JournalEntryUpdateInput = z.input<typeof journalEntryUpdateInputSchema>;
export type JournalSearchInput = z.input<typeof journalSearchSchema>;
