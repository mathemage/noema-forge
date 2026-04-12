import { expect, test } from "@playwright/test";

test("home page renders the bootstrap shell", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Bootstrap the journaling foundation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open /api/health" }),
  ).toBeVisible();
  await expect(
    page.getByText("Ready for auth, entries, and upload features"),
  ).toBeVisible();
});

test("health route returns the readiness payload", async ({ request }) => {
  const response = await request.get("/api/health");
  const body = (await response.json()) as {
    checks: Array<{ key: string }>;
    status: string;
  };

  expect(response.ok()).toBeTruthy();
  expect(body.status).toBe("ok");
  expect(body.checks.map((check) => check.key)).toContain("database");
});
