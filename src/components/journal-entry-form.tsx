import { JOURNAL_ENTRY_BODY_MAX_LENGTH } from "@/lib/journal/limits";

type JournalEntryFormProps = {
  action: string;
  body?: string;
  cancelHref?: string;
  description: string;
  error?: string;
  heading: string;
  submitLabel: string;
};

export function JournalEntryForm({
  action,
  body,
  cancelHref,
  description,
  error,
  heading,
  submitLabel,
}: JournalEntryFormProps) {
  return (
    <section className="paper-panel p-5 sm:p-7 lg:p-8">
      <div className="space-y-2">
        <p className="eyebrow">Journal editor</p>
        <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
          {heading}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted sm:text-base">
          {description}
        </p>
      </div>

      {error ? (
        <div className="status-danger mt-4" role="alert">
          {error}
        </div>
      ) : null}

      <form action={action} className="mt-6 space-y-4" method="post">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="body">
            Entry
          </label>
          <textarea
            className="journal-control min-h-64 w-full px-4 py-3 text-base leading-7"
            defaultValue={body ?? ""}
            id="body"
            maxLength={JOURNAL_ENTRY_BODY_MAX_LENGTH}
            name="body"
            placeholder="Write or review the journal text you want to keep."
            required
          />
          <p className="text-xs leading-5 text-muted">
            Saved entries keep the original capture source plus created and updated
            timestamps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="button-primary inline-flex items-center justify-center px-5 py-3 text-sm font-semibold"
            type="submit"
          >
            {submitLabel}
          </button>
          {cancelHref ? (
            <a
              className="button-secondary inline-flex items-center justify-center px-5 py-3 text-sm font-semibold"
              href={cancelHref}
            >
              Cancel
            </a>
          ) : null}
        </div>
      </form>
    </section>
  );
}
