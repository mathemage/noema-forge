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
  const feeling = "Focused but tense";
  const rootIssue = "The next action is vague";
  const nextStep = "Write the first sentence";
  const editableEntry = `Editable journal entry ${credentials.uniqueId}`;
  const updatedEntry = `${editableEntry} refined`;

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
  await expect(page.getByRole("button", { name: "Voice dictation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Handwriting OCR" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guided reflection" })).toBeVisible();
  await expect(page.locator('form[action="/entries"]')).toHaveAttribute(
    "data-ready",
    "true",
  );

  await page.route("**/api/reflection/assist", async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        followUpQuestion: "What would unblock one honest step?",
        message: "Local guidance used for the test.",
        source: "fallback",
        suggestions: ["Open the draft.", "Write one imperfect sentence."],
      }),
      contentType: "application/json",
      status: 200,
    });
  });
  await page.locator('form[action="/entries"] textarea[name="body"]').fill(initialEntry);
  await page.getByLabel("Feeling").fill(feeling);
  await page.getByLabel("Root issue").fill(rootIssue);
  await page.getByLabel("Next step").fill(nextStep);
  await page.getByRole("button", { name: "Get reflection prompt" }).click();
  await expect(
    page.getByText("What would unblock one honest step?"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save entry" }).click();

  await expect(page).toHaveURL(/\/entries\/.+\?message=created$/);
  await expect(page.getByText(initialEntry)).toBeVisible();
  await expect(page.getByText("Guided reflection:")).toBeVisible();
  await expect(page.getByText("Local guidance:")).toBeVisible();
  await expect(page.getByText(feeling)).toBeVisible();
  await expect(page.getByText(rootIssue)).toBeVisible();
  await expect(page.getByText(nextStep)).toBeVisible();
  await expect(page.getByText("Open the draft.")).toBeVisible();
  await expect(page.getByText("Typed", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Back to journal" }).click();
  await expect(page.getByRole("heading", { name: "Journal history" })).toBeVisible();
  await expect(page.locator('form[action="/entries"]')).toHaveAttribute(
    "data-ready",
    "true",
  );

  await page.locator('form[action="/entries"] textarea[name="body"]').fill(editableEntry);
  await page.getByRole("button", { name: "Save entry" }).click();
  await expect(page).toHaveURL(/\/entries\/.+\?message=created$/);
  await expect(page.getByText(editableEntry)).toBeVisible();

  await page.getByRole("link", { name: "Edit entry" }).click();
  await expect(page).toHaveURL(/\/entries\/.+\/edit$/);
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: "Edit entry" })).toBeVisible();
  const editor = page.locator('textarea[name="body"]');
  await expect(editor).toHaveValue(editableEntry);
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
