import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("hashes and verifies a valid password", async () => {
    const password = "journal-pass-123";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("returns false for malformed scrypt parameters", async () => {
    await expect(
      verifyPassword(
        "journal-pass-123",
        "scrypt$not-a-number$8$1$salt$0123456789abcdef",
      ),
    ).resolves.toBe(false);
    await expect(
      verifyPassword(
        "journal-pass-123",
        "scrypt$16384$0$1$salt$0123456789abcdef",
      ),
    ).resolves.toBe(false);
  });
});
