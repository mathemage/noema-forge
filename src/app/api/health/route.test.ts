import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/client", () => ({
  checkDatabaseConnection: vi.fn(),
}));

import { GET } from "@/app/api/health/route";
import { checkDatabaseConnection } from "@/lib/db/client";

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/health", () => {
  it("returns 200 when PostgreSQL is available without requiring S3", async () => {
    vi.mocked(checkDatabaseConnection).mockResolvedValue(undefined);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      checks: [{ key: "database", status: "ok" }],
      status: "ok",
    });
    expect(checkDatabaseConnection).toHaveBeenCalledOnce();
  });

  it("returns a generic 503 when PostgreSQL is unavailable", async () => {
    vi.mocked(checkDatabaseConnection).mockRejectedValue(
      new Error("password secret-value failed for postgres://private-host"),
    );

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({
      checks: [{ key: "database", status: "unavailable" }],
      status: "unavailable",
    });
    expect(JSON.stringify(body)).not.toContain("secret-value");
    expect(JSON.stringify(body)).not.toContain("private-host");
  });
});
