type AuthPageProps = {
  appName: string;
  error?: string;
  message?: string;
};

const authErrorMessages: Record<string, string> = {
  "email-taken": "That email address already has an account.",
  "invalid-credentials": "Check your email and password, then try again.",
  "invalid-input":
    "Use a valid email address and a password with at least 8 characters.",
};

const authMessageMessages: Record<string, string> = {
  "signed-out": "You have been signed out.",
};

export function AuthPage({ appName, error, message }: AuthPageProps) {
  const notice =
    (error && authErrorMessages[error]) || (message && authMessageMessages[message]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-border/80 bg-card/95 p-8 shadow-sm backdrop-blur">
        <div className="max-w-3xl space-y-4">
          <p className="inline-flex w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
            {appName}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Private typed capture, ready when you are.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Create a journal account or sign in to keep a private archive of typed
            entries, searchable history, and clear edit flows.
          </p>
        </div>
      </section>

      {notice ? (
        <section
          className={`rounded-3xl border px-5 py-4 text-sm ${
            error
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {notice}
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm sm:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Create account
            </h2>
            <p className="text-sm leading-6 text-muted sm:text-base">
              Start a private journal with an email address and password.
            </p>
          </div>

          <form action="/auth/register" className="mt-6 space-y-4" method="post">
            <label className="block space-y-2 text-sm font-medium text-foreground">
              <span>Email</span>
              <input
                autoComplete="email"
                className="w-full rounded-full border border-border bg-white px-4 py-3 text-base text-foreground outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                name="email"
                required
                type="email"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-foreground">
              <span>Password</span>
              <input
                autoComplete="new-password"
                className="w-full rounded-full border border-border bg-white px-4 py-3 text-base text-foreground outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                minLength={8}
                name="password"
                required
                type="password"
              />
            </label>
            <button
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              type="submit"
            >
              Create journal account
            </button>
          </form>
        </article>

        <article className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm sm:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Sign in
            </h2>
            <p className="text-sm leading-6 text-muted sm:text-base">
              Pick up where you left off and search your journal history.
            </p>
          </div>

          <form action="/auth/sign-in" className="mt-6 space-y-4" method="post">
            <label className="block space-y-2 text-sm font-medium text-foreground">
              <span>Email</span>
              <input
                autoComplete="email"
                className="w-full rounded-full border border-border bg-white px-4 py-3 text-base text-foreground outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                name="email"
                required
                type="email"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-foreground">
              <span>Password</span>
              <input
                autoComplete="current-password"
                className="w-full rounded-full border border-border bg-white px-4 py-3 text-base text-foreground outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                minLength={8}
                name="password"
                required
                type="password"
              />
            </label>
            <button
              className="inline-flex w-full items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground transition hover:bg-slate-50"
              type="submit"
            >
              Sign in
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
