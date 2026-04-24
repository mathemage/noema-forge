import { notFound } from "next/navigation";
import { JournalChrome } from "@/components/journal-chrome";
import { signOutWithAuthJsCredentials } from "@/lib/auth/authjs-actions";
import { JournalEntryForm } from "@/components/journal-entry-form";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { readServerEnv, usesAuthJsCredentials } from "@/lib/env";
import { getJournalEntry } from "@/lib/journal/service";
import { getSingleSearchParam } from "@/lib/search-params";

type EditEntryPageProps = {
  params: Promise<{ entryId: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
};

const editErrorMessages: Record<string, string> = {
  "invalid-input": "Write something before saving your changes.",
};

export default async function EditEntryPage({
  params,
  searchParams,
}: EditEntryPageProps) {
  const user = await requireCurrentUser();
  const { entryId } = await params;
  const entry = await getJournalEntry(entryId, user.id);

  if (!entry) {
    notFound();
  }

  const env = readServerEnv();
  const signOutAction = usesAuthJsCredentials(env)
    ? signOutWithAuthJsCredentials
    : "/auth/sign-out";
  const error = getSingleSearchParam((await searchParams).error);

  return (
    <JournalChrome
      actions={
        <a
          className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 font-medium text-foreground transition hover:bg-slate-100"
          href={`/entries/${entry.id}`}
        >
          Back to entry
        </a>
      }
      appName={env.NEXT_PUBLIC_APP_NAME}
      description="Refine the text while keeping the original capture source and archive history private and searchable."
      signOutAction={signOutAction}
      title="Edit entry"
      userEmail={user.email}
    >
      <JournalEntryForm
        action={`/entries/${entry.id}/update`}
        body={entry.body}
        cancelHref={`/entries/${entry.id}`}
        description="Update the journal text while keeping the original capture source in the same searchable archive."
        error={error ? editErrorMessages[error] : undefined}
        heading="Revise this entry"
        key={entry.id}
        submitLabel="Save changes"
      />
    </JournalChrome>
  );
}
