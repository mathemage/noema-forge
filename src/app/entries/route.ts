import type { NextAuthRequest } from "next-auth";
import { auth } from "@/auth";
import { getRequestUser } from "@/lib/auth/request";
import { isCaptureSource } from "@/lib/journal/capture-source";
import { JournalError, createJournalEntry } from "@/lib/journal/service";
import { redirectToRequestOrigin } from "@/lib/request-url";

function getField(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

async function handlePost(request: NextAuthRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return redirectToRequestOrigin("/sign-in");
  }

  const formData = await request.formData();
  const assistanceSource = formData.get("assistanceSource");
  const source = formData.get("source");

  try {
    const entry = await createJournalEntry(
      {
        assistanceSource:
          assistanceSource === "fallback" || assistanceSource === "ollama"
            ? assistanceSource
            : undefined,
        feeling: getField(formData, "feeling"),
        followUpQuestion: getField(formData, "followUpQuestion"),
        nextStep: getField(formData, "nextStep"),
        rawBody: getField(formData, "body"),
        rootIssue: getField(formData, "rootIssue"),
        source:
          typeof source === "string" && isCaptureSource(source) ? source : undefined,
        suggestions: formData.getAll("suggestions").map(String),
      },
      user.id,
    );

    return redirectToRequestOrigin(`/entries/${entry.id}?message=created`);
  } catch (error) {
    if (error instanceof JournalError) {
      return redirectToRequestOrigin(`/?error=${error.code}`);
    }

    throw error;
  }
}

export const POST = auth(handlePost);
