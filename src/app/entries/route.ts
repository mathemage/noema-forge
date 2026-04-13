import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request";
import { JournalError, createJournalEntry } from "@/lib/journal/service";
import { getRequestUrl } from "@/lib/request-url";

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.redirect(getRequestUrl(request, "/sign-in"), 303);
  }

  const formData = await request.formData();

  try {
    const entry = await createJournalEntry(
      {
        body: String(formData.get("body") ?? ""),
      },
      user.id,
    );

    return NextResponse.redirect(
      getRequestUrl(request, `/entries/${entry.id}?message=created`),
      303,
    );
  } catch (error) {
    if (error instanceof JournalError) {
      return NextResponse.redirect(
        getRequestUrl(request, `/?error=${error.code}`),
        303,
      );
    }

    throw error;
  }
}
