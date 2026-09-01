import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalChrome } from "@/components/journal-chrome";
import { signOutWithAuthJsCredentials } from "@/lib/auth/authjs-actions";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { readServerEnv, usesAuthJsCredentials } from "@/lib/env";
import { getSingleSearchParam } from "@/lib/search-params";
import {
  getMaxScore,
  isSeverityInstrument,
  severityInstruments,
  severityResponseOptions,
} from "@/lib/safety/instruments";

type CheckInPageProps = {
  params: Promise<{ instrument: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function SeverityCheckInPage({
  params,
  searchParams,
}: CheckInPageProps) {
  const { instrument } = await params;

  if (!isSeverityInstrument(instrument)) {
    notFound();
  }

  const user = await requireCurrentUser();
  const env = readServerEnv();
  const definition = severityInstruments[instrument];
  const error = getSingleSearchParam((await searchParams).error);

  return (
    <JournalChrome
      actions={
        <Link
          className="button-inverse inline-flex items-center justify-center px-4 py-2 font-semibold"
          href="/safety"
        >
          Back to safety
        </Link>
      }
      appName={env.NEXT_PUBLIC_APP_NAME}
      description="Answer every item, or leave the check-in and come back later. The app stores the total and nothing else."
      signOutAction={
        usesAuthJsCredentials(env)
          ? signOutWithAuthJsCredentials
          : "/auth/sign-out"
      }
      title={`${definition.label} check-in`}
      userEmail={user.email}
    >
      <section className="paper-panel space-y-6 p-5 sm:p-7 lg:p-8">
        <div className="space-y-2">
          <p className="eyebrow">Optional check-in</p>
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
            {definition.stem}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted">
            The total runs from 0 to {getMaxScore(instrument)}. NoemaForge stores
            it and shows it back to you. It does not label it, band it, or tell
            you what it means.
          </p>
        </div>

        {error ? (
          <div className="status-danger" role="alert">
            Answer every item before saving the check-in. A partial questionnaire
            has no score.
          </div>
        ) : null}

        <form
          action={`/safety/check-in/${instrument}/save`}
          className="space-y-5"
          method="post"
        >
          {definition.items.map((item, index) => (
            <fieldset className="inset-panel space-y-3 p-4" key={item}>
              <legend className="text-sm font-semibold text-foreground">
                {index + 1}. {item}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {severityResponseOptions.map((option) => (
                  <label
                    className="flex items-center gap-3 text-sm leading-6 text-foreground"
                    key={option.value}
                  >
                    <input
                      name={`answer-${index}`}
                      required
                      type="radio"
                      value={option.value}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <button
            className="button-primary inline-flex w-full items-center justify-center px-5 py-3 text-sm font-semibold sm:w-auto"
            type="submit"
          >
            Save check-in
          </button>
        </form>

        <p className="text-xs leading-5 text-muted">{definition.attribution}</p>
      </section>
    </JournalChrome>
  );
}
