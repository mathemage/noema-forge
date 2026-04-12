import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/health/route";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/health", () => {
  it("returns a healthy payload without requiring runtime integrations", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_NAME", "NoemaForge Test");
    vi.stubEnv("DATABASE_URL", undefined);
    vi.stubEnv("DATABASE_URL_NON_POOLING", undefined);
    vi.stubEnv("S3_ACCESS_KEY_ID", undefined);
    vi.stubEnv("S3_BUCKET", undefined);
    vi.stubEnv("S3_ENDPOINT", undefined);
    vi.stubEnv("S3_SECRET_ACCESS_KEY", undefined);

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
