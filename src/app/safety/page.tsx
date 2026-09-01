import Link from "next/link";
import { CrisisResources } from "@/components/crisis-resources";
import { JournalChrome } from "@/components/journal-chrome";
import {
  MEANS_SAFETY_MESSAGE,
  SafetyPlanForm,
} from "@/components/safety-plan-form";
import { signOutWithAuthJsCredentials } from "@/lib/auth/authjs-actions";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { readServerEnv, usesAuthJsCredentials } from "@/lib/env";
import { formatTimestamp } from "@/lib/formatting";
import { getSingleSearchParam } from "@/lib/search-params";
import {
  getMaxScore,
  isAboveRoutingThreshold,
  isCheckInDue,
  nextCheckInDate,
  SEVERITY_CHECK_IN_INTERVAL_DAYS,
  severityInstruments,
  severityInstrumentValues,
} from "@/lib/safety/instruments";
import { SAFETY_PLAN_FRAMING } from "@/lib/safety/safety-plan";
import { getLatestCheckIns, getSafetyPlan } from "@/lib/safety/service";

type SafetyPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
  }>;
};

const safetyMessages: Record<string, string> = {
  "check-in-saved": "Check-in stored.",
  "plan-saved": "Safety plan saved.",
};

const safetyErrors: Record<string, string> = {
  "invalid-input":
    "That plan could not be saved. Keep each step to 2,000 characters or fewer.",
  "means-safety-required": MEANS_SAFETY_MESSAGE,
};

export default async function SafetyPage({ searchParams }: SafetyPageProps) {
  const user = await requireCurrentUser();
  const env = readServerEnv();
  const params = await searchParams;
  const message = getSingleSearchParam(params.message);
  const error = getSingleSearchParam(params.error);
  const [plan, checkIns] = await Promise.all([
    getSafetyPlan(user.id),
    getLatestCheckIns(user.id),
  ]);

  return (
    <JournalChrome
      actions={
        <>
          <Link
            className="button-inverse inline-flex items-center justify-center px-4 py-2 font-semibold"
            href="/"
          >
            Back to journal
          </Link>
          <Link
            className="button-inverse inline-flex items-center justify-center px-4 py-2 font-semibold"
            href="/safety/limits"
          >
            Full limits statement
          </Link>
        </>
      }
      appName={env.NEXT_PUBLIC_APP_NAME}
      description="Crisis resources, your safety plan, and optional severity check-ins. One step away from every screen in the app."
      signOutAction={
        usesAuthJsCredentials(env)
          ? signOutWithAuthJsCredentials
          : "/auth/sign-out"
      }
      title="Safety"
      userEmail={user.email}
    >
      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
        <section className="paper-panel p-5 sm:p-7 lg:p-8">
          {message && safetyMessages[message] ? (
            <div className="status-success mb-5" role="status">
              {safetyMessages[message]}
            </div>
          ) : null}

          <CrisisResources locale={env.CRISIS_RESOURCE_LOCALE} />
        </section>

        <section className="paper-panel space-y-5 p-5 sm:p-7 lg:p-8">
          <div className="space-y-2">
            <p className="eyebrow">Safety plan</p>
            <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
              {plan ? "Your safety plan" : "Write a safety plan"}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              {SAFETY_PLAN_FRAMING}
            </p>
            {plan ? (
              <p className="text-sm leading-6 text-muted">
                Last revised {formatTimestamp(plan.updatedAt)}.
              </p>
            ) : null}
          </div>

          <SafetyPlanForm
            error={error ? safetyErrors[error] : undefined}
            plan={plan}
          />
        </section>

        <section className="paper-panel space-y-5 p-5 sm:p-7 lg:p-8">
          <div className="space-y-2">
            <p className="eyebrow">Optional check-ins</p>
            <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
              PHQ-9 and GAD-7
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              Optional, {SEVERITY_CHECK_IN_INTERVAL_DAYS} days apart because that
              is the window each instrument asks about, and skippable forever.
              NoemaForge stores the total and shows it back to you. It never
              labels the number, bands it, or tells you what it means about you.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {severityInstrumentValues.map((instrument) => {
              const definition = severityInstruments[instrument];
              const latest = checkIns[instrument];

              return (
                <article className="inset-panel space-y-3 p-5" key={instrument}>
                  <h3 className="text-lg font-semibold text-foreground">
                    {definition.label}
                  </h3>

                  {latest ? (
                    <p className="text-sm leading-6 text-foreground">
                      <span className="font-semibold">
                        {latest.score} of {getMaxScore(instrument)}
                      </span>{" "}
                      on {formatTimestamp(latest.createdAt)}.
                    </p>
                  ) : (
                    <p className="text-sm leading-6 text-muted">
                      No check-in stored yet.
                    </p>
                  )}

                  <p className="text-sm leading-6 text-muted">
                    {!latest || isCheckInDue(latest.createdAt)
                      ? "Available now."
                      : `Next one from ${formatTimestamp(nextCheckInDate(latest.createdAt))}. Taking it sooner measures an overlapping fortnight.`}
                  </p>

                  {latest && isAboveRoutingThreshold(instrument, latest.score) ? (
                    <p className="inset-panel p-4 text-sm leading-6 text-foreground">
                      {definition.routingMessage}
                    </p>
                  ) : null}

                  <Link
                    className="button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
                    href={`/safety/check-in/${instrument}`}
                  >
                    Start {definition.label}
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="paper-panel space-y-4 p-5 sm:p-7 lg:p-8">
          <div className="space-y-2">
            <p className="eyebrow">Off by default</p>
            <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
              Writing about trauma
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              Directions that ask you to describe a traumatic event sit behind a
              one-off consent step and a list of reasons not to start. They never
              appear in the normal flow.
            </p>
          </div>

          <Link
            className="button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
            href="/safety/trauma-writing"
          >
            Read the consent step
          </Link>
        </section>
      </div>
    </JournalChrome>
  );
}
