// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { JournalEntryForm } from "@/components/journal-entry-form";

describe("JournalEntryForm", () => {
  it("syncs the textarea value when the body prop changes", () => {
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
});
