import { describe, expect, it } from "vitest";
import {
  composeJournalEntryBody,
  hasGuidedReflection,
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
