import { CrisisResources } from "@/components/crisis-resources";
import { JournalChrome } from "@/components/journal-chrome";
import { signOutWithAuthJsCredentials } from "@/lib/auth/authjs-actions";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { readServerEnv, usesAuthJsCredentials } from "@/lib/env";

const limits = [
  "NoemaForge is a self-guided reflection practice. It is not therapy, it is not a therapist, and it does not diagnose.",
  "Reflection assistance is written by a language model. It can be wrong, it can be wrong confidently, and it keeps no memory of you between requests.",
  "The research behind this is narrower than the usual pitch. Expressive writing returns roughly a quarter of the effect of psychotherapy, and structured instructions that change between sessions do better than a blank page. Nothing here has been shown to replace care.",
  "This app is not equipped to handle a crisis. Nothing you write raises an alert, nobody reads it, and the app cannot contact anyone for you.",
  "Nothing you write is filtered, blocked, or refused on its way into your journal. Your writing is yours.",
];

export default async function SafetyLimitsPage() {
  const user = await requireCurrentUser();
  const env = readServerEnv();

  return (
    <JournalChrome
      appName={env.NEXT_PUBLIC_APP_NAME}
      description="Read this once before you start writing. It stays available from the safety page afterwards."
      signOutAction={
        usesAuthJsCredentials(env)
          ? signOutWithAuthJsCredentials
          : "/auth/sign-out"
      }
      title="Before your first session"
      userEmail={user.email}
    >
      <section className="paper-panel space-y-6 p-5 sm:p-7 lg:p-8">
        <div className="space-y-2">
          <p className="eyebrow">What this is and is not</p>
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
            The limits, stated plainly
          </h2>
        </div>

        <ul className="space-y-3">
          {limits.map((limit) => (
            <li
              className="inset-panel p-4 text-sm leading-6 text-foreground sm:text-base"
              key={limit}
            >
              {limit}
            </li>
          ))}
        </ul>

        <CrisisResources locale={env.CRISIS_RESOURCE_LOCALE} />

        <form action="/safety/limits/acknowledge" method="post">
          <button
            className="button-primary inline-flex w-full items-center justify-center px-5 py-3 text-sm font-semibold sm:w-auto"
            type="submit"
          >
            I have read this
          </button>
        </form>
      </section>
    </JournalChrome>
  );
}
