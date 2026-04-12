import { getBootstrapChecks, getBootstrapSummary } from "@/lib/bootstrap";
import { readServerEnv } from "@/lib/env";

describe("getBootstrapChecks", () => {
  it("marks database and storage as pending when env values are missing", () => {
    const env = readServerEnv({
      NEXT_PUBLIC_APP_NAME: "NoemaForge",
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
    });

    const checks = getBootstrapChecks(env);
    const summary = getBootstrapSummary(checks);

    expect(checks.find((check) => check.key === "database")?.configured).toBe(
      false,
    );
    expect(checks.find((check) => check.key === "storage")?.configured).toBe(
      false,
    );
    expect(summary.ready).toBe(false);
    expect(summary.configured).toBe(2);
  });

  it("reports full readiness when database and storage config are present", () => {
    const env = readServerEnv({
      DATABASE_URL: "postgres://postgres:postgres@127.0.0.1:5432/noema_forge",
      DATABASE_URL_NON_POOLING:
        "postgres://postgres:postgres@127.0.0.1:5432/noema_forge",
      NEXT_PUBLIC_APP_NAME: "NoemaForge",
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
      S3_ACCESS_KEY_ID: "minioadmin",
      S3_BUCKET: "noema-forge-local",
      S3_ENDPOINT: "http://127.0.0.1:9000",
      S3_REGION: "us-east-1",
      S3_SECRET_ACCESS_KEY: "minioadmin",
    });

    const checks = getBootstrapChecks(env);
    const summary = getBootstrapSummary(checks);

    expect(summary.ready).toBe(true);
    expect(summary.configured).toBe(summary.total);
  });
});
