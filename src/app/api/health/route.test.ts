import { afterEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("GET /api/health", () => {
  it("returns a healthy payload without requiring runtime integrations", async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_APP_NAME: "NoemaForge Test",
    };
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_URL_NON_POOLING;
    delete process.env.S3_ACCESS_KEY_ID;
    delete process.env.S3_BUCKET;
    delete process.env.S3_ENDPOINT;
    delete process.env.S3_SECRET_ACCESS_KEY;

    const response = await GET();
    const body = (await response.json()) as {
      app: string;
      checks: Array<{ configured: boolean }>;
      readiness: { configured: number; total: number };
      status: string;
    };

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.app).toBe("NoemaForge Test");
    expect(body.readiness.configured).toBe(2);
    expect(body.readiness.total).toBe(4);
    expect(body.checks).toHaveLength(4);
  });
});
