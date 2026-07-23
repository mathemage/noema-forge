import { EntryMetadata } from "@/components/entry-metadata";
import { JournalChrome } from "@/components/journal-chrome";
import { signOutWithAuthJsCredentials } from "@/lib/auth/authjs-actions";
import { JournalCaptureForm } from "@/components/journal-capture-form";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { readServerEnv, usesAuthJsCredentials } from "@/lib/env";
import { excerptText } from "@/lib/formatting";
import {
  JOURNAL_ENTRY_BODY_MAX_LENGTH,
  REFLECTION_FIELD_MAX_LENGTH,
} from "@/lib/journal/limits";
import { listJournalEntries } from "@/lib/journal/service";
import { getSingleSearchParam } from "@/lib/search-params";

type HomePageProps = {
  searchParams: Promise<{
    error?: string | string[];
    q?: string | string[];
  }>;
};

const journalEntryBodyMaxLengthLabel =
  JOURNAL_ENTRY_BODY_MAX_LENGTH.toLocaleString("en-US");
const reflectionFieldMaxLengthLabel =
  REFLECTION_FIELD_MAX_LENGTH.toLocaleString("en-US");
const homeErrorMessages: Record<string, string> = {
  "entry-too-long": `Shorten the entry or reflection before saving. The saved journal text must be ${journalEntryBodyMaxLengthLabel} characters or fewer.`,
  "invalid-input": `Add a raw entry and keep each reflection field to ${reflectionFieldMaxLengthLabel} characters or fewer before saving.`,
  "not-found": "That entry is no longer available.",
};

export default async function Home({ searchParams }: HomePageProps) {
  const user = await requireCurrentUser();
  const params = await searchParams;
  const env = readServerEnv();
  const signOutAction = usesAuthJsCredentials(env)
    ? signOutWithAuthJsCredentials
    : "/auth/sign-out";
  const query = getSingleSearchParam(params.q)?.trim() ?? "";
  const error = getSingleSearchParam(params.error);
  const entries = await listJournalEntries({ query }, user.id);

  return (
    <JournalChrome
      appName={env.NEXT_PUBLIC_APP_NAME}
      description="Capture raw thoughts, distill them into guided reflections, and keep every entry in one private, searchable journal."
      signOutAction={signOutAction}
      title="Journal history"
      userEmail={user.email}
    >
      <div className="grid items-start gap-4 sm:gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1.04fr)_minmax(24rem,0.96fr)]">
        <JournalCaptureForm
          action="/entries"
          key="new-entry"
          description="Type directly, dictate with your browser, or upload a handwritten note image. Then clarify the feeling, root issue, and next step before saving."
          error={error ? homeErrorMessages[error] : undefined}
          heading="New journal entry"
          submitLabel="Save entry"
        />

        <section className="paper-panel p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="eyebrow">Private archive</p>
              <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
                Search and browse
              </h2>
              <p className="max-w-lg text-sm leading-6 text-muted">
                Your newest entries appear first. Search stays inside PostgreSQL.
              </p>
            </div>

            <form className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-md" method="get">
              <input
                aria-label="Search entry text"
                className="journal-control w-full px-4 py-3 text-sm"
                defaultValue={query}
                name="q"
                placeholder="Search entry text"
                type="search"
              />
              <button
                className="button-primary inline-flex items-center justify-center px-5 py-3 text-sm font-semibold"
                type="submit"
              >
                Search
              </button>
            </form>
          </div>

          <div className="mt-6 space-y-4">
            {entries.length === 0 ? (
              <div className="inset-panel border-dashed px-5 py-8 text-sm leading-6 text-muted">
                <p className="font-semibold text-foreground">The archive is quiet.</p>
                <p className="mt-1">
                  {query
                    ? `No entries match "${query}" yet.`
                    : "No entries yet. Save your first capture to start the archive."}
                </p>
              </div>
            ) : (
              entries.map((entry) => (
                <article
                  key={entry.id}
                  className="inset-panel relative overflow-hidden p-5"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-1 bg-accent/70"
                  />
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground sm:text-base">
                        {excerptText(entry.body)}
                      </p>
                      <EntryMetadata
                        createdAt={entry.createdAt}
                        source={entry.source}
                        updatedAt={entry.updatedAt}
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm">
                      <a
                        className="button-secondary inline-flex items-center justify-center px-4 py-2 font-semibold"
                        href={`/entries/${entry.id}`}
                      >
                        View
                      </a>
                      <a
                        className="button-secondary inline-flex items-center justify-center px-4 py-2 font-semibold"
                        href={`/entries/${entry.id}/edit`}
                      >
                        Edit
                      </a>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </JournalChrome>
  );
}
