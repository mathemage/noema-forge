export type GuidedReflectionInput = {
  assistanceSource?: "fallback" | "ollama";
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

function formatAssistanceSource(source: GuidedReflectionInput["assistanceSource"]) {
  if (source === "ollama") {
    return "Ollama assist";
  }

  if (source === "fallback") {
    return "Local guidance";
  }

  return "Reflection assist";
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

  if (!body) {
    return body;
  }

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
        `${formatAssistanceSource(input.assistanceSource)}:`,
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

const RAW_CAPTURE_HEADING = "Raw capture:\n";
const GUIDED_REFLECTION_HEADING = "\n\nGuided reflection:";
const MANUAL_HEADINGS = [
  { heading: "\n\nFeeling:\n", key: "feeling" },
  { heading: "\n\nRoot issue:\n", key: "rootIssue" },
  { heading: "\n\nNext step:\n", key: "nextStep" },
] as const;
const ASSISTANCE_HEADINGS = [
  { heading: "\n\nOllama assist:", source: "ollama" },
  { heading: "\n\nLocal guidance:", source: "fallback" },
  { heading: "\n\nReflection assist:", source: undefined },
] as const;
const ASSISTANCE_OUTPUT_HEADINGS = [
  { heading: "\n\nFollow-up question:\n", key: "followUpQuestion" },
  { heading: "\n\nSuggestions:\n", key: "suggestions" },
] as const;

type SectionKey =
  | "assistance"
  | "feeling"
  | "followUpQuestion"
  | "nextStep"
  | "rootIssue"
  | "suggestions";

// A heading that occurs again later cannot be attributed to one section, so it
// is reported as absent and the round-trip check below rejects the entry.
function findHeading(text: string, heading: string, from: number) {
  const index = text.indexOf(heading, from);

  if (index === -1 || text.includes(heading, index + 1)) {
    return -1;
  }

  return index;
}

function findAssistanceHeading(text: string, from: number) {
  const matches = ASSISTANCE_HEADINGS.map((candidate) => ({
    ...candidate,
    index: findHeading(text, candidate.heading, from),
  })).filter((candidate) => candidate.index !== -1);

  return matches.length === 1 ? matches[0] : null;
}

/**
 * The inverse of `composeJournalEntryBody()`. Returns `null` for any text this
 * function cannot reproduce exactly, so the caller keeps it as a raw capture.
 *
 * Entries that were posted back through an HTML form carry CRLF line endings,
 * so both the parse and the check below run on LF-normalised text.
 */
export function parseJournalEntryBody(text: string): GuidedReflectionInput | null {
  const normalized = text.replace(/\r\n/g, "\n");

  if (!normalized.startsWith(RAW_CAPTURE_HEADING)) {
    return null;
  }

  const guidedIndex = findHeading(
    normalized,
    GUIDED_REFLECTION_HEADING,
    RAW_CAPTURE_HEADING.length,
  );

  if (guidedIndex === -1) {
    return null;
  }

  const sections: { headingIndex: number; key: SectionKey; valueIndex: number }[] = [];
  let cursor = guidedIndex + GUIDED_REFLECTION_HEADING.length;

  function takeSection(key: SectionKey, heading: string, headingIndex: number) {
    sections.push({ headingIndex, key, valueIndex: headingIndex + heading.length });
    cursor = headingIndex + heading.length;
  }

  for (const { heading, key } of MANUAL_HEADINGS) {
    const index = findHeading(normalized, heading, cursor);

    if (index !== -1) {
      takeSection(key, heading, index);
    }
  }

  const assistance = findAssistanceHeading(normalized, cursor);

  if (assistance) {
    takeSection("assistance", assistance.heading, assistance.index);
  }

  for (const { heading, key } of ASSISTANCE_OUTPUT_HEADINGS) {
    const index = findHeading(normalized, heading, cursor);

    if (index !== -1) {
      takeSection(key, heading, index);
    }
  }

  const values = new Map<SectionKey, string>();

  sections.forEach((section, position) => {
    values.set(
      section.key,
      normalized.slice(
        section.valueIndex,
        sections[position + 1]?.headingIndex ?? normalized.length,
      ),
    );
  });

  const suggestionsValue = values.get("suggestions");
  const parsed: GuidedReflectionInput = {
    assistanceSource: assistance?.source,
    body: normalized.slice(RAW_CAPTURE_HEADING.length, guidedIndex),
    feeling: values.get("feeling"),
    followUpQuestion: values.get("followUpQuestion"),
    nextStep: values.get("nextStep"),
    rootIssue: values.get("rootIssue"),
    suggestions: suggestionsValue
      ? suggestionsValue.split("\n").map((line) => line.replace(/^- /, ""))
      : [],
  };

  return composeJournalEntryBody(parsed) === normalized ? parsed : null;
}
