import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request";
import { JournalError, updateJournalEntry } from "@/lib/journal/service";
import { getRequestUrl } from "@/lib/request-url";

type EntryUpdateRouteContext = {
  params: Promise<{ entryId: string }>;
};

export async function POST(
  request: NextRequest,
  context: EntryUpdateRouteContext,
) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.redirect(getRequestUrl(request, "/sign-in"), 303);
  }

  const { entryId } = await context.params;
  const formData = await request.formData();

  try {
    await updateJournalEntry(
      entryId,
      {
        body: String(formData.get("body") ?? ""),
      },
      user.id,
    );

    return NextResponse.redirect(
      getRequestUrl(request, `/entries/${entryId}?message=updated`),
      303,
    );
  } catch (error) {
    if (error instanceof JournalError) {
      const pathname =
        error.code === "invalid-input"
          ? `/entries/${entryId}/edit?error=${error.code}`
          : "/?error=not-found";

      return NextResponse.redirect(getRequestUrl(request, pathname), 303);
    }

    throw error;
  }
}
