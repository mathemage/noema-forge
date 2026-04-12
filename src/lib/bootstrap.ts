import {
  hasDatabaseConfig,
  hasStorageConfig,
  readServerEnv,
  type ServerEnv,
} from "@/lib/env";

export type BootstrapCheckKey =
  | "shell"
  | "database"
  | "storage"
  | "automation";

export type BootstrapCheck = {
  configured: boolean;
  detail: string;
  key: BootstrapCheckKey;
  label: string;
};

export type BootstrapSummary = {
  configured: number;
  label: string;
  ready: boolean;
  total: number;
};

export function getBootstrapChecks(
  env: ServerEnv = readServerEnv(),
): BootstrapCheck[] {
  const databaseConfigured = hasDatabaseConfig(env);
  const storageConfigured = hasStorageConfig(env);

  return [
    {
      configured: true,
      detail:
        "The Next.js App Router shell is in place for auth, journaling, and reflection work.",
      key: "shell",
      label: "Responsive shell",
    },
    {
      configured: databaseConfigured,
      detail: databaseConfigured
        ? "DATABASE_URL is present for local or hosted PostgreSQL access."
        : "Set DATABASE_URL in .env.local before running Drizzle against Postgres.",
      key: "database",
      label: "PostgreSQL + Drizzle",
    },
    {
      configured: storageConfigured,
      detail: storageConfigured
        ? "S3 connection values are present for the future uploads slice."
        : "Set the S3_* values before wiring voice or handwriting uploads.",
      key: "storage",
      label: "S3-compatible storage",
    },
    {
      configured: true,
      detail: "Vitest, Playwright, and GitHub Actions are wired for smoke coverage.",
      key: "automation",
      label: "Tests + CI",
    },
  ];
}

export function getBootstrapSummary(
  checks: BootstrapCheck[] = getBootstrapChecks(),
): BootstrapSummary {
  const configured = checks.filter((check) => check.configured).length;
  const total = checks.length;
  const ready = configured === total;

  return {
    configured,
    label: ready
      ? "All runtime integrations are configured."
      : "The scaffold is live; add env values when you are ready to activate the remaining integrations.",
    ready,
    total,
  };
}
