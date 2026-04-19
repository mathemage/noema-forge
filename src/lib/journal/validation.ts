import { z } from "zod";

const trimmedText = z.string().trim();

export const journalEntryInputSchema = z.object({
  body: trimmedText
    .min(1, "Write something before saving.")
    .max(20_000, "Keep entries at 20,000 characters or fewer."),
});

export const journalSearchSchema = z.object({
  query: trimmedText.max(200).optional().transform((value) => value || undefined),
});

export type JournalEntryInput = z.infer<typeof journalEntryInputSchema>;
export type JournalSearchInput = z.infer<typeof journalSearchSchema>;
