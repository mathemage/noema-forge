import { expect, type Page } from "@playwright/test";

export const TEST_PASSWORD = "journal-pass-123";

/**
 * Registers a journal account and clears the limits statement, which the app
 * shows before a user's first session.
 */
export async function registerJournalUser(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.locator('form[action="/auth/register"] input[name="email"]').fill(email);
  await page
    .locator('form[action="/auth/register"] input[name="password"]')
    .fill(TEST_PASSWORD);
  await page.locator('form[action="/auth/register"] button[type="submit"]').click();

  await expect(
    page.getByRole("heading", { name: "Before your first session" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "I have read this" }).click();
  await expect(page.getByRole("heading", { name: "Journal history" })).toBeVisible();
}
