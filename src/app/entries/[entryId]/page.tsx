import Link from "next/link";
import { notFound } from "next/navigation";
import { EntryMetadata } from "@/components/entry-metadata";
import { JournalChrome } from "@/components/journal-chrome";
import { signOutWithAuthJsCredentials } from "@/lib/auth/authjs-actions";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { readServerEnv, usesAuthJsCredentials } from "@/lib/env";
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
  const signOutAction = usesAuthJsCredentials(env)
    ? signOutWithAuthJsCredentials
    : "/auth/sign-out";
  const message = getSingleSearchParam((await searchParams).message);

  return (
    <JournalChrome
      actions={
        <>
          <Link
            className="button-inverse inline-flex items-center justify-center px-4 py-2 font-semibold"
            href="/"
          >
            Back to journal
          </Link>
          <a
            className="button-inverse inline-flex items-center justify-center px-4 py-2 font-semibold"
            href={`/entries/${entry.id}/edit`}
          >
            Edit entry
          </a>
        </>
      }
      appName={env.NEXT_PUBLIC_APP_NAME}
      description="Review the full text and metadata for a journal entry from any capture mode."
      signOutAction={signOutAction}
      title="Entry detail"
      userEmail={user.email}
    >
      <section className="paper-panel p-5 sm:p-7 lg:p-8">
        {message && entryMessages[message] ? (
          <div className="status-success mb-5" role="status">
            {entryMessages[message]}
          </div>
        ) : null}

        <div className="space-y-6">
          <EntryMetadata
            createdAt={entry.createdAt}
            source={entry.source}
            updatedAt={entry.updatedAt}
          />

          <article className="inset-panel relative overflow-hidden p-5 sm:p-7">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1 bg-accent/70"
            />
            <div className="whitespace-pre-wrap text-base leading-8 text-foreground">
              {entry.body}
            </div>
          </article>
        </div>
      </section>
    </JournalChrome>
  );
}
