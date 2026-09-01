import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { registerJournalUser, TEST_PASSWORD } from "./support/register";

function instrumentCard(page: Page, label: string) {
  return page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: label }) });
}

async function answerEvery(page: Page, itemCount: number, value: number) {
  for (let index = 0; index < itemCount; index += 1) {
    await page.locator(`input[name="answer-${index}"][value="${value}"]`).check();
  }
}

test("the limits statement comes before the first session and crisis resources follow every screen", async ({
  page,
}) => {
  const email = `safety-limits-${randomUUID()}@example.com`;

  await page.goto("/sign-in");
  const signedOutNotice = page.getByLabel("Safety and limits");
  await expect(signedOutNotice).toContainText("Emergency: your local emergency number.");
  await expect(signedOutNotice).toContainText("It is not therapy");

  await page.locator('form[action="/auth/register"] input[name="email"]').fill(email);
  await page
    .locator('form[action="/auth/register"] input[name="password"]')
    .fill(TEST_PASSWORD);
  await page.locator('form[action="/auth/register"] button[type="submit"]').click();

  await expect(page).toHaveURL(/\/safety\/limits$/);
  await expect(
    page.getByRole("heading", { name: "Before your first session" }),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem").filter({ hasText: "It is not therapy" }),
  ).toBeVisible();
  await expect(page.getByText("Nothing you write is filtered")).toBeVisible();
  await expect(page.getByRole("heading", { name: "If you need help now" })).toBeVisible();

  // The gate holds until it is read, however the user gets back to the journal.
  await page.goto("/");
  await expect(page).toHaveURL(/\/safety\/limits$/);

  await page.getByRole("button", { name: "I have read this" }).click();
  await expect(page.getByRole("heading", { name: "Journal history" })).toBeVisible();

  const notice = page.getByLabel("Safety and limits");
  await expect(notice).toBeVisible();

  await page.getByLabel("Entry", { exact: true }).fill(`Entry ${randomUUID()}`);
  await page.getByRole("button", { name: "Save entry" }).click();
  await expect(page.getByRole("heading", { name: "Entry detail" })).toBeVisible();
  await expect(notice).toBeVisible();

  // One step from an arbitrary screen to the resources and the safety plan.
  await notice.getByRole("link", { name: "Crisis resources and safety plan" }).click();
  await expect(page).toHaveURL(/\/safety$/);
  await expect(page.getByRole("heading", { name: "If you need help now" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Write a safety plan" })).toBeVisible();
});

test("check-ins store an exact score and never interpret it", async ({ page }) => {
  await registerJournalUser(page, `safety-checkin-${randomUUID()}@example.com`);

  await page.goto("/safety");
  await expect(instrumentCard(page, "PHQ-9")).toContainText("No check-in stored yet.");

  await page.getByRole("link", { name: "Start PHQ-9" }).click();
  await expect(
    page.getByRole("heading", { name: "PHQ-9 check-in" }),
  ).toBeVisible();
  await answerEvery(page, 9, 3);
  await page.getByRole("button", { name: "Save check-in" }).click();

  await expect(page.getByText("Check-in stored.")).toBeVisible();
  await expect(instrumentCard(page, "PHQ-9")).toContainText("27 of 27");
  await expect(instrumentCard(page, "PHQ-9")).toContainText(
    "unguided programmes produced a 37% response rate against 48%",
  );
  await expect(page.getByText(/moderate depression/i)).toHaveCount(0);
  await expect(page.getByText(/your score (means|indicates|suggests)/i)).toHaveCount(0);

  await page.getByRole("link", { name: "Start GAD-7" }).click();
  await answerEvery(page, 7, 0);
  await page.getByRole("button", { name: "Save check-in" }).click();

  await expect(instrumentCard(page, "GAD-7")).toContainText("0 of 21");
  await expect(instrumentCard(page, "GAD-7")).not.toContainText("response rate");
});

test("the safety plan keeps its six steps and will not skip means safety in silence", async ({
  page,
}) => {
  await registerJournalUser(page, `safety-plan-${randomUUID()}@example.com`);
  await page.goto("/safety");

  await expect(page.getByText("1. Warning signs")).toBeVisible();
  await expect(
    page.getByText("3. People and places that provide distraction"),
  ).toBeVisible();
  await expect(page.getByText("4. People I can ask for help")).toBeVisible();
  await expect(page.getByText("6. Making the environment safe")).toBeVisible();

  await page.locator('textarea[name="warningSigns"]').fill("Answering nobody");
  await page.locator('textarea[name="internalCoping"]').fill("Walk the long way");
  await page.locator('textarea[name="distraction"]').fill("The climbing gym");
  await page.locator('textarea[name="supportContacts"]').fill("Jana");
  await page.locator('textarea[name="professionalContacts"]').fill("Out-of-hours line");
  await page.getByRole("button", { name: "Save safety plan" }).click();

  await expect(page.getByText("Step 6 is empty")).toBeVisible();

  await page.locator('input[name="meansSafetyAcknowledged"]').check();
  await page.getByRole("button", { name: "Save safety plan" }).click();

  await expect(page.getByText("Safety plan saved.")).toBeVisible();
  await expect(page.locator('textarea[name="warningSigns"]')).toHaveValue(
    "Answering nobody",
  );
  await expect(page.locator('input[name="meansSafetyAcknowledged"]')).toBeChecked();
  await expect(page.getByText("associated with")).toBeVisible();
});

test("journal text is never filtered and trauma-writing directions need an opt-in", async ({
  page,
}) => {
  const distressingEntry = `I want to die and I keep planning it ${randomUUID()}`;

  await registerJournalUser(page, `safety-writing-${randomUUID()}@example.com`);

  await page.getByLabel("Entry", { exact: true }).fill(distressingEntry);
  await page.getByRole("button", { name: "Save entry" }).click();

  await expect(page).toHaveURL(/\/entries\/.+\?message=created$/);
  await expect(page.getByText(distressingEntry)).toBeVisible();

  await page.goto("/safety/trauma-writing");
  await expect(
    page.getByText("You are having thoughts of suicide or of hurting yourself."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Writing directions" }),
  ).toHaveCount(0);
  await expect(page.getByText("Write about the worst moment")).toHaveCount(0);

  await page
    .getByRole("button", { name: "I have read this. Show the directions." })
    .click();

  await expect(page.getByText("Opted in.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Writing directions" }),
  ).toBeVisible();
  await expect(page.getByText("Write about the worst moment")).toBeVisible();

  await page.getByRole("button", { name: "Turn these directions off" }).click();
  await expect(page.getByText("Opted out.")).toBeVisible();
  await expect(page.getByText("Write about the worst moment")).toHaveCount(0);
});
