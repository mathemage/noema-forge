import { describe, expect, it } from "vitest";
import {
  MEANS_SAFETY_ACKNOWLEDGEMENT,
  SAFETY_PLAN_FRAMING,
  safetyPlanStepKeys,
  safetyPlanSteps,
} from "@/lib/safety/safety-plan";

describe("safetyPlanSteps", () => {
  it("keeps the published six steps in their published order", () => {
    expect(safetyPlanSteps.map((step) => step.key)).toEqual([
      "warningSigns",
      "internalCoping",
      "distraction",
      "supportContacts",
      "professionalContacts",
      "meansSafety",
    ]);
    expect(safetyPlanSteps.map((step) => step.key)).toEqual([
      ...safetyPlanStepKeys,
    ]);
  });

  it("keeps distraction contacts separate from support contacts", () => {
    const [, , distraction, support] = safetyPlanSteps;

    expect(distraction.description).toContain("without having to explain");
    expect(support.description).toContain("tell directly");
  });

  it("describes the feature as plan storage rather than the studied intervention", () => {
    expect(SAFETY_PLAN_FRAMING).toContain("associated with");
    expect(SAFETY_PLAN_FRAMING).toContain("3.03%");
    expect(SAFETY_PLAN_FRAMING).toContain("not that");
    expect(MEANS_SAFETY_ACKNOWLEDGEMENT).toContain("deliberately leaving it blank");
  });
});
