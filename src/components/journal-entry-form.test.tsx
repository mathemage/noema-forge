// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { JournalEntryForm } from "@/components/journal-entry-form";

describe("JournalEntryForm", () => {
  it("shows the new body after a keyed remount", () => {
    const { rerender } = render(
      <JournalEntryForm
        action="/entries/entry-1/update"
        body="First body"
        description="Edit entry"
        heading="Edit entry"
        key="entry-1"
        submitLabel="Save changes"
      />,
    );

    expect(screen.getByLabelText("Entry")).toHaveValue("First body");

    rerender(
      <JournalEntryForm
        action="/entries/entry-2/update"
        body="Second body"
        description="Edit entry"
        heading="Edit entry"
        key="entry-2"
        submitLabel="Save changes"
      />,
    );

    expect(screen.getByLabelText("Entry")).toHaveValue("Second body");
  });

  it("edits the stored reflection fields alongside the capture", () => {
    render(
      <JournalEntryForm
        action="/entries/entry-1/update"
        body="A raw capture"
        description="Edit entry"
        feeling="Tense"
        heading="Edit entry"
        nextStep="Write one sentence"
        rootIssue="Unclear priority"
        submitLabel="Save changes"
      />,
    );

    expect(screen.getByLabelText("Entry")).toHaveValue("A raw capture");
    expect(screen.getByLabelText("Feeling")).toHaveValue("Tense");
    expect(screen.getByLabelText("Root issue")).toHaveValue("Unclear priority");
    expect(screen.getByLabelText("Next step")).toHaveValue("Write one sentence");
  });
});
