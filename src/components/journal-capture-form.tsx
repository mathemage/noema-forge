"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ComponentProps } from "react";
import {
  captureSourceValues,
  type CaptureSource,
  formatCaptureSource,
} from "@/lib/journal/capture-source";

type BrowserSpeechRecognitionResult = {
  0: {
    transcript: string;
  };
  length: number;
};

type BrowserSpeechRecognitionEvent = {
  results: ArrayLike<BrowserSpeechRecognitionResult>;
};

type BrowserSpeechRecognitionErrorEvent = {
  error: string;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;
type FormAction = NonNullable<ComponentProps<"form">["action"]>;
type WindowWithSpeechRecognition = Window & {
  SpeechRecognition?: BrowserSpeechRecognitionConstructor;
  webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
};

type JournalCaptureFormProps = {
  action: FormAction;
  createSpeechRecognition?: () => BrowserSpeechRecognition | null;
  description: string;
  error?: string;
  extractImageText?: (file: File, onProgress: (progress: number) => void) => Promise<string>;
  heading: string;
  submitLabel: string;
};

function appendCaptureText(baseText: string, addedText: string) {
  const trimmedAddition = addedText.trim();

  if (!trimmedAddition) {
    return baseText;
  }

  const trimmedBase = baseText.trimEnd();
  return trimmedBase ? `${trimmedBase} ${trimmedAddition}` : trimmedAddition;
}

function normalizeExtractedText(text: string) {
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getVoiceErrorMessage(error: string) {
  switch (error) {
    case "audio-capture":
      return "The microphone could not start. Check your browser permissions and try again.";
    case "not-allowed":
      return "Microphone access was blocked. Allow it in the browser to dictate.";
    case "service-not-allowed":
      return "This browser disabled speech recognition for the current page.";
    default:
      return "Dictation stopped before the transcript could finish. You can keep editing the text manually.";
  }
}

export function createBrowserSpeechRecognition() {
  if (typeof window === "undefined") {
    return null;
  }

  const SpeechRecognition =
    (window as WindowWithSpeechRecognition).SpeechRecognition ??
    (window as WindowWithSpeechRecognition).webkitSpeechRecognition;

  return SpeechRecognition ? new SpeechRecognition() : null;
}

export async function extractImageTextWithTesseract(
  file: File,
  onProgress: (progress: number) => void,
) {
  const { recognize } = await import("tesseract.js");
  const result = await recognize(file, "eng", {
    logger(message) {
      if (
        message &&
        typeof message === "object" &&
        "status" in message &&
        message.status === "recognizing text" &&
        "progress" in message &&
        typeof message.progress === "number"
      ) {
        onProgress(message.progress);
      }
    },
  });

  return result.data.text;
}

export function JournalCaptureForm({
  action,
  createSpeechRecognition = createBrowserSpeechRecognition,
  description,
  error,
  extractImageText = extractImageTextWithTesseract,
  heading,
  submitLabel,
}: JournalCaptureFormProps) {
  const [entryBody, setEntryBody] = useState("");
  const [source, setSource] = useState<CaptureSource>("typed");
  const [isDictating, setIsDictating] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [ocrMessage, setOcrMessage] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const dictationBaseTextRef = useRef("");
  const dictationStopReasonRef = useRef<"manual" | "mode-switch" | null>(null);
  const voiceFailedRef = useRef(false);
  const ocrRequestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const stopDictation = (reason: "manual" | "mode-switch" = "manual") => {
    if (!recognitionRef.current) {
      return;
    }

    dictationStopReasonRef.current = reason;
    setIsDictating(false);
    recognitionRef.current.stop();
  };

  const selectSource = (nextSource: CaptureSource) => {
    if (source === nextSource) {
      return;
    }

    if (source === "voice" && nextSource !== "voice" && recognitionRef.current) {
      stopDictation("mode-switch");
    }

    if (nextSource !== "voice") {
      setVoiceError(null);
      setVoiceMessage(null);
    }

    setSource(nextSource);
  };

  const startDictation = () => {
    const recognition = createSpeechRecognition();

    if (!recognition) {
      setSource("voice");
      setVoiceError(
        "This browser does not support live dictation yet. You can still type your entry.",
      );
      setVoiceMessage(null);
      return;
    }

    voiceFailedRef.current = false;
    dictationBaseTextRef.current = entryBody;
    dictationStopReasonRef.current = null;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(
        { length: event.results.length },
        (_, index) => event.results[index]?.[0]?.transcript ?? "",
      ).join(" ");

      setEntryBody(appendCaptureText(dictationBaseTextRef.current, transcript));
    };

    recognition.onerror = (event) => {
      voiceFailedRef.current = true;
      setVoiceError(getVoiceErrorMessage(event.error));
      setVoiceMessage(null);
      setIsDictating(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      const stopReason = dictationStopReasonRef.current;

      dictationStopReasonRef.current = null;
      setIsDictating(false);
      recognitionRef.current = null;

      if (!voiceFailedRef.current) {
        if (stopReason === "mode-switch") {
          return;
        }

        setVoiceMessage("Dictation stopped. Review and edit the transcript before saving.");
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setSource("voice");
      setVoiceError(null);
      setVoiceMessage("Listening and adding transcript text into the editor...");
      setIsDictating(true);
    } catch {
      setVoiceError("Dictation could not start. Try again or switch back to typing.");
      setVoiceMessage(null);
      setIsDictating(false);
      recognitionRef.current = null;
    }
  };

  const handleOcrUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const requestId = ocrRequestIdRef.current + 1;
    ocrRequestIdRef.current = requestId;
    setSource("ocr");
    setOcrError(null);
    setOcrMessage(`Reading ${file.name}...`);
    setOcrProgress(0);

    try {
      const extractedText = normalizeExtractedText(
        await extractImageText(file, (progress) => {
          if (ocrRequestIdRef.current === requestId) {
            setOcrProgress(progress);
          }
        }),
      );

      if (ocrRequestIdRef.current !== requestId) {
        return;
      }

      if (!extractedText) {
        setOcrError(
          "No readable text was found in that image. Try a sharper note photo or type the entry directly.",
        );
        setOcrMessage(null);
        setOcrProgress(null);
        return;
      }

      setEntryBody(extractedText);
      setOcrError(null);
      setOcrMessage(`Imported text from ${file.name}. Review and edit it before saving.`);
      setOcrProgress(1);
    } catch {
      if (ocrRequestIdRef.current === requestId) {
        setOcrError("That image could not be read. Try another file or switch to typing.");
        setOcrMessage(null);
        setOcrProgress(null);
      }
    } finally {
      event.target.value = "";
    }
  };

  return (
    <section className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {heading}
        </h2>
        <p className="text-sm leading-6 text-muted sm:text-base">{description}</p>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <form action={action} className="mt-6 space-y-4" method="post">
        <div className="space-y-3">
          <div aria-label="Capture mode" className="flex flex-wrap gap-2" role="group">
            {captureSourceValues.map((mode) => {
              const active = source === mode;

              return (
                <button
                  aria-pressed={active}
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-slate-950 text-white"
                      : "border border-border bg-white text-foreground hover:bg-slate-50"
                  }`}
                  key={mode}
                  onClick={() => selectSource(mode)}
                  type="button"
                >
                  {formatCaptureSource(mode)}
                </button>
              );
            })}
          </div>

          <div className="rounded-3xl border border-border bg-slate-50/70 p-4 text-sm text-muted">
            {source === "typed" ? (
              <p>Write directly in the editor and save it as a typed journal entry.</p>
            ) : null}

            {source === "voice" ? (
              <div className="space-y-3">
                <p>
                  Use browser dictation to turn spoken notes into editable journal text.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    onClick={() => {
                      if (isDictating) {
                        stopDictation();
                        return;
                      }

                      startDictation();
                    }}
                    type="button"
                  >
                    {isDictating ? "Stop dictation" : "Start dictation"}
                  </button>
                  <span className="text-xs leading-5 text-muted">
                    Dictated text lands in the same editor below.
                  </span>
                </div>
                {voiceMessage ? <p className="text-xs leading-5 text-sky-700">{voiceMessage}</p> : null}
                {voiceError ? (
                  <p className="text-xs leading-5 text-rose-700">{voiceError}</p>
                ) : null}
              </div>
            ) : null}

            {source === "ocr" ? (
              <div className="space-y-3">
                <label className="block space-y-2 text-sm font-medium text-foreground" htmlFor="ocr-file">
                  <span>Handwritten note image</span>
                  <input
                    accept="image/*"
                    className="block w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                    id="ocr-file"
                    onChange={handleOcrUpload}
                    type="file"
                  />
                </label>
                <p className="text-xs leading-5 text-muted">
                  Upload a clear handwriting photo or scan. The extracted text replaces the editor draft so you can review it before saving.
                </p>
                {ocrMessage ? (
                  <p className="text-xs leading-5 text-sky-700">
                    {ocrMessage}
                    {ocrProgress !== null && ocrProgress > 0 && ocrProgress < 1
                      ? ` (${Math.round(ocrProgress * 100)}%)`
                      : ""}
                  </p>
                ) : null}
                {ocrError ? <p className="text-xs leading-5 text-rose-700">{ocrError}</p> : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="body">
            Entry
          </label>
          <input name="source" type="hidden" value={source} />
          <textarea
            className="min-h-56 w-full rounded-3xl border border-border bg-white px-4 py-3 text-base text-foreground outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            id="body"
            maxLength={20_000}
            name="body"
            onChange={(event) => setEntryBody(event.target.value)}
            placeholder="Write or review the journal text you want to keep."
            readOnly={isDictating}
            required
            value={entryBody}
          />
          <p className="text-xs leading-5 text-muted">
            Saved entries keep the original capture source plus created and updated timestamps.
          </p>
          {isDictating ? (
            <p className="text-xs leading-5 text-muted">
              Stop dictation before editing the text manually.
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            type="submit"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
