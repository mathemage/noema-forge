import type { ReactNode } from "react";

type JournalChromeProps = {
  actions?: ReactNode;
  appName: string;
  children: ReactNode;
  description: string;
  title: string;
  userEmail: string;
};

export function JournalChrome({
  actions,
  appName,
  children,
  description,
  title,
  userEmail,
}: JournalChromeProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm backdrop-blur sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <p className="inline-flex w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
              {appName}
            </p>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted sm:text-base">
                {description}
              </p>
            </div>
            {actions ? (
              <div className="flex flex-wrap gap-3 text-sm">{actions}</div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border bg-slate-50/80 p-4 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Signed in as</p>
            <p className="mt-1 break-all">{userEmail}</p>
            <form action="/auth/sign-out" className="mt-4" method="post">
              <button
                className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 font-medium text-foreground transition hover:bg-slate-100"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {children}
    </main>
  );
}
