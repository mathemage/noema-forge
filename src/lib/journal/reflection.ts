export type GuidedReflectionInput = {
  body: string;
  feeling?: string;
  followUpQuestion?: string;
  nextStep?: string;
  rootIssue?: string;
  suggestions?: string[];
};

function normalizeText(value: string | undefined) {
  return (value ?? "").trim();
}

function normalizeSuggestions(suggestions: string[] | undefined) {
  return (suggestions ?? []).map(normalizeText).filter(Boolean).slice(0, 3);
}

export function hasGuidedReflection(input: GuidedReflectionInput) {
  return Boolean(
    normalizeText(input.feeling) ||
      normalizeText(input.rootIssue) ||
      normalizeText(input.nextStep) ||
      normalizeText(input.followUpQuestion) ||
      normalizeSuggestions(input.suggestions).length,
  );
}

export function composeJournalEntryBody(input: GuidedReflectionInput) {
  const body = normalizeText(input.body);
  const feeling = normalizeText(input.feeling);
  const rootIssue = normalizeText(input.rootIssue);
  const nextStep = normalizeText(input.nextStep);
  const followUpQuestion = normalizeText(input.followUpQuestion);
  const suggestions = normalizeSuggestions(input.suggestions);

  if (!hasGuidedReflection(input)) {
    return body;
  }

  const sections = [`Raw capture:\n${body}`, "Guided reflection:"];

  if (feeling) {
    sections.push(`Feeling:\n${feeling}`);
  }

  if (rootIssue) {
    sections.push(`Root issue:\n${rootIssue}`);
  }

  if (nextStep) {
    sections.push(`Next step:\n${nextStep}`);
  }

  if (followUpQuestion || suggestions.length) {
    sections.push(
      [
        "Ollama assist:",
        followUpQuestion ? `Follow-up question:\n${followUpQuestion}` : null,
        suggestions.length
          ? `Suggestions:\n${suggestions.map((suggestion) => `- ${suggestion}`).join("\n")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n\n"),
    );
  }

  return sections.join("\n\n").trim();
}
