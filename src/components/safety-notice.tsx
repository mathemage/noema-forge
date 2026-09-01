import Link from "next/link";
import { readServerEnv } from "@/lib/env";
import { getCrisisResources, type CrisisLocale } from "@/lib/safety/crisis-resources";

export const LIMITS_STATEMENT =
  "NoemaForge is a self-guided reflection practice. It is not therapy, it is not a therapist, and it does not diagnose. Reflection assistance is written by a language model and can be wrong. It is not equipped to handle a crisis: nothing you write here raises an alert, and the app cannot contact anyone for you.";

type SafetyNoticeProps = {
  locale?: CrisisLocale;
};

/**
 * The persistent limits statement and the configured crisis line. Rendered on
 * every screen, signed in or out, so neither is ever more than one step away.
 */
export function SafetyNotice({
  locale = readServerEnv().CRISIS_RESOURCE_LOCALE,
}: SafetyNoticeProps) {
  const { emergency, resources } = getCrisisResources(locale);
  const [primary] = resources;

  return (
    <footer
      aria-label="Safety and limits"
      className="inset-panel space-y-3 p-4 text-sm leading-6 text-muted sm:p-5"
    >
      <p className="max-w-3xl">{LIMITS_STATEMENT}</p>
      <p className="break-words font-semibold text-foreground">
        Emergency: {emergency}. {primary.name}: {primary.contact}.
      </p>
      <Link
        className="button-secondary inline-flex items-center justify-center px-4 py-2 text-sm font-semibold"
        href="/safety"
      >
        Crisis resources and safety plan
      </Link>
    </footer>
  );
}
