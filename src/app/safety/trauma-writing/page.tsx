import Link from "next/link";
import { JournalChrome } from "@/components/journal-chrome";
import { signOutWithAuthJsCredentials } from "@/lib/auth/authjs-actions";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { readServerEnv, usesAuthJsCredentials } from "@/lib/env";
import { getSingleSearchParam } from "@/lib/search-params";
import { getSafetyProfile } from "@/lib/safety/service";
import {
  TRAUMA_WRITING_DIP_NOTE,
  TRAUMA_WRITING_SHAPE,
  traumaWritingContraindications,
  traumaWritingPrompts,
} from "@/lib/safety/trauma-writing";

type TraumaWritingPageProps = {
  searchParams: Promise<{ message?: string | string[] }>;
};

const messages: Record<string, string> = {
  "opted-in": "Opted in. The writing directions are below.",
  "opted-out": "Opted out. The writing directions are hidden again.",
};

export default async function TraumaWritingPage({
  searchParams,
}: TraumaWritingPageProps) {
  const user = await requireCurrentUser();
  const env = readServerEnv();
  const profile = await getSafetyProfile(user.id);
  const optedIn = Boolean(profile?.traumaWritingOptedInAt);
  const message = getSingleSearchParam((await searchParams).message);

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
      description="Writing directions that ask you to describe a traumatic event. They stay out of the normal flow and are only shown once you have opted in here."
      signOutAction={
        usesAuthJsCredentials(env)
          ? signOutWithAuthJsCredentials
          : "/auth/sign-out"
      }
      title="Writing about trauma"
      userEmail={user.email}
    >
      <section className="paper-panel space-y-6 p-5 sm:p-7 lg:p-8">
        {message && messages[message] ? (
          <div className="status-success" role="status">
            {messages[message]}
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="eyebrow">Read before opting in</p>
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
            Do not start this if any of these is true
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted">
            These directions are off by default and are never offered anywhere
            else in the app. Nothing about your journal changes if you leave them
            off.
          </p>
        </div>

        <ul className="space-y-3">
          {traumaWritingContraindications.map((item) => (
            <li
              className="inset-panel p-4 text-sm leading-6 text-foreground"
              key={item}
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="space-y-3 text-sm leading-6 text-muted">
          <p>{TRAUMA_WRITING_DIP_NOTE}</p>
          <p>{TRAUMA_WRITING_SHAPE}</p>
        </div>

        <form
          action="/safety/trauma-writing/consent"
          className="flex flex-wrap gap-3"
          method="post"
        >
          <input
            name="consent"
            type="hidden"
            value={optedIn ? "opt-out" : "opt-in"}
          />
          <button
            className="button-primary inline-flex items-center justify-center px-5 py-3 text-sm font-semibold"
            type="submit"
          >
            {optedIn
              ? "Turn these directions off"
              : "I have read this. Show the directions."}
          </button>
        </form>

        {optedIn ? (
          <section className="reflection-panel space-y-4 p-4 sm:p-5">
            <h3 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
              Writing directions
            </h3>
            <ol className="space-y-3">
              {traumaWritingPrompts.map((prompt) => (
                <li
                  className="inset-panel p-4 text-sm leading-6 text-foreground"
                  key={prompt}
                >
                  {prompt}
                </li>
              ))}
            </ol>
            <p className="text-sm leading-6 text-muted">
              Take one of these to a new entry when you are ready. Stopping in
              the middle is a legitimate way to finish.
            </p>
          </section>
        ) : null}
      </section>
    </JournalChrome>
  );
}
