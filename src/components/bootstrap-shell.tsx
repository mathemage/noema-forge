import type { BootstrapCheck, BootstrapSummary } from "@/lib/bootstrap";

type BootstrapShellProps = {
  appName: string;
  checks: BootstrapCheck[];
  summary: BootstrapSummary;
};

const futureSlices = [
  {
    title: "Authentication",
    detail: "The app shell and users table are ready for the private journal slice.",
  },
  {
    title: "Entries",
    detail: "Typed capture can build directly on the journal_entries schema and responsive shell.",
  },
  {
    title: "Uploads",
    detail: "Voice and OCR work can reuse the shared S3 client and upload_assets schema.",
  },
];

export function BootstrapShell({
  appName,
  checks,
  summary,
}: BootstrapShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-8 sm:px-10 lg:px-12">
      <section className="rounded-3xl border border-border/80 bg-card/90 p-8 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="inline-flex w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
              {appName} bootstrap
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Bootstrap the journaling foundation
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
                This scaffold wires the responsive shell, database, storage, and
                automation surfaces that the next roadmap slices can build on.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Bootstrap status</p>
            <p className="mt-1">
              {summary.configured} of {summary.total} checks configured
            </p>
            <p className="mt-2 max-w-xs leading-6 text-slate-600">
              {summary.label}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            href="/api/health"
          >
            Open /api/health
          </a>
          <span className="inline-flex items-center rounded-full border border-border bg-white px-5 py-3 text-sm text-muted">
            Ready for auth, entries, and upload features
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {checks.map((check) => (
          <article
            key={check.key}
            className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {check.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {check.detail}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  check.configured
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {check.configured ? "Configured" : "Pending"}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-border/80 bg-card/95 p-8 shadow-sm">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            What this unlocks next
          </h2>
          <p className="text-sm leading-6 text-muted sm:text-base">
            Roadmap item 2 stops at the foundation. These are the product slices
            it leaves ready for follow-up PRs.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {futureSlices.map((slice) => (
            <article
              key={slice.title}
              className="rounded-2xl border border-border bg-slate-50/80 p-5"
            >
              <h3 className="text-base font-semibold text-foreground">
                {slice.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {slice.detail}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
