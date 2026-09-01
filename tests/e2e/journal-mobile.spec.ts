import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { registerJournalUser } from "./support/register";

test.use({
  viewport: {
    height: 844,
    width: 390,
  },
});

function createCredentials() {
  const uniqueId = randomUUID();

  return {
    email: `mobile-${uniqueId}@example.com`,
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

test("mobile layout keeps multimodal capture and history usable", async ({ page }) => {
  const credentials = createCredentials();
  const entryText = `Mobile journal entry ${credentials.uniqueId}`;

  await registerJournalUser(page, credentials.email);

  await expect(page.getByRole("heading", { name: "New journal entry" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guided reflection" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Voice dictation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Handwriting OCR" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await waitForCaptureForm(page);

  await page.locator('form[action="/entries"] textarea[name="body"]').fill(entryText);
  await page.getByRole("button", { name: "Save entry" }).click();

  await expect(page.getByText(entryText)).toBeVisible();
  await page.getByRole("link", { name: "Back to journal" }).click();
  await expect(page.getByText(entryText)).toBeVisible();
  await expect(page.getByRole("link", { name: "View" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Edit" })).toBeVisible();
});
