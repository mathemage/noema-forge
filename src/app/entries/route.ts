import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";
import { auth } from "@/auth";
import { getRequestUser } from "@/lib/auth/request";
import { JournalError, createJournalEntry } from "@/lib/journal/service";
import { getRequestUrl } from "@/lib/request-url";

async function handlePost(request: NextAuthRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.redirect(getRequestUrl("/sign-in"), 303);
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
      getRequestUrl(`/entries/${entry.id}?message=created`),
      303,
    );
  } catch (error) {
    if (error instanceof JournalError) {
      return NextResponse.redirect(
        getRequestUrl(`/?error=${error.code}`),
        303,
      );
    }

    throw error;
  }
}

export const POST = auth(handlePost);
