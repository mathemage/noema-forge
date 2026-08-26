import type { NextAuthRequest } from "next-auth";
import { auth } from "@/auth";
import { getRequestUser } from "@/lib/auth/request";
import { JournalError, updateJournalEntry } from "@/lib/journal/service";
import { redirectToRequestOrigin } from "@/lib/request-url";

type EntryUpdateRouteContext = {
  params: Promise<{ entryId: string }>;
};

function getField(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

async function handlePost(
  request: NextAuthRequest,
  context: EntryUpdateRouteContext,
) {
  const user = await getRequestUser(request);

  if (!user) {
    return redirectToRequestOrigin("/sign-in");
  }

  const { entryId } = await context.params;
  const formData = await request.formData();

  try {
    await updateJournalEntry(
      entryId,
      {
        feeling: getField(formData, "feeling"),
        nextStep: getField(formData, "nextStep"),
        rawBody: getField(formData, "body"),
        rootIssue: getField(formData, "rootIssue"),
      },
      user.id,
    );

    return redirectToRequestOrigin(`/entries/${entryId}?message=updated`);
  } catch (error) {
    if (error instanceof JournalError) {
      const pathname =
        error.code === "not-found"
          ? "/?error=not-found"
          : `/entries/${entryId}/edit?error=${error.code}`;

      return redirectToRequestOrigin(pathname);
    }

    throw error;
  }
}

export const POST = auth(handlePost);
