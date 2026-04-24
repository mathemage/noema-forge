import { z } from "zod";

const coerceOptional = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const optionalText = z.preprocess(coerceOptional, z.string().optional());
const optionalUrl = z.preprocess(coerceOptional, z.string().url().optional());
const textWithDefault = (defaultValue: string) =>
  z.preprocess(coerceOptional, z.string().default(defaultValue));

const serverEnvSchema = z.object({
  AUTH_SECRET: optionalText,
  AUTH_SIGN_IN_MODE: z.preprocess(
    coerceOptional,
    z.enum(["journal", "authjs-credentials"]).default("journal"),
  ),
  AUTH_TRUST_HOST: z.preprocess(
    coerceOptional,
    z.enum(["true", "false"]).default("false"),
  ),
  DATABASE_URL: optionalUrl,
  DATABASE_URL_NON_POOLING: optionalUrl,
  NEXT_PUBLIC_APP_NAME: textWithDefault("NoemaForge"),
  NEXT_PUBLIC_APP_URL: z.preprocess(
    coerceOptional,
    z.string().url().default("http://127.0.0.1:3000"),
  ),
  OLLAMA_BASE_URL: optionalUrl,
  OLLAMA_MODEL: optionalText,
  S3_ACCESS_KEY_ID: optionalText,
  S3_BUCKET: optionalText,
  S3_ENDPOINT: optionalUrl,
  S3_FORCE_PATH_STYLE: z.preprocess(
    coerceOptional,
    z.enum(["true", "false"]).default("true"),
  ),
  S3_REGION: textWithDefault("us-east-1"),
  S3_SECRET_ACCESS_KEY: optionalText,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export type StorageConfig = {
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  forcePathStyle: boolean;
  region: string;
  secretAccessKey: string;
};

export function readServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  return serverEnvSchema.parse(source);
}

export function usesAuthJsCredentials(env: ServerEnv = readServerEnv()) {
  return env.AUTH_SIGN_IN_MODE === "authjs-credentials";
}

export function shouldTrustAuthHost(env: ServerEnv = readServerEnv()) {
  if (env.AUTH_TRUST_HOST === "true") {
    return true;
  }

  return ["127.0.0.1", "::1", "localhost"].includes(
    new URL(env.NEXT_PUBLIC_APP_URL).hostname,
  );
}

export function getAuthSecret(env: ServerEnv = readServerEnv()) {
  if (!env.AUTH_SECRET) {
    throw new Error(
      "AUTH_SECRET is required when AUTH_SIGN_IN_MODE=authjs-credentials.",
    );
  }

  return env.AUTH_SECRET;
}

export function hasDatabaseConfig(env: ServerEnv = readServerEnv()) {
  return Boolean(env.DATABASE_URL);
}

export function hasStorageConfig(env: ServerEnv = readServerEnv()) {
  return Boolean(
    env.S3_ACCESS_KEY_ID &&
      env.S3_BUCKET &&
      env.S3_ENDPOINT &&
      env.S3_SECRET_ACCESS_KEY,
  );
}

export function getDatabaseUrl(env: ServerEnv = readServerEnv()) {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required before opening a database connection.");
  }

  return env.DATABASE_URL;
}

export function getDatabaseUrlNonPooling(env: ServerEnv = readServerEnv()) {
  return env.DATABASE_URL_NON_POOLING ?? getDatabaseUrl(env);
}

export function getStorageConfig(env: ServerEnv = readServerEnv()): StorageConfig {
  if (!hasStorageConfig(env)) {
    throw new Error(
      "S3 storage configuration is incomplete. Set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.",
    );
  }

  return {
    accessKeyId: env.S3_ACCESS_KEY_ID!,
    bucket: env.S3_BUCKET!,
    endpoint: env.S3_ENDPOINT!,
    forcePathStyle: env.S3_FORCE_PATH_STYLE === "true",
    region: env.S3_REGION,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
  };
}
