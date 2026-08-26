export const sessionTypeValues = [
  "reflection",
  "decision",
  "practice",
  "review",
] as const;

export type SessionType = (typeof sessionTypeValues)[number];

/** The only protocol v1 ever ran: raw capture plus the three distillation fields. */
export const GUIDED_REFLECTION_PROTOCOL_VARIANT = "guided-reflection-v1";
export const PROTOCOL_VARIANT_MAX_LENGTH = 80;
