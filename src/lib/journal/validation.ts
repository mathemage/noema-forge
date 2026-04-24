import { z } from "zod";
import { captureSourceValues } from "@/lib/journal/capture-source";

const trimmedText = z.string().trim();
const captureSourceSchema = z.enum(captureSourceValues);
const journalEntryBodySchema = trimmedText
  .min(1, "Write something before saving.")
  .max(20_000, "Keep entries at 20,000 characters or fewer.");

export const journalEntryCreateInputSchema = z.object({
  body: journalEntryBodySchema,
  source: captureSourceSchema.default("typed"),
});

export const journalEntryUpdateInputSchema = z.object({
  body: journalEntryBodySchema,
});

export const journalSearchSchema = z.object({
  query: trimmedText.max(200).optional().transform((value) => value || undefined),
});

export type JournalEntryCreateInput = z.input<typeof journalEntryCreateInputSchema>;
export type JournalEntryUpdateInput = z.input<typeof journalEntryUpdateInputSchema>;
export type JournalSearchInput = z.infer<typeof journalSearchSchema>;
