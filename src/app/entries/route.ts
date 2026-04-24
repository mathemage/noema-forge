import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";
import { auth } from "@/auth";
import { getRequestUser } from "@/lib/auth/request";
import { isCaptureSource } from "@/lib/journal/capture-source";
import { composeJournalEntryBody } from "@/lib/journal/reflection";
import { JournalError, createJournalEntry } from "@/lib/journal/service";
import { getRequestUrl } from "@/lib/request-url";

async function handlePost(request: NextAuthRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.redirect(getRequestUrl("/sign-in"), 303);
  }

  const formData = await request.formData();
  const source = formData.get("source");
  const body = composeJournalEntryBody({
    body: String(formData.get("body") ?? ""),
    feeling: String(formData.get("feeling") ?? ""),
    followUpQuestion: String(formData.get("followUpQuestion") ?? ""),
    nextStep: String(formData.get("nextStep") ?? ""),
    rootIssue: String(formData.get("rootIssue") ?? ""),
    suggestions: formData.getAll("suggestions").map(String),
  });

  try {
    const entry = await createJournalEntry(
      {
        body,
        source:
          typeof source === "string" && isCaptureSource(source) ? source : undefined,
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
