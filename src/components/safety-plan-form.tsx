"use client";

import { useState, type FormEvent } from "react";
import {
  MEANS_SAFETY_ACKNOWLEDGEMENT,
  safetyPlanSteps,
} from "@/lib/safety/safety-plan";
import type { SafetyPlanRecord } from "@/lib/safety/service";

export const MEANS_SAFETY_MESSAGE =
  "Step 6 is empty. Fill it in, or tick the acknowledgement to leave it blank on purpose.";

const SAFETY_PLAN_FIELD_MAX_LENGTH = 2_000;

type SafetyPlanFormProps = {
  error?: string;
  plan: SafetyPlanRecord | null;
};

export function SafetyPlanForm({ error, plan }: SafetyPlanFormProps) {
  const [message, setMessage] = useState(error);

  // The same rule the server enforces, checked here so a missed step 6 never
  // costs the user the rest of the plan they just typed.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const meansSafety = form.elements.namedItem(
      "meansSafety",
    ) as HTMLTextAreaElement;
    const acknowledged = form.elements.namedItem(
      "meansSafetyAcknowledged",
    ) as HTMLInputElement;

    if (!meansSafety.value.trim() && !acknowledged.checked) {
      event.preventDefault();
      setMessage(MEANS_SAFETY_MESSAGE);
      meansSafety.focus();
    }
  };

  return (
    <form
      action="/safety/plan"
      className="space-y-4"
      method="post"
      onSubmit={handleSubmit}
    >
      {message ? (
        <div className="status-danger" role="alert">
          {message}
        </div>
      ) : null}

      {safetyPlanSteps.map((step) => (
        <label
          className="block space-y-2 text-sm font-semibold text-foreground"
          key={step.key}
        >
          <span>{step.title}</span>
          <span className="block text-sm font-normal leading-6 text-muted">
            {step.description}
          </span>
          <textarea
            className="journal-control min-h-28 w-full px-4 py-3 text-sm leading-6"
            defaultValue={plan?.[step.key] ?? ""}
            maxLength={SAFETY_PLAN_FIELD_MAX_LENGTH}
            name={step.key}
            placeholder={step.placeholder}
          />
        </label>
      ))}

      <label className="flex items-start gap-3 text-sm leading-6 text-foreground">
        <input
          className="mt-1"
          defaultChecked={plan?.meansSafetyAcknowledged ?? false}
          name="meansSafetyAcknowledged"
          type="checkbox"
        />
        <span>{MEANS_SAFETY_ACKNOWLEDGEMENT}</span>
      </label>

      <button
        className="button-primary inline-flex w-full items-center justify-center px-5 py-3 text-sm font-semibold sm:w-auto"
        type="submit"
      >
        Save safety plan
      </button>
    </form>
  );
}
