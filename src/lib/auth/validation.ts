import { z } from "zod";

const normalizedEmail = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Use 128 characters or fewer.");

export const credentialsSchema = z.object({
  email: normalizedEmail,
  password,
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;
