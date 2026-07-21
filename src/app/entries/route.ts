import type { NextAuthRequest } from "next-auth";
import { auth } from "@/auth";
import { getRequestUser } from "@/lib/auth/request";
import { isCaptureSource } from "@/lib/journal/capture-source";
import {
  JOURNAL_ENTRY_BODY_MAX_LENGTH,
  REFLECTION_FIELD_MAX_LENGTH,
} from "@/lib/journal/limits";
import { composeJournalEntryBody } from "@/lib/journal/reflection";
import { JournalError, createJournalEntry } from "@/lib/journal/service";
import { redirectToRequestOrigin } from "@/lib/request-url";

function isReflectionFieldValid(value: string) {
  return value.trim().length <= REFLECTION_FIELD_MAX_LENGTH;
}

function getReflectionField(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "");

  return isReflectionFieldValid(value) ? value : null;
}

function getReflectionSuggestions(formData: FormData) {
  const suggestionValues = formData.getAll("suggestions");

  if (suggestionValues.length > 3) {
    return null;
  }

  const suggestions = suggestionValues.map(String);

  return suggestions.every(isReflectionFieldValid) ? suggestions : null;
}

async function handlePost(request: NextAuthRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return redirectToRequestOrigin("/sign-in");
  }

  const formData = await request.formData();
  const source = formData.get("source");
  const assistanceSource = formData.get("assistanceSource");
  const feeling = getReflectionField(formData, "feeling");
  const followUpQuestion = getReflectionField(formData, "followUpQuestion");
  const nextStep = getReflectionField(formData, "nextStep");
  const rootIssue = getReflectionField(formData, "rootIssue");
  const suggestions = getReflectionSuggestions(formData);

  if (
    feeling === null ||
    followUpQuestion === null ||
    nextStep === null ||
    rootIssue === null ||
    suggestions === null
  ) {
    return redirectToRequestOrigin("/?error=invalid-input");
  }

  const body = composeJournalEntryBody({
    assistanceSource:
      assistanceSource === "fallback" || assistanceSource === "ollama"
        ? assistanceSource
        : undefined,
    body: String(formData.get("body") ?? ""),
    feeling,
    followUpQuestion,
    nextStep,
    rootIssue,
    suggestions,
  });

  if (body.length > JOURNAL_ENTRY_BODY_MAX_LENGTH) {
    return redirectToRequestOrigin("/?error=entry-too-long");
  }

  try {
    const entry = await createJournalEntry(
      {
        body,
        source:
          typeof source === "string" && isCaptureSource(source) ? source : undefined,
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
