import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { safetyPlans, safetyProfiles, severityCheckIns } from "@/db/schema";
import { getDatabase, type Database } from "@/lib/db/client";
import {
  scoreSeverityCheckIn,
  severityInstrumentValues,
  type SeverityInstrument,
} from "@/lib/safety/instruments";

export type SafetyErrorCode = "invalid-input" | "means-safety-required";

export class SafetyError extends Error {
  constructor(readonly code: SafetyErrorCode) {
    super(code);
    this.name = "SafetyError";
  }
}

export type SafetyProfileRecord = {
  limitsAcknowledgedAt: Date | null;
  traumaWritingOptedInAt: Date | null;
  userId: string;
};

export type SafetyPlanRecord = {
  distraction: string;
  internalCoping: string;
  meansSafety: string;
  meansSafetyAcknowledged: boolean;
  professionalContacts: string;
  supportContacts: string;
  updatedAt: Date;
  warningSigns: string;
};

export type SeverityCheckInRecord = {
  createdAt: Date;
  instrument: SeverityInstrument;
  score: number;
};

const SAFETY_PLAN_FIELD_MAX_LENGTH = 2_000;

const planField = z.string().trim().max(SAFETY_PLAN_FIELD_MAX_LENGTH);

const safetyPlanInputSchema = z.object({
  distraction: planField,
  internalCoping: planField,
  meansSafety: planField,
  meansSafetyAcknowledged: z.boolean(),
  professionalContacts: planField,
  supportContacts: planField,
  warningSigns: planField,
});

export type SafetyPlanInput = z.infer<typeof safetyPlanInputSchema>;

const safetyProfileSelect = {
  limitsAcknowledgedAt: safetyProfiles.limitsAcknowledgedAt,
  traumaWritingOptedInAt: safetyProfiles.traumaWritingOptedInAt,
  userId: safetyProfiles.userId,
};

const safetyPlanSelect = {
  distraction: safetyPlans.distraction,
  internalCoping: safetyPlans.internalCoping,
  meansSafety: safetyPlans.meansSafety,
  meansSafetyAcknowledged: safetyPlans.meansSafetyAcknowledged,
  professionalContacts: safetyPlans.professionalContacts,
  supportContacts: safetyPlans.supportContacts,
  updatedAt: safetyPlans.updatedAt,
  warningSigns: safetyPlans.warningSigns,
};

const severityCheckInSelect = {
  createdAt: severityCheckIns.createdAt,
  instrument: severityCheckIns.instrument,
  score: severityCheckIns.score,
};

export async function getSafetyProfile(
  userId: string,
  db: Database = getDatabase(),
): Promise<SafetyProfileRecord | null> {
  const [profile] = await db
    .select(safetyProfileSelect)
    .from(safetyProfiles)
    .where(eq(safetyProfiles.userId, userId))
    .limit(1);

  return profile ?? null;
}

export async function acknowledgeLimits(
  userId: string,
  db: Database = getDatabase(),
) {
  const limitsAcknowledgedAt = new Date();

  await db
    .insert(safetyProfiles)
    .values({ limitsAcknowledgedAt, userId })
    .onConflictDoUpdate({
      set: { limitsAcknowledgedAt },
      target: safetyProfiles.userId,
    });
}

export async function setTraumaWritingConsent(
  userId: string,
  consented: boolean,
  db: Database = getDatabase(),
) {
  const traumaWritingOptedInAt = consented ? new Date() : null;

  await db
    .insert(safetyProfiles)
    .values({ traumaWritingOptedInAt, userId })
    .onConflictDoUpdate({
      set: { traumaWritingOptedInAt },
      target: safetyProfiles.userId,
    });
}

export async function getSafetyPlan(
  userId: string,
  db: Database = getDatabase(),
): Promise<SafetyPlanRecord | null> {
  const [plan] = await db
    .select(safetyPlanSelect)
    .from(safetyPlans)
    .where(eq(safetyPlans.userId, userId))
    .limit(1);

  return plan ?? null;
}

export async function saveSafetyPlan(
  input: SafetyPlanInput,
  userId: string,
  db: Database = getDatabase(),
) {
  const result = safetyPlanInputSchema.safeParse(input);

  if (!result.success) {
    throw new SafetyError("invalid-input");
  }

  const plan = result.data;

  // Means safety is the one step that cannot be passed over in silence.
  if (!plan.meansSafety && !plan.meansSafetyAcknowledged) {
    throw new SafetyError("means-safety-required");
  }

  await db
    .insert(safetyPlans)
    .values({ ...plan, userId })
    .onConflictDoUpdate({ set: plan, target: safetyPlans.userId });
}

export async function recordSeverityCheckIn(
  instrument: SeverityInstrument,
  answers: number[],
  userId: string,
  db: Database = getDatabase(),
) {
  const score = scoreSeverityCheckIn(instrument, answers);

  if (score === null) {
    throw new SafetyError("invalid-input");
  }

  await db
    .insert(severityCheckIns)
    .values({ id: randomUUID(), instrument, score, userId });

  return score;
}

export async function getLatestCheckIn(
  instrument: SeverityInstrument,
  userId: string,
  db: Database = getDatabase(),
): Promise<SeverityCheckInRecord | null> {
  const [checkIn] = await db
    .select(severityCheckInSelect)
    .from(severityCheckIns)
    .where(
      and(
        eq(severityCheckIns.userId, userId),
        eq(severityCheckIns.instrument, instrument),
      ),
    )
    .orderBy(desc(severityCheckIns.createdAt))
    .limit(1);

  return checkIn ?? null;
}

export async function getLatestCheckIns(
  userId: string,
  db: Database = getDatabase(),
) {
  const checkIns = await Promise.all(
    severityInstrumentValues.map((instrument) =>
      getLatestCheckIn(instrument, userId, db),
    ),
  );

  return Object.fromEntries(
    severityInstrumentValues.map((instrument, index) => [
      instrument,
      checkIns[index],
    ]),
  ) as Record<SeverityInstrument, SeverityCheckInRecord | null>;
}
