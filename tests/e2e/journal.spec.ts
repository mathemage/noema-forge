import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

function createCredentials() {
  const uniqueId = randomUUID();

  return {
    email: `journal-${uniqueId}@example.com`,
    password: "journal-pass-123",
    uniqueId,
  };
}

async function waitForCaptureForm(page: Page) {
  const voiceButton = page.getByRole("button", { name: "Voice dictation" });

  await expect
    .poll(async () => {
      await voiceButton.click();
      return voiceButton.getAttribute("aria-pressed");
    })
    .toBe("true");

  const typedButton = page.getByRole("button", { name: "Typed" });
  await typedButton.click();
  await expect(typedButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Entry", { exact: true })).toBeEditable();
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
  await waitForCaptureForm(page);

  await page.goto("/?error=invalid-input");
  await expect(
    page.getByText(
      "Add a raw entry and keep each reflection field to 2,000 characters or fewer before saving.",
    ),
  ).toBeVisible();
  await waitForCaptureForm(page);

  await page.locator('form[action="/entries"] textarea[name="body"]').fill(initialEntry);
  await page.getByLabel("Feeling").fill(feeling);
  await page.getByLabel("Root issue").fill(rootIssue);
  await page.getByLabel("Next step").fill(nextStep);
  await page.getByRole("button", { name: "Get reflection prompt" }).click();
  await expect(
    page.getByText("What is the smallest honest next step you can take today?"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save entry" }).click();

  await expect(page).toHaveURL(/\/entries\/.+\?message=created$/);
  await expect(page.getByText(initialEntry)).toBeVisible();
  await expect(page.getByText("Guided reflection:")).toBeVisible();
  await expect(page.getByText("Local guidance:")).toBeVisible();
  await expect(page.getByText(feeling)).toBeVisible();
  await expect(page.getByText(rootIssue)).toBeVisible();
  await expect(page.getByText(nextStep)).toBeVisible();
  await expect(
    page.getByText("Name one concrete action that can be finished in 10 minutes."),
  ).toBeVisible();
  await expect(page.getByText("Typed", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Back to journal" }).click();
  await expect(page.getByRole("heading", { name: "Journal history" })).toBeVisible();
  await waitForCaptureForm(page);

  await page.locator('form[action="/entries"] textarea[name="body"]').fill(editableEntry);
  await page.getByRole("button", { name: "Save entry" }).click();
  await expect(page).toHaveURL(/\/entries\/.+\?message=created$/);
  await expect(page.getByText(editableEntry)).toBeVisible();

  await page.getByRole("link", { name: "Edit entry" }).click();
  await expect(page).toHaveURL(/\/entries\/.+\/edit$/);
  await page.waitForLoadState("load");
  await expect(page.getByRole("heading", { name: "Edit entry" })).toBeVisible();
  const editForm = page.locator('form[action$="/update"]');
  await expect(editForm).toBeVisible();
  const editor = editForm.locator('textarea[name="body"]');
  await expect(editor).toHaveValue(editableEntry);
  await editor.fill(updatedEntry);
  await expect(editor).toHaveValue(updatedEntry);
  const updateRequestPromise = page.waitForRequest((request) => {
    const { pathname } = new URL(request.url());

    return request.method() === "POST" && /\/entries\/[^/]+\/update$/.test(pathname);
  });
  await editForm.getByRole("button", { name: "Save changes" }).click();
  const updateRequest = await updateRequestPromise;
  expect(new URLSearchParams(updateRequest.postData() ?? "").get("body")).toBe(
    updatedEntry,
  );

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
