import { describe, expect, it } from "vitest";
import {
  getMaxScore,
  isAboveRoutingThreshold,
  isCheckInDue,
  isSeverityInstrument,
  nextCheckInDate,
  scoreSeverityCheckIn,
  severityInstruments,
  severityResponseOptions,
} from "@/lib/safety/instruments";

describe("severityInstruments", () => {
  it("carries the published item counts", () => {
    expect(severityInstruments["phq-9"].items).toHaveLength(9);
    expect(severityInstruments["gad-7"].items).toHaveLength(7);
  });

  it("keeps the four published response weights", () => {
    expect(severityResponseOptions.map((option) => option.value)).toEqual([
      0, 1, 2, 3,
    ]);
  });

  it("reports the exact maximum score for each instrument", () => {
    expect(getMaxScore("phq-9")).toBe(27);
    expect(getMaxScore("gad-7")).toBe(21);
  });

  it("keeps the self-harm item in PHQ-9 so the total stays the published total", () => {
    expect(severityInstruments["phq-9"].items[8]).toBe(
      "Thoughts that you would be better off dead, or of hurting yourself in some way",
    );
  });
});

describe("scoreSeverityCheckIn", () => {
  it("sums PHQ-9 answers exactly", () => {
    expect(scoreSeverityCheckIn("phq-9", Array(9).fill(0))).toBe(0);
    expect(scoreSeverityCheckIn("phq-9", Array(9).fill(3))).toBe(27);
    expect(scoreSeverityCheckIn("phq-9", [0, 1, 2, 3, 0, 1, 2, 3, 1])).toBe(13);
  });

  it("sums GAD-7 answers exactly", () => {
    expect(scoreSeverityCheckIn("gad-7", Array(7).fill(0))).toBe(0);
    expect(scoreSeverityCheckIn("gad-7", Array(7).fill(3))).toBe(21);
    expect(scoreSeverityCheckIn("gad-7", [3, 2, 2, 1, 0, 1, 2])).toBe(11);
  });

  it("refuses to score a questionnaire that is not complete and in range", () => {
    expect(scoreSeverityCheckIn("phq-9", Array(8).fill(1))).toBeNull();
    expect(scoreSeverityCheckIn("gad-7", Array(8).fill(1))).toBeNull();
    expect(scoreSeverityCheckIn("gad-7", [0, 1, 2, 3, 0, 1, 4])).toBeNull();
    expect(scoreSeverityCheckIn("gad-7", [0, 1, 2, 3, 0, 1, -1])).toBeNull();
    expect(scoreSeverityCheckIn("gad-7", [0, 1, 2, 3, 0, 1, Number.NaN])).toBeNull();
    expect(scoreSeverityCheckIn("gad-7", [0, 1, 2, 3, 0, 1, 1.5])).toBeNull();
  });
});

describe("isAboveRoutingThreshold", () => {
  it("routes at the threshold rather than above it", () => {
    expect(isAboveRoutingThreshold("phq-9", 9)).toBe(false);
    expect(isAboveRoutingThreshold("phq-9", 10)).toBe(true);
    expect(isAboveRoutingThreshold("gad-7", 9)).toBe(false);
    expect(isAboveRoutingThreshold("gad-7", 10)).toBe(true);
  });

  it("quotes the response-rate gap only for the instrument it was measured on", () => {
    expect(severityInstruments["phq-9"].routingMessage).toContain("37%");
    expect(severityInstruments["phq-9"].routingMessage).toContain("48%");
    expect(severityInstruments["gad-7"].routingMessage).not.toContain("37%");
  });
});

describe("isSeverityInstrument", () => {
  it("accepts only the two published instruments", () => {
    expect(isSeverityInstrument("phq-9")).toBe(true);
    expect(isSeverityInstrument("gad-7")).toBe(true);
    expect(isSeverityInstrument("phq-2")).toBe(false);
  });
});

describe("isCheckInDue", () => {
  it("is due when nothing has been taken yet", () => {
    expect(isCheckInDue(null)).toBe(true);
  });

  it("waits a fortnight, the window the instruments ask about", () => {
    const takenAt = new Date("2026-01-01T00:00:00.000Z");

    expect(nextCheckInDate(takenAt).toISOString()).toBe(
      "2026-01-15T00:00:00.000Z",
    );
    expect(isCheckInDue(takenAt, new Date("2026-01-14T23:59:00.000Z"))).toBe(false);
    expect(isCheckInDue(takenAt, new Date("2026-01-15T00:00:00.000Z"))).toBe(true);
  });
});
