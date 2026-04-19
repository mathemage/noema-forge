import { afterEach, describe, expect, it, vi } from "vitest";

const { getDatabase } = vi.hoisted(() => ({
  getDatabase: vi.fn(() => {
    throw new Error("getDatabase should not be called without a token");
  }),
}));

vi.mock("@/lib/db/client", () => ({
  getDatabase,
}));

import { deleteSessionByToken, getUserBySessionToken } from "@/lib/auth/session";

afterEach(() => {
  vi.clearAllMocks();
});

describe("session access without a token", () => {
  it("returns early when deleting an undefined token", async () => {
    await expect(deleteSessionByToken(undefined)).resolves.toBeUndefined();
    expect(getDatabase).not.toHaveBeenCalled();
  });

  it("returns null without opening a database connection", async () => {
    await expect(getUserBySessionToken(undefined)).resolves.toBeNull();
    expect(getDatabase).not.toHaveBeenCalled();
  });
});
