import type { ComponentProps, ReactNode } from "react";
import { SafetyNotice } from "@/components/safety-notice";

type FormAction = NonNullable<ComponentProps<"form">["action"]>;

type JournalChromeProps = {
  actions?: ReactNode;
  appName: string;
  children: ReactNode;
  description: string;
  signOutAction: FormAction;
  title: string;
  userEmail: string;
};

export function JournalChrome({
  actions,
  appName,
  children,
  description,
  signOutAction,
  title,
  userEmail,
}: JournalChromeProps) {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[90rem] flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-5 sm:py-5 lg:gap-6 lg:px-6 lg:py-6">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-white/80" />
      <header className="ink-panel relative overflow-hidden p-5 text-white sm:p-7 lg:p-8">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-28 size-80 rounded-full border border-white/[0.055] bg-white/[0.02]"
        />
        <div className="relative z-10">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden="true" className="brand-mark">
                N
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-[0.08em] text-white">
                  {appName}
                </p>
                <p className="mt-0.5 text-xs text-[#aaa9a2]">
                  Private thoughtwork
                </p>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-xs text-[#c1c2bd] min-[440px]:flex-row min-[440px]:items-center">
              <div className="min-w-0">
                <p className="font-semibold uppercase tracking-[0.14em] text-[#8f938e]">
                  Signed in
                </p>
                <p className="mt-1 truncate text-sm text-[#f0ece5]">{userEmail}</p>
              </div>
              <form action={signOutAction} method="post">
                <button
                  className="button-inverse inline-flex w-full items-center justify-center px-4 py-2 text-sm font-semibold min-[440px]:w-auto"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d39a80]">
                Journal workspace
              </p>
              <h1 className="mt-3 font-display text-4xl leading-none tracking-[-0.035em] text-[#fffaf3] sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#b8bab5] sm:text-base">
                {description}
              </p>
            </div>

            {actions ? (
              <nav
                aria-label="Journal page actions"
                className="flex flex-wrap gap-3 text-sm"
              >
                {actions}
              </nav>
            ) : null}
          </div>
        </div>
      </header>

      {children}

      <SafetyNotice />
    </main>
  );
}
