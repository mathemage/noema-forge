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
    <section className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {heading}
        </h2>
        <p className="text-sm leading-6 text-muted sm:text-base">{description}</p>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form action={action} className="mt-6 space-y-4" method="post">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="body">
            Entry
          </label>
          <textarea
            className="min-h-56 w-full rounded-3xl border border-border bg-white px-4 py-3 text-base text-foreground outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            defaultValue={body}
            id="body"
            maxLength={20_000}
            name="body"
            placeholder="Type the raw thought, feeling, or note you want to keep."
            required
          />
          <p className="text-xs leading-5 text-muted">
            Saved entries keep the typed source label plus created and updated
            timestamps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            type="submit"
          >
            {submitLabel}
          </button>
          {cancelHref ? (
            <a
              className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground transition hover:bg-slate-50"
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
