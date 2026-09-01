export const safetyPlanStepKeys = [
  "warningSigns",
  "internalCoping",
  "distraction",
  "supportContacts",
  "professionalContacts",
  "meansSafety",
] as const;

export type SafetyPlanStepKey = (typeof safetyPlanStepKeys)[number];

export type SafetyPlanStep = {
  description: string;
  key: SafetyPlanStepKey;
  placeholder: string;
  title: string;
};

/**
 * The published six steps, in their published order. Step 3 stays separate from
 * step 4: distraction is company that does not require explaining anything,
 * support is the people you would tell.
 */
export const safetyPlanSteps: SafetyPlanStep[] = [
  {
    description:
      "The thoughts, images, moods, situations, or behaviour that tell you a crisis may be building.",
    key: "warningSigns",
    placeholder: "What it looks like when this starts",
    title: "1. Warning signs",
  },
  {
    description:
      "What you can do on your own to take your mind off it, without contacting anyone.",
    key: "internalCoping",
    placeholder: "Things that have worked before, on your own",
    title: "2. Internal coping strategies",
  },
  {
    description:
      "People and places whose company helps, without having to explain the crisis to them.",
    key: "distraction",
    placeholder: "Somewhere to go and people to be around",
    title: "3. People and places that provide distraction",
  },
  {
    description: "The people you would tell directly that you are in trouble.",
    key: "supportContacts",
    placeholder: "Names and how to reach them",
    title: "4. People I can ask for help",
  },
  {
    description:
      "Your own clinicians and services, with names and numbers. The hard-coded crisis lines above stay available whether or not you fill this in.",
    key: "professionalContacts",
    placeholder: "Clinician, service, out-of-hours number",
    title: "5. Professionals and agencies I can contact",
  },
  {
    description:
      "What you will do to put time and distance between yourself and the means you would be most likely to use.",
    key: "meansSafety",
    placeholder: "What you will move, lock away, or hand to someone else",
    title: "6. Making the environment safe",
  },
];

export const SAFETY_PLAN_FRAMING =
  "This is plan storage and rehearsal, not the studied intervention. In a non-randomised comparison of 1,640 patients, a safety plan built with a clinician plus an average of 3.7 follow-up calls was associated with about half the rate of suicidal behaviour, 3.03% against 5.29%. Writing one here on your own is not that. Build it with a clinician if you can reach one.";

export const MEANS_SAFETY_ACKNOWLEDGEMENT =
  "I have read step 6 and am deliberately leaving it blank for now.";
