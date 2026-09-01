import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/lib/db/client";
import {
  acknowledgeLimits,
  getLatestCheckIn,
  getSafetyPlan,
  getSafetyProfile,
  recordSeverityCheckIn,
  SafetyError,
  saveSafetyPlan,
  setTraumaWritingConsent,
  type SafetyPlanInput,
} from "@/lib/safety/service";

function mockInsertDb() {
  const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
  const values = vi.fn().mockReturnValue({ onConflictDoUpdate });
  const insert = vi.fn().mockReturnValue({ values });

  return { db: { insert } as unknown as Database, onConflictDoUpdate, values };
}

function mockSelectDb(rows: unknown[]) {
  const limit = vi.fn().mockResolvedValue(rows);
  const orderBy = vi.fn().mockReturnValue({ limit });
  const where = vi.fn().mockReturnValue({ limit, orderBy });

  return {
    db: {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({ where }),
      }),
    } as unknown as Database,
  };
}

function planInput(overrides: Partial<SafetyPlanInput> = {}): SafetyPlanInput {
  return {
    distraction: "The park, and my brother's kitchen",
    internalCoping: "Walk the long way round",
    meansSafety: "The pills go to a neighbour",
    meansSafetyAcknowledged: false,
    professionalContacts: "Dr Novak, out of hours line",
    supportContacts: "Jana",
    warningSigns: "Skipping meals and answering nobody",
    ...overrides,
  };
}

describe("getSafetyProfile", () => {
  it("returns null before the user has acknowledged anything", async () => {
    const { db } = mockSelectDb([]);

    await expect(getSafetyProfile("user-1", db)).resolves.toBeNull();
  });
});

describe("acknowledgeLimits", () => {
  it("records the acknowledgement without touching the trauma-writing opt-in", async () => {
    const { db, onConflictDoUpdate, values } = mockInsertDb();

    await acknowledgeLimits("user-1", db);

    expect(values.mock.calls[0][0].userId).toBe("user-1");
    expect(values.mock.calls[0][0].limitsAcknowledgedAt).toBeInstanceOf(Date);
    expect(
      Object.keys(onConflictDoUpdate.mock.calls[0][0].set),
    ).toEqual(["limitsAcknowledgedAt"]);
  });
});

describe("setTraumaWritingConsent", () => {
  it("stamps an opt-in and clears it again on opt-out", async () => {
    const optIn = mockInsertDb();
    await setTraumaWritingConsent("user-1", true, optIn.db);
    expect(optIn.values.mock.calls[0][0].traumaWritingOptedInAt).toBeInstanceOf(Date);

    const optOut = mockInsertDb();
    await setTraumaWritingConsent("user-1", false, optOut.db);
    expect(optOut.values.mock.calls[0][0].traumaWritingOptedInAt).toBeNull();
  });
});

describe("saveSafetyPlan", () => {
  it("stores a completed plan", async () => {
    const { db, values } = mockInsertDb();

    await saveSafetyPlan(planInput(), "user-1", db);

    expect(values.mock.calls[0][0]).toMatchObject({
      meansSafety: "The pills go to a neighbour",
      userId: "user-1",
      warningSigns: "Skipping meals and answering nobody",
    });
  });

  it("refuses to skip means safety in silence", async () => {
    const { db } = mockInsertDb();

    await expect(
      saveSafetyPlan(planInput({ meansSafety: "" }), "user-1", db),
    ).rejects.toThrow(SafetyError);
  });

  it("allows an empty means-safety step behind an explicit acknowledgement", async () => {
    const { db, values } = mockInsertDb();

    await saveSafetyPlan(
      planInput({ meansSafety: "", meansSafetyAcknowledged: true }),
      "user-1",
      db,
    );

    expect(values.mock.calls[0][0].meansSafetyAcknowledged).toBe(true);
  });

  it("rejects a step longer than the field limit", async () => {
    const { db } = mockInsertDb();

    await expect(
      saveSafetyPlan(
        planInput({ warningSigns: "x".repeat(2_001) }),
        "user-1",
        db,
      ),
    ).rejects.toThrow(SafetyError);
  });
});

describe("recordSeverityCheckIn", () => {
  it("stores the exact total and nothing else about the answers", async () => {
    const { db, values } = mockInsertDb();

    const score = await recordSeverityCheckIn(
      "phq-9",
      [3, 3, 3, 3, 3, 3, 3, 3, 3],
      "user-1",
      db,
    );

    expect(score).toBe(27);
    expect(values.mock.calls[0][0]).toMatchObject({
      instrument: "phq-9",
      score: 27,
      userId: "user-1",
    });
    expect(Object.keys(values.mock.calls[0][0])).toEqual([
      "id",
      "instrument",
      "score",
      "userId",
    ]);
  });

  it("stores nothing for an incomplete questionnaire", async () => {
    const { db, values } = mockInsertDb();

    await expect(
      recordSeverityCheckIn("gad-7", [1, 1, 1], "user-1", db),
    ).rejects.toThrow(SafetyError);
    expect(values).not.toHaveBeenCalled();
  });
});

describe("getLatestCheckIn", () => {
  it("returns the most recent stored score for the instrument", async () => {
    const createdAt = new Date("2026-02-01T10:00:00.000Z");
    const { db } = mockSelectDb([{ createdAt, instrument: "gad-7", score: 11 }]);

    await expect(getLatestCheckIn("gad-7", "user-1", db)).resolves.toEqual({
      createdAt,
      instrument: "gad-7",
      score: 11,
    });
  });
});

describe("getSafetyPlan", () => {
  it("returns null until a plan has been written", async () => {
    const { db } = mockSelectDb([]);

    await expect(getSafetyPlan("user-1", db)).resolves.toBeNull();
  });
});
