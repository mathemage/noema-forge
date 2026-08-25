import { describe, expect, it } from "vitest";
import {
  composeJournalEntryBody,
  hasGuidedReflection,
  parseJournalEntryBody,
  type GuidedReflectionInput,
} from "@/lib/journal/reflection";

describe("guided reflection composition", () => {
  it("returns the trimmed raw body when no reflection is present", () => {
    expect(composeJournalEntryBody({ body: "  A raw thought  " })).toBe(
      "A raw thought",
    );
  });

  it("composes raw capture, manual reflection, and assistance into one entry", () => {
    const result = composeJournalEntryBody({
      assistanceSource: "fallback",
      body: "I keep postponing the hard email.",
      feeling: "Avoidant and tense",
      followUpQuestion: "What would make the email safe enough to send?",
      nextStep: "Draft the first three sentences.",
      rootIssue: "I do not want to disappoint the recipient.",
      suggestions: ["Open the thread.", "Write a bad first draft.", ""],
    });

    expect(result).toBe(
      [
        "Raw capture:\nI keep postponing the hard email.",
        "Guided reflection:",
        "Feeling:\nAvoidant and tense",
        "Root issue:\nI do not want to disappoint the recipient.",
        "Next step:\nDraft the first three sentences.",
        [
          "Local guidance:",
          "Follow-up question:\nWhat would make the email safe enough to send?",
          "Suggestions:\n- Open the thread.\n- Write a bad first draft.",
        ].join("\n\n"),
      ].join("\n\n"),
    );
  });

  it("keeps empty raw capture invalid even when reflection fields are present", () => {
    expect(
      composeJournalEntryBody({
        body: "",
        feeling: "Tense",
        rootIssue: "Unclear priority",
      }),
    ).toBe("");
  });

  it("labels Ollama-sourced assistance accurately", () => {
    expect(
      composeJournalEntryBody({
        assistanceSource: "ollama",
        body: "Raw thought",
        followUpQuestion: "What matters now?",
        suggestions: ["Choose one action.", "Write it down."],
      }),
    ).toContain("Ollama assist:");
  });

  it("detects reflection when only suggestions are present", () => {
    expect(
      hasGuidedReflection({
        body: "Raw",
        suggestions: ["Take one concrete step."],
      }),
    ).toBe(true);
  });
});

const RAW_BODY = "I keep postponing the hard email.";
const FIELD_VALUES = {
  feeling: "Avoidant and tense",
  followUpQuestion: "What would make the email safe enough to send?",
  nextStep: "Draft the first three sentences.",
  rootIssue: "I do not want to disappoint the recipient.",
  suggestions: ["Open the thread.", "Write a bad first draft."],
} as const;
const OPTIONAL_FIELDS = [
  "feeling",
  "rootIssue",
  "nextStep",
  "followUpQuestion",
  "suggestions",
] as const;
const ASSISTANCE_SOURCES = [undefined, "fallback", "ollama"] as const;

type ReflectionCase = [string, GuidedReflectionInput, GuidedReflectionInput | null];

function buildReflectionCases(): ReflectionCase[] {
  const cases: ReflectionCase[] = [];

  for (const assistanceSource of ASSISTANCE_SOURCES) {
    for (let mask = 0; mask < 1 << OPTIONAL_FIELDS.length; mask += 1) {
      const present = OPTIONAL_FIELDS.filter((_, index) => mask & (1 << index));
      const input: GuidedReflectionInput = {
        assistanceSource,
        body: RAW_BODY,
        feeling: present.includes("feeling") ? FIELD_VALUES.feeling : "",
        followUpQuestion: present.includes("followUpQuestion")
          ? FIELD_VALUES.followUpQuestion
          : "",
        nextStep: present.includes("nextStep") ? FIELD_VALUES.nextStep : "",
        rootIssue: present.includes("rootIssue") ? FIELD_VALUES.rootIssue : "",
        suggestions: present.includes("suggestions") ? [...FIELD_VALUES.suggestions] : [],
      };
      const hasAssistanceOutput =
        present.includes("followUpQuestion") || present.includes("suggestions");

      cases.push([
        `${assistanceSource ?? "unlabelled"} assist with ${present.join(", ") || "no reflection fields"}`,
        input,
        present.length === 0
          ? null
          : {
              assistanceSource: hasAssistanceOutput ? assistanceSource : undefined,
              body: RAW_BODY,
              feeling: input.feeling || undefined,
              followUpQuestion: input.followUpQuestion || undefined,
              nextStep: input.nextStep || undefined,
              rootIssue: input.rootIssue || undefined,
              suggestions: input.suggestions ?? [],
            },
      ]);
    }
  }

  return cases;
}

describe("guided reflection parsing", () => {
  it.each(buildReflectionCases())(
    "recovers an entry saved with %s",
    (_name, input, expected) => {
      expect(parseJournalEntryBody(composeJournalEntryBody(input))).toEqual(expected);
    },
  );

  it("treats a plain capture as a raw entry", () => {
    expect(parseJournalEntryBody("Just a thought I typed.")).toBeNull();
  });

  it("keeps reflection headings that belong to the raw capture", () => {
    const input = {
      body: "Notes from the call\n\nFeeling:\nwhat I wrote on paper",
      feeling: "Calm",
    };
    const parsed = parseJournalEntryBody(composeJournalEntryBody(input));

    expect(parsed?.body).toBe(input.body);
    expect(parsed?.feeling).toBe("Calm");
  });

  it("refuses to guess when a heading appears twice", () => {
    const composed = composeJournalEntryBody({
      body: "Pasted an old entry\n\nGuided reflection:\n\nFeeling:\nOld",
      feeling: "New",
    });

    expect(parseJournalEntryBody(composed)).toBeNull();
  });

  it("refuses an entry whose suggestion list was hand-edited", () => {
    const composed = composeJournalEntryBody({
      body: RAW_BODY,
      suggestions: ["Open the thread."],
    });

    expect(parseJournalEntryBody(composed.replace("- Open", "Open"))).toBeNull();
  });

  it("refuses text that a compose call could not have produced", () => {
    expect(
      parseJournalEntryBody(
        "Raw capture:\nA thought\n\nGuided reflection:\n\nSomething else:\nvalue",
      ),
    ).toBeNull();
  });

  it("recovers assistance output that was saved without a source label", () => {
    const composed = composeJournalEntryBody({
      body: RAW_BODY,
      followUpQuestion: "What matters now?",
      suggestions: ["Choose one action."],
    });

    expect(composed).toContain("Reflection assist:");
    expect(parseJournalEntryBody(composed)).toEqual({
      assistanceSource: undefined,
      body: RAW_BODY,
      feeling: undefined,
      followUpQuestion: "What matters now?",
      nextStep: undefined,
      rootIssue: undefined,
      suggestions: ["Choose one action."],
    });
  });
});
