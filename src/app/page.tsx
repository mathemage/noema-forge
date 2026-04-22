import { EntryMetadata } from "@/components/entry-metadata";
import { JournalChrome } from "@/components/journal-chrome";
import { signOutWithAuthJsCredentials } from "@/lib/auth/authjs-actions";
import { JournalEntryForm } from "@/components/journal-entry-form";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { readServerEnv, usesAuthJsCredentials } from "@/lib/env";
import { excerptText } from "@/lib/formatting";
import { listJournalEntries } from "@/lib/journal/service";
import { getSingleSearchParam } from "@/lib/search-params";

type HomePageProps = {
  searchParams: Promise<{
    error?: string | string[];
    q?: string | string[];
  }>;
};

const homeErrorMessages: Record<string, string> = {
  "invalid-input": "Write something before saving your entry.",
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
      description="Capture typed thoughts, edit them later, and search the archive without leaving your private journal."
      signOutAction={signOutAction}
      title="Journal history"
      userEmail={user.email}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <JournalEntryForm
          action="/entries"
          description="Typing is the default capture path for this slice. Save raw thoughts here, then review or edit them from the archive."
          error={error ? homeErrorMessages[error] : undefined}
          heading="New typed entry"
          submitLabel="Save entry"
        />

        <section className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Search and browse
              </h2>
              <p className="text-sm leading-6 text-muted sm:text-base">
                Your newest entries appear first. Search stays inside PostgreSQL.
              </p>
            </div>

            <form className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-md" method="get">
              <input
                aria-label="Search entry text"
                className="w-full rounded-full border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                defaultValue={query}
                name="q"
                placeholder="Search entry text"
                type="search"
              />
              <button
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                type="submit"
              >
                Search
              </button>
            </form>
          </div>

          <div className="mt-6 space-y-4">
            {entries.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-slate-50/70 px-5 py-8 text-sm leading-6 text-muted">
                {query
                  ? `No entries match "${query}" yet.`
                  : "No entries yet. Save your first typed capture to start the archive."}
              </div>
            ) : (
              entries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-3xl border border-border/80 bg-slate-50/70 p-5"
                >
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
                        className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 font-medium text-foreground transition hover:bg-slate-100"
                        href={`/entries/${entry.id}`}
                      >
                        View
                      </a>
                      <a
                        className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 font-medium text-foreground transition hover:bg-slate-100"
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
