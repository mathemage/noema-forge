// @vitest-environment jsdom

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { JournalCaptureForm } from "@/components/journal-capture-form";
import { JOURNAL_ENTRY_BODY_MAX_LENGTH } from "@/lib/journal/limits";

function getSourceInput() {
  const input = document.querySelector('input[name="source"]');

  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Expected hidden source input to be present.");
  }

  return input;
}

function getHiddenInputValue(name: string) {
  const input = document.querySelector(`input[name="${name}"]`);

  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`Expected hidden ${name} input to be present.`);
  }

  return input.value;
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

afterEach(() => {
  vi.unstubAllGlobals();
});

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

  it("falls back to typed source when dictation is unavailable", async () => {
    const user = userEvent.setup();

    render(
      <JournalCaptureForm
        action="/entries"
        createSpeechRecognition={() => null}
        description="Create a new entry"
        heading="New journal entry"
        submitLabel="Save entry"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Voice dictation" }));
    await user.click(screen.getByRole("button", { name: "Start dictation" }));

    expect(getSourceInput()).toHaveValue("typed");
    expect(
      screen.getByText(
        "This browser does not support live dictation yet. You can still type your entry.",
      ),
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

  it("keeps the editor read-only while OCR is in progress", async () => {
    let releaseExtraction: (() => void) | null = null;
    const extractImageText = vi
      .fn<(file: File, onProgress: (progress: number) => void) => Promise<string>>()
      .mockImplementation(
        (_file, onProgress) =>
          new Promise<string>((resolve) => {
            onProgress(0.2);
            releaseExtraction = () => resolve("OCR draft");
          }),
      );
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

    expect(screen.getByLabelText("Entry")).toHaveAttribute("readonly");
    expect(
      screen.getByText("Wait for OCR to finish before editing the extracted text."),
    ).toBeInTheDocument();

    releaseExtraction?.();

    await waitFor(() =>
      expect(screen.getByLabelText("Entry")).not.toHaveAttribute("readonly"),
    );
  });

  it("requests reflection assistance from the current draft", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          followUpQuestion: "What would make this easier to start?",
          message: "Ollama is not configured, so local reflection guidance was used.",
          source: "fallback",
          suggestions: ["Open the draft.", "Write one imperfect sentence."],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchImpl);
    const user = userEvent.setup();

    render(
      <JournalCaptureForm
        action="/entries"
        description="Create a new entry"
        heading="New journal entry"
        submitLabel="Save entry"
      />,
    );

    await user.type(screen.getByLabelText("Entry"), "A raw draft");
    await user.type(screen.getByLabelText("Feeling"), "Tense");
    await user.type(screen.getByLabelText("Root issue"), "Unclear priority");
    await user.type(screen.getByLabelText("Next step"), "Open the document");
    await user.click(screen.getByRole("button", { name: "Get reflection prompt" }));

    await screen.findByText("What would make this easier to start?");

    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/reflection/assist",
      expect.objectContaining({
        body: JSON.stringify({
          body: "A raw draft",
          feeling: "Tense",
          nextStep: "Open the document",
          rootIssue: "Unclear priority",
        }),
        method: "POST",
      }),
    );
    expect(getHiddenInputValue("followUpQuestion")).toBe(
      "What would make this easier to start?",
    );
    expect(getHiddenInputValue("assistanceSource")).toBe("fallback");
    expect(screen.getByText("Open the draft.")).toBeInTheDocument();
  });

  it("clears generated reflection assistance when the draft changes", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          followUpQuestion: "What would make this easier to start?",
          message: "Ollama generated a narrow follow-up question and next steps.",
          source: "ollama",
          suggestions: ["Open the draft.", "Write one imperfect sentence."],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchImpl);
    const user = userEvent.setup();

    render(
      <JournalCaptureForm
        action="/entries"
        description="Create a new entry"
        heading="New journal entry"
        submitLabel="Save entry"
      />,
    );

    await user.type(screen.getByLabelText("Entry"), "A raw draft");
    await user.click(screen.getByRole("button", { name: "Get reflection prompt" }));
    await screen.findByText("What would make this easier to start?");

    await user.type(screen.getByLabelText("Entry"), " changed");

    expect(
      screen.queryByText("What would make this easier to start?"),
    ).not.toBeInTheDocument();
    expect(document.querySelector('input[name="followUpQuestion"]')).toBeNull();
    expect(document.querySelector('input[name="assistanceSource"]')).toBeNull();
  });

  it("ignores stale reflection assistance that resolves after edits", async () => {
    let resolveResponse: ((response: Response) => void) | null = null;
    const fetchImpl = vi.fn<typeof fetch>().mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveResponse = resolve;
      }),
    );
    vi.stubGlobal("fetch", fetchImpl);
    const user = userEvent.setup();

    render(
      <JournalCaptureForm
        action="/entries"
        description="Create a new entry"
        heading="New journal entry"
        submitLabel="Save entry"
      />,
    );

    await user.type(screen.getByLabelText("Entry"), "A raw draft");
    await user.click(screen.getByRole("button", { name: "Get reflection prompt" }));
    await user.type(screen.getByLabelText("Entry"), " changed");

    await act(async () => {
      resolveResponse?.(
        new Response(
          JSON.stringify({
            followUpQuestion: "What would make this easier to start?",
            message: "Ollama generated a narrow follow-up question and next steps.",
            source: "ollama",
            suggestions: ["Open the draft.", "Write one imperfect sentence."],
          }),
          { status: 200 },
        ),
      );
    });

    expect(
      screen.queryByText("What would make this easier to start?"),
    ).not.toBeInTheDocument();
    expect(document.querySelector('input[name="followUpQuestion"]')).toBeNull();
    expect(document.querySelector('input[name="assistanceSource"]')).toBeNull();
    expect(screen.getByRole("button", { name: "Get reflection prompt" })).toBeEnabled();
  });

  it("warns before submitting a composed reflection that is too long", () => {
    render(
      <JournalCaptureForm
        action="/entries"
        description="Create a new entry"
        heading="New journal entry"
        submitLabel="Save entry"
      />,
    );

    fireEvent.change(screen.getByLabelText("Entry"), {
      target: { value: "a".repeat(JOURNAL_ENTRY_BODY_MAX_LENGTH) },
    });
    fireEvent.change(screen.getByLabelText("Feeling"), {
      target: { value: "Tense" },
    });

    expect(
      screen.getByText(/Shorten the raw entry or reflection before saving\./),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save entry" })).toBeDisabled();
  });
});
