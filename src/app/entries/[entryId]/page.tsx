import Link from "next/link";
import { notFound } from "next/navigation";
import { EntryMetadata } from "@/components/entry-metadata";
import { JournalChrome } from "@/components/journal-chrome";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { readServerEnv } from "@/lib/env";
import { getJournalEntry } from "@/lib/journal/service";
import { getSingleSearchParam } from "@/lib/search-params";

type EntryDetailPageProps = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ message?: string | string[] }>;
};

const entryMessages: Record<string, string> = {
  created: "Entry saved.",
  updated: "Entry updated.",
};

export default async function EntryDetailPage({
  params,
  searchParams,
}: EntryDetailPageProps) {
  const user = await requireCurrentUser();
  const { entryId } = await params;
  const entry = await getJournalEntry(entryId, user.id);

  if (!entry) {
    notFound();
  }

  const env = readServerEnv();
  const message = getSingleSearchParam((await searchParams).message);

  return (
    <JournalChrome
      actions={
        <>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 font-medium text-foreground transition hover:bg-slate-100"
            href="/"
          >
            Back to journal
          </Link>
          <a
            className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 font-medium text-foreground transition hover:bg-slate-100"
            href={`/entries/${entry.id}/edit`}
          >
            Edit entry
          </a>
        </>
      }
      appName={env.NEXT_PUBLIC_APP_NAME}
      description="Review the full text and metadata for a typed journal entry."
      title="Entry detail"
      userEmail={user.email}
    >
      <section className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm sm:p-8">
        {message && entryMessages[message] ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {entryMessages[message]}
          </div>
        ) : null}

        <div className="space-y-6">
          <EntryMetadata
            createdAt={entry.createdAt}
            source={entry.source}
            updatedAt={entry.updatedAt}
          />

          <article className="rounded-3xl border border-border bg-slate-50/70 p-5">
            <div className="whitespace-pre-wrap text-base leading-7 text-foreground">
              {entry.body}
            </div>
          </article>
        </div>
      </section>
    </JournalChrome>
  );
}
