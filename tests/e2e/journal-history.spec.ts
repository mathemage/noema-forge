import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { JOURNAL_HISTORY_PAGE_SIZE } from "../../src/lib/journal/limits";
import { registerJournalUser } from "./support/register";

const SEEDED_ENTRIES = JOURNAL_HISTORY_PAGE_SIZE + 1;

test("history pages and date filters keep an archive past one page usable", async ({
  page,
}) => {
  const uniqueId = randomUUID();
  const today = new Date().toISOString().slice(0, 10);

  await registerJournalUser(page, `history-${uniqueId}@example.com`);

  for (let index = 0; index < SEEDED_ENTRIES; index += 1) {
    const response = await page.request.post("/entries", {
      form: { body: `History entry ${index} ${uniqueId}`, source: "typed" },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(303);
  }

  await page.goto("/");
  await expect(page.locator("article")).toHaveCount(JOURNAL_HISTORY_PAGE_SIZE);
  await expect(page.getByText(`History entry ${SEEDED_ENTRIES - 1} ${uniqueId}`)).toBeVisible();
  await expect(page.getByText(`History entry 0 ${uniqueId}`)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Previous entries" })).toHaveCount(0);

  await page.getByRole("link", { name: "Older entries" }).click();
  await expect(page.locator("article")).toHaveCount(SEEDED_ENTRIES - JOURNAL_HISTORY_PAGE_SIZE);
  await expect(page.getByText(`History entry 0 ${uniqueId}`)).toBeVisible();
  await expect(page.getByRole("link", { name: "Older entries" })).toHaveCount(0);

  await page.getByRole("link", { name: "Previous entries" }).click();
  await expect(page.locator("article")).toHaveCount(JOURNAL_HISTORY_PAGE_SIZE);

  await page.getByLabel("From", { exact: true }).fill(today);
  await page.getByLabel("To", { exact: true }).fill(today);
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator("article")).toHaveCount(JOURNAL_HISTORY_PAGE_SIZE);

  await page.getByLabel("From", { exact: true }).fill("2020-01-01");
  await page.getByLabel("To", { exact: true }).fill("2020-12-31");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("No entries fall inside that date range yet.")).toBeVisible();

  await page.getByRole("searchbox", { name: "Search entry text" }).fill(uniqueId);
  await page.getByLabel("From", { exact: true }).fill(today);
  await page.getByLabel("To", { exact: true }).fill(today);
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator("article")).toHaveCount(JOURNAL_HISTORY_PAGE_SIZE);
  await expect(page.getByRole("link", { name: "Older entries" })).toBeVisible();
});
