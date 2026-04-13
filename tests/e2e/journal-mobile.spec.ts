import { expect, test } from "@playwright/test";

test.use({
  viewport: {
    height: 844,
    width: 390,
  },
});

function createCredentials() {
  const uniqueId = `${Date.now()}-${Math.round(Math.random() * 10_000)}`;

  return {
    email: `mobile-${uniqueId}@example.com`,
    password: "journal-pass-123",
    uniqueId,
  };
}

test("mobile layout keeps typed capture and history usable", async ({ page }) => {
  const credentials = createCredentials();
  const entryText = `Mobile journal entry ${credentials.uniqueId}`;

  await page.goto("/sign-in");
  await page
    .locator('form[action="/auth/register"] input[name="email"]')
    .fill(credentials.email);
  await page
    .locator('form[action="/auth/register"] input[name="password"]')
    .fill(credentials.password);
  await page
    .locator('form[action="/auth/register"] button[type="submit"]')
    .click();

  await expect(page.getByRole("heading", { name: "Journal history" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "New typed entry" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();

  await page.locator('form[action="/entries"] textarea[name="body"]').fill(entryText);
  await page.getByRole("button", { name: "Save entry" }).click();

  await expect(page.getByText(entryText)).toBeVisible();
  await page.getByRole("link", { name: "Back to journal" }).click();
  await expect(page.getByText(entryText)).toBeVisible();
  await expect(page.getByRole("link", { name: "View" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Edit" })).toBeVisible();
});
