import Link from "next/link";
import { redirect } from "next/navigation";
import { EntryMetadata } from "@/components/entry-metadata";
import { JournalChrome } from "@/components/journal-chrome";
import { signOutWithAuthJsCredentials } from "@/lib/auth/authjs-actions";
import { JournalCaptureForm } from "@/components/journal-capture-form";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { readServerEnv, usesAuthJsCredentials } from "@/lib/env";
import { excerptText } from "@/lib/formatting";
import {
  JOURNAL_ENTRY_BODY_MAX_LENGTH,
  JOURNAL_HISTORY_PAGE_SIZE,
  REFLECTION_FIELD_MAX_LENGTH,
} from "@/lib/journal/limits";
import { listJournalEntries } from "@/lib/journal/service";
import { getSingleSearchParam } from "@/lib/search-params";
import { getSafetyProfile } from "@/lib/safety/service";

type HomePageProps = {
  searchParams: Promise<{
    error?: string | string[];
    from?: string | string[];
    page?: string | string[];
    q?: string | string[];
    to?: string | string[];
  }>;
};

type HistoryFilters = {
  from?: string;
  query: string;
  to?: string;
};

function buildHistoryHref(filters: HistoryFilters, page: number) {
  const search = new URLSearchParams();

  if (filters.query) {
    search.set("q", filters.query);
  }

  if (filters.from) {
    search.set("from", filters.from);
  }

  if (filters.to) {
    search.set("to", filters.to);
  }

  if (page > 1) {
    search.set("page", String(page));
  }

  return search.size ? `/?${search}` : "/";
}

const journalEntryBodyMaxLengthLabel =
  JOURNAL_ENTRY_BODY_MAX_LENGTH.toLocaleString("en-US");
const reflectionFieldMaxLengthLabel =
  REFLECTION_FIELD_MAX_LENGTH.toLocaleString("en-US");
const homeErrorMessages: Record<string, string> = {
  "entry-too-long": `Shorten the entry or reflection before saving. The saved journal text must be ${journalEntryBodyMaxLengthLabel} characters or fewer.`,
  "invalid-input": `Add a raw entry and keep each reflection field to ${reflectionFieldMaxLengthLabel} characters or fewer before saving.`,
  "not-found": "That entry is no longer available.",
};

function emptyHistoryMessage(filters: HistoryFilters, page: number) {
  if (page > 1) {
    return "This page is past the end of the archive.";
  }

  if (filters.query) {
    return `No entries match "${filters.query}" yet.`;
  }

  if (filters.from || filters.to) {
    return "No entries fall inside that date range yet.";
  }

  return "No entries yet. Save your first capture to start the archive.";
}

export default async function Home({ searchParams }: HomePageProps) {
  const user = await requireCurrentUser();
  const safetyProfile = await getSafetyProfile(user.id);

  // The limits statement comes before the first session, not after it.
  if (!safetyProfile?.limitsAcknowledgedAt) {
    redirect("/safety/limits");
  }

  const params = await searchParams;
  const env = readServerEnv();
  const signOutAction = usesAuthJsCredentials(env)
    ? signOutWithAuthJsCredentials
    : "/auth/sign-out";
  const error = getSingleSearchParam(params.error);
  const filters: HistoryFilters = {
    from: getSingleSearchParam(params.from),
    query: getSingleSearchParam(params.q)?.trim() ?? "",
    to: getSingleSearchParam(params.to),
  };
  const { entries, hasNextPage, page } = await listJournalEntries(
    { ...filters, page: getSingleSearchParam(params.page) },
    user.id,
  );

  return (
    <JournalChrome
      actions={
        <Link
          className="button-inverse inline-flex items-center justify-center px-4 py-2 font-semibold"
          href="/safety"
        >
          Safety and crisis resources
        </Link>
      }
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
                Your newest entries appear first, {JOURNAL_HISTORY_PAGE_SIZE} to a
                page. Search stays inside PostgreSQL.
              </p>
            </div>

            <form className="flex w-full flex-col gap-3 lg:max-w-md" method="get">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  aria-label="Search entry text"
                  className="journal-control w-full px-4 py-3 text-sm"
                  defaultValue={filters.query}
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
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="w-full space-y-1 text-xs font-semibold text-muted">
                  <span>From</span>
                  <input
                    className="journal-control w-full px-4 py-2.5 text-sm"
                    defaultValue={filters.from ?? ""}
                    name="from"
                    type="date"
                  />
                </label>
                <label className="w-full space-y-1 text-xs font-semibold text-muted">
                  <span>To</span>
                  <input
                    className="journal-control w-full px-4 py-2.5 text-sm"
                    defaultValue={filters.to ?? ""}
                    name="to"
                    type="date"
                  />
                </label>
              </div>
            </form>
          </div>

          <div className="mt-6 space-y-4">
            {entries.length === 0 ? (
              <div className="inset-panel border-dashed px-5 py-8 text-sm leading-6 text-muted">
                <p className="font-semibold text-foreground">The archive is quiet.</p>
                <p className="mt-1">{emptyHistoryMessage(filters, page)}</p>
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

          {entries.length > 0 || page > 1 ? (
            <nav
              aria-label="Journal history pages"
              className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm"
            >
              <span className="text-muted">Page {page}</span>
              <div className="flex flex-wrap gap-3">
                {page > 1 ? (
                  <a
                    className="button-secondary inline-flex items-center justify-center px-4 py-2 font-semibold"
                    href={buildHistoryHref(filters, page - 1)}
                  >
                    Previous entries
                  </a>
                ) : null}
                {hasNextPage ? (
                  <a
                    className="button-secondary inline-flex items-center justify-center px-4 py-2 font-semibold"
                    href={buildHistoryHref(filters, page + 1)}
                  >
                    Older entries
                  </a>
                ) : null}
              </div>
            </nav>
          ) : null}
        </section>
      </div>
    </JournalChrome>
  );
}
