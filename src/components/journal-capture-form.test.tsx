// @vitest-environment jsdom

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { JournalCaptureForm } from "@/components/journal-capture-form";

function getSourceInput() {
  const input = document.querySelector('input[name="source"]');

  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Expected hidden source input to be present.");
  }

  return input;
}

function createRecognitionStub() {
  return {
    continuous: false,
    interimResults: false,
    lang: "",
    onend: null as (() => void) | null,
    onerror: null as ((event: { error: string }) => void) | null,
    onresult: null as ((event: { results: ArrayLike<{ 0: { transcript: string }; length: number }> }) => void) | null,
    start: vi.fn(),
    stop: vi.fn(),
  };
}

describe("JournalCaptureForm", () => {
  it("captures dictated text into the shared editor", async () => {
    const recognition = createRecognitionStub();
    const user = userEvent.setup();

    render(
      <JournalCaptureForm
        action="/entries"
        createSpeechRecognition={() => recognition}
        description="Create a new entry"
        heading="New journal entry"
        submitLabel="Save entry"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Voice dictation" }));
    await user.click(screen.getByRole("button", { name: "Start dictation" }));

    expect(getSourceInput()).toHaveValue("voice");
    expect(recognition.start).toHaveBeenCalledTimes(1);

    act(() => {
      recognition.onresult?.({
        results: [{ 0: { transcript: "Spoken draft" }, length: 1 }],
      });
      recognition.onend?.();
    });

    expect(screen.getByLabelText("Entry")).toHaveValue("Spoken draft");
    expect(
      screen.getByText("Dictation stopped. Review and edit the transcript before saving."),
    ).toBeInTheDocument();
  });

  it("stops active dictation when switching away from voice mode", async () => {
    const recognition = createRecognitionStub();
    const user = userEvent.setup();

    render(
      <JournalCaptureForm
        action="/entries"
        createSpeechRecognition={() => recognition}
        description="Create a new entry"
        heading="New journal entry"
        submitLabel="Save entry"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Voice dictation" }));
    await user.click(screen.getByRole("button", { name: "Start dictation" }));

    expect(screen.getByLabelText("Entry")).toHaveAttribute("readonly");

    await user.click(screen.getByRole("button", { name: "Typed" }));

    expect(recognition.stop).toHaveBeenCalledTimes(1);
    expect(getSourceInput()).toHaveValue("typed");
    expect(screen.getByLabelText("Entry")).not.toHaveAttribute("readonly");
  });

  it("imports OCR text into the shared editor", async () => {
    const extractImageText = vi
      .fn<(file: File, onProgress: (progress: number) => void) => Promise<string>>()
      .mockImplementation(async (_file, onProgress) => {
        onProgress(0.6);
        return "Scanned line\n\nsecond line";
      });
    const user = userEvent.setup();

    render(
      <JournalCaptureForm
        action="/entries"
        description="Create a new entry"
        extractImageText={extractImageText}
        heading="New journal entry"
        submitLabel="Save entry"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Handwriting OCR" }));
    await user.upload(
      screen.getByLabelText("Handwritten note image"),
      new File(["note image"], "note.png", { type: "image/png" }),
    );

    await waitFor(() =>
      expect(screen.getByLabelText("Entry")).toHaveValue("Scanned line\n\nsecond line"),
    );

    expect(getSourceInput()).toHaveValue("ocr");
    expect(extractImageText).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Imported text from note\.png\./)).toBeInTheDocument();
  });
});
