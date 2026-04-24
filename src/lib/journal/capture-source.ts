export const captureSourceValues = ["typed", "voice", "ocr"] as const;

export type CaptureSource = (typeof captureSourceValues)[number];
const captureSourceSet = new Set<CaptureSource>(captureSourceValues);

const captureSourceLabels: Record<CaptureSource, string> = {
  ocr: "Handwriting OCR",
  typed: "Typed",
  voice: "Voice dictation",
};

export function formatCaptureSource(source: CaptureSource) {
  return captureSourceLabels[source];
}

export function isCaptureSource(value: string): value is CaptureSource {
  return captureSourceSet.has(value as CaptureSource);
}
