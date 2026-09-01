export const severityInstrumentValues = ["phq-9", "gad-7"] as const;

export type SeverityInstrument = (typeof severityInstrumentValues)[number];

/** The published four-point response set. The value is the scored weight. */
export const severityResponseOptions = [
  { label: "Not at all", value: 0 },
  { label: "Several days", value: 1 },
  { label: "More than half the days", value: 2 },
  { label: "Nearly every day", value: 3 },
] as const;

const MAX_ITEM_SCORE = 3;

export type SeverityInstrumentDefinition = {
  attribution: string;
  items: string[];
  label: string;
  /** The evidence that applies at or above the threshold. Never a reading of the person. */
  routingMessage: string;
  routingThreshold: number;
  stem: string;
};

/**
 * Item wording is the published instrument. Do not paraphrase it: the score is
 * only exact if the questions are the ones the score was validated on.
 */
export const severityInstruments: Record<
  SeverityInstrument,
  SeverityInstrumentDefinition
> = {
  "gad-7": {
    attribution:
      "GAD-7 developed by Drs Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc. No permission required to reproduce, translate, display, or distribute.",
    items: [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it is hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid, as if something awful might happen",
    ],
    label: "GAD-7",
    routingMessage:
      "The guided-versus-unguided evidence this app is built on was measured on depression with the PHQ-9, so there is no matching response-rate figure to quote for this score. What carries over is the part about the app: NoemaForge is the unguided kind, it does not interpret your score, and it cannot tell you what the number means. If a clinician is reachable, this is a reasonable thing to take to them.",
    routingThreshold: 10,
    stem: "Over the last two weeks, how often have you been bothered by the following problems?",
  },
  "phq-9": {
    attribution:
      "PHQ-9 developed by Drs Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational grant from Pfizer Inc. No permission required to reproduce, translate, display, or distribute.",
    items: [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself, or that you are a failure, or that you have let yourself or your family down",
      "Trouble concentrating on things, such as reading the newspaper or watching television",
      "Moving or speaking so slowly that other people could have noticed, or the opposite, being so fidgety or restless that you have been moving around a lot more than usual",
      "Thoughts that you would be better off dead, or of hurting yourself in some way",
    ],
    label: "PHQ-9",
    routingMessage:
      "Ten is where the published trials stop agreeing with each other. In internet-delivered CBT, unguided programmes produced a 37% response rate against 48% with a human guide, and 40% against 55% in moderately severe cases. NoemaForge is the unguided kind. That is a fact about those trials, not a reading of you: this app does not interpret your score and cannot tell you what the number means. If a clinician is reachable, this is the range where the difference was largest.",
    routingThreshold: 10,
    stem: "Over the last two weeks, how often have you been bothered by the following problems?",
  },
};

/** Two weeks, because that is the window each instrument asks about. */
export const SEVERITY_CHECK_IN_INTERVAL_DAYS = 14;

const severityInstrumentSet = new Set<string>(severityInstrumentValues);

export function isSeverityInstrument(value: string): value is SeverityInstrument {
  return severityInstrumentSet.has(value);
}

export function getMaxScore(instrument: SeverityInstrument) {
  return severityInstruments[instrument].items.length * MAX_ITEM_SCORE;
}

/**
 * Sums the published items. Returns `null` for anything that is not one whole
 * response per item, because a partial questionnaire has no valid score.
 */
export function scoreSeverityCheckIn(
  instrument: SeverityInstrument,
  answers: number[],
) {
  const { items } = severityInstruments[instrument];

  if (
    answers.length !== items.length ||
    answers.some(
      (answer) =>
        !Number.isInteger(answer) || answer < 0 || answer > MAX_ITEM_SCORE,
    )
  ) {
    return null;
  }

  return answers.reduce((total, answer) => total + answer, 0);
}

export function isAboveRoutingThreshold(
  instrument: SeverityInstrument,
  score: number,
) {
  return score >= severityInstruments[instrument].routingThreshold;
}

export function nextCheckInDate(takenAt: Date) {
  const next = new Date(takenAt);
  next.setUTCDate(next.getUTCDate() + SEVERITY_CHECK_IN_INTERVAL_DAYS);

  return next;
}

export function isCheckInDue(takenAt: Date | null, now = new Date()) {
  return takenAt === null || nextCheckInDate(takenAt) <= now;
}
