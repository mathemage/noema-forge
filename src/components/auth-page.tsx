import type { ComponentProps } from "react";

type FormAction = NonNullable<ComponentProps<"form">["action"]>;

type AuthPageProps = {
  appName: string;
  error?: string;
  message?: string;
  registerAction: FormAction;
  signInAction: FormAction;
  useAuthJsCredentials: boolean;
};

const authErrorMessages: Record<string, string> = {
  "email-taken": "That email address already has an account.",
  "invalid-credentials": "Check your email and password, then try again.",
  "invalid-input":
    "Use a valid email address and a password with at least 8 characters.",
};

const authMessages: Record<string, string> = {
  "signed-out": "You have been signed out.",
};

export function AuthPage({
  appName,
  error,
  message,
  registerAction,
  signInAction,
  useAuthJsCredentials,
}: AuthPageProps) {
  const notice = (error && authErrorMessages[error]) || (message && authMessages[message]);

  return (
    <main className="relative min-h-screen px-3 py-3 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-white/80" />
      <section
        aria-label={`${appName} journal access`}
        className="mx-auto grid min-h-[calc(100vh-1.5rem)] w-full max-w-[90rem] gap-4 sm:min-h-[calc(100vh-2.5rem)] sm:gap-5 lg:grid-cols-[minmax(19rem,0.78fr)_minmax(0,1.22fr)] lg:items-stretch lg:gap-6"
      >
        <aside className="ink-panel relative flex min-h-[30rem] flex-col justify-between overflow-hidden p-6 text-white sm:p-8 lg:min-h-0 lg:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 size-72 rounded-full border border-white/[0.06] bg-white/[0.025]"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-20 size-80 rounded-full border border-white/[0.05]"
          />

          <div className="relative z-10 flex items-center gap-3">
            <span aria-hidden="true" className="brand-mark">
              N
            </span>
            <div>
              <p className="text-sm font-semibold tracking-[0.08em] text-white">
                {appName}
              </p>
              <p className="mt-0.5 text-xs text-[#aaa9a2]">
                Private thoughtwork
              </p>
            </div>
          </div>

          <div className="relative z-10 my-12 max-w-xl lg:my-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d39a80]">
              Capture. Distill. Remember.
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.02] tracking-[-0.035em] text-[#fffaf3] sm:text-5xl lg:text-[3.4rem]">
              Private multimodal capture, ready when you are.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-[#b8bab5] sm:text-base">
              Keep typed notes, voice dictation, handwriting OCR, and guided
              reflection together in one private, searchable archive.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-2 text-center text-[0.67rem] font-semibold uppercase tracking-[0.12em] text-[#b8bab5] sm:gap-3 sm:text-xs">
            {["Private", "Multimodal", "Searchable"].map((value) => (
              <span
                className="rounded-xl border border-white/10 bg-white/[0.045] px-2 py-3"
                key={value}
              >
                {value}
              </span>
            ))}
          </div>
        </aside>

        <div className="paper-panel flex flex-col justify-center p-5 sm:p-8 lg:p-9 xl:p-10">
          <div className="mb-6 max-w-2xl sm:mb-8">
            <p className="eyebrow">Journal access</p>
            <h2 className="mt-3 font-display text-3xl leading-tight tracking-[-0.025em] text-foreground sm:text-4xl">
              Your private archive starts here.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
              Create an account or return to the thoughts you have already
              shaped.
            </p>
          </div>

          {notice ? (
            <div
              className={`mb-5 ${error ? "status-danger" : "status-success"}`}
              role={error ? "alert" : "status"}
            >
              {notice}
            </div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-2 xl:gap-5">
            <article className="inset-panel p-5 sm:p-6">
              <div className="space-y-2">
                <p className="eyebrow">New here</p>
                <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
                  Create account
                </h2>
                <p className="text-sm leading-6 text-muted">
                  Start a private journal with an email address and password.
                  {useAuthJsCredentials
                    ? " When the optional Auth.js credentials mode is enabled, account creation still uses the same journal user record before handing session management to Auth.js."
                    : ""}
                </p>
              </div>

              <form action={registerAction} className="mt-6 space-y-4" method="post">
                <label className="block space-y-2 text-sm font-semibold text-foreground">
                  <span>Email</span>
                  <input
                    autoComplete="email"
                    className="journal-control w-full px-4 py-3 text-base"
                    name="email"
                    required
                    type="email"
                  />
                </label>
                <label className="block space-y-2 text-sm font-semibold text-foreground">
                  <span>Password</span>
                  <input
                    autoComplete="new-password"
                    className="journal-control w-full px-4 py-3 text-base"
                    minLength={8}
                    name="password"
                    required
                    type="password"
                  />
                </label>
                <button
                  className="button-primary inline-flex w-full items-center justify-center px-5 py-3 text-sm font-semibold"
                  type="submit"
                >
                  Create journal account
                </button>
              </form>
            </article>

            <article className="inset-panel p-5 sm:p-6">
              <div className="space-y-2">
                <p className="eyebrow">Welcome back</p>
                <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
                  Sign in
                </h2>
                <p className="text-sm leading-6 text-muted">
                  Pick up where you left off and search your journal history.
                  {useAuthJsCredentials
                    ? " This environment is using the optional Auth.js credentials session path."
                    : ""}
                </p>
              </div>

              <form action={signInAction} className="mt-6 space-y-4" method="post">
                <label className="block space-y-2 text-sm font-semibold text-foreground">
                  <span>Email</span>
                  <input
                    autoComplete="email"
                    className="journal-control w-full px-4 py-3 text-base"
                    name="email"
                    required
                    type="email"
                  />
                </label>
                <label className="block space-y-2 text-sm font-semibold text-foreground">
                  <span>Password</span>
                  <input
                    autoComplete="current-password"
                    className="journal-control w-full px-4 py-3 text-base"
                    minLength={8}
                    name="password"
                    required
                    type="password"
                  />
                </label>
                <button
                  className="button-secondary inline-flex w-full items-center justify-center px-5 py-3 text-sm font-semibold"
                  type="submit"
                >
                  Sign in
                </button>
              </form>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
