import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

function createCredentials() {
  const uniqueId = randomUUID();

  return {
    email: `journal-${uniqueId}@example.com`,
    password: "journal-pass-123",
    uniqueId,
  };
}

test("desktop user can register, create, edit, search, sign out, and sign back in", async ({
  page,
}) => {
  const credentials = createCredentials();
  const initialEntry = `Raw journal entry ${credentials.uniqueId}`;
  const updatedEntry = `${initialEntry} refined`;

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

  await page.locator('form[action="/entries"] textarea[name="body"]').fill(initialEntry);
  await page.getByRole("button", { name: "Save entry" }).click();

  await expect(page).toHaveURL(/\/entries\/.+\?message=created$/);
  await expect(page.getByText(initialEntry)).toBeVisible();
  await expect(page.getByText("typed", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Edit entry" }).click();
  await expect(page).toHaveURL(/\/entries\/.+\/edit$/);
  await expect(page.getByRole("heading", { name: "Edit entry" })).toBeVisible();
  const editor = page.locator('textarea[name="body"]');
  await expect(editor).toHaveValue(initialEntry);
  await editor.fill(updatedEntry);
  await expect(editor).toHaveValue(updatedEntry);
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page).toHaveURL(/\/entries\/.+\?message=updated$/);
  await expect(page.getByText(updatedEntry)).toBeVisible();

  await page.getByRole("link", { name: "Back to journal" }).click();
  await expect(page.getByRole("heading", { name: "Journal history" })).toBeVisible();

  await page.getByRole("searchbox", { name: "Search entry text" }).fill("refined");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText(updatedEntry)).toBeVisible();

  await page
    .getByRole("searchbox", { name: "Search entry text" })
    .fill("missing-term");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText('No entries match "missing-term" yet.')).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in\?message=signed-out$/);

  await page
    .locator('form[action="/auth/sign-in"] input[name="email"]')
    .fill(credentials.email);
  await page
    .locator('form[action="/auth/sign-in"] input[name="password"]')
    .fill(credentials.password);
  await page
    .locator('form[action="/auth/sign-in"] button[type="submit"]')
    .click();

  await expect(page.getByRole("heading", { name: "Journal history" })).toBeVisible();
  await page.getByRole("searchbox", { name: "Search entry text" }).fill("refined");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText(updatedEntry)).toBeVisible();
});
