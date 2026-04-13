import { expect, test } from "@playwright/test";

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

test("signed-out users are redirected to sign-in", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(
    page.getByRole("heading", {
      name: "Private typed capture, ready when you are.",
    }),
  ).toBeVisible();
});
