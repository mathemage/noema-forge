import { randomUUID } from "node:crypto";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { registerJournalUser } from "./support/register";

const responsiveViewports = [
  { height: 700, width: 320 },
  { height: 1024, width: 768 },
  { height: 720, width: 1280 },
  { height: 900, width: 1440 },
];

test("auth visual system stays polished and usable across responsive viewports", async ({
  page,
}) => {
  for (const viewport of responsiveViewports) {
    await page.setViewportSize(viewport);
    await page.goto("/sign-in");

    const accessRegion = page.getByRole("region", {
      name: "NoemaForge journal access",
    });
    await expect(accessRegion).toBeVisible();
    await expect(page.locator(".ink-panel")).not.toHaveCSS(
      "background-image",
      "none",
    );
    await expect(page.locator(".paper-panel")).not.toHaveCSS(
      "box-shadow",
      "none",
    );
    await expectPageToFitViewport(page);
    expect(await hasOverlappingControls(accessRegion)).toBe(false);
  }

  const registerEmail = page.locator(
    'form[action="/auth/register"] input[name="email"]',
  );
  await registerEmail.focus();
  await expect(registerEmail).toBeFocused();
  await expect(registerEmail).toHaveCSS("outline-style", "solid");
});

test("signed-in journal surfaces keep controls in bounds without overlap", async ({
  page,
}) => {
  const uniqueId = randomUUID();
  const email = `visual-${uniqueId}@example.com`;
  const entryText = `Responsive visual entry ${uniqueId}`;

  await registerJournalUser(page, email);

  await page.getByLabel("Entry", { exact: true }).fill(entryText);
  await page.getByRole("button", { name: "Save entry" }).click();
  await expect(page.getByRole("heading", { name: "Entry detail" })).toBeVisible();

  await page.setViewportSize({ height: 700, width: 320 });
  await expectPageToFitViewport(page);
  expect(await hasOverlappingControls(page.getByRole("main"))).toBe(false);

  await page.getByRole("link", { name: "Back to journal" }).click();
  await expect(page.getByRole("heading", { name: "Journal history" })).toBeVisible();

  for (const viewport of responsiveViewports) {
    await page.setViewportSize(viewport);
    await page.reload();

    await expect(
      page.getByRole("heading", { name: "New journal entry" }),
    ).toBeVisible();
    await expect(page.getByText(entryText)).toBeVisible();
    await expectPageToFitViewport(page);
    expect(await hasOverlappingControls(page.getByRole("main"))).toBe(false);
  }

  await page.setViewportSize({ height: 700, width: 320 });
  await page.getByRole("button", { name: "Handwriting OCR" }).click();
  await expect(page.getByLabel("Handwritten note image")).toBeVisible();
  await expectPageToFitViewport(page);

  const entryEditor = page.getByLabel("Entry", { exact: true });
  await entryEditor.focus();
  await expect(entryEditor).toBeFocused();
  await expect(entryEditor).toHaveCSS("outline-style", "solid");
});

async function expectPageToFitViewport(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
    )
    .toBeLessThanOrEqual(1);

  const overflowingControls = await page
    .locator(
      'main a[href], main button, main input:not([type="hidden"]), main textarea',
    )
    .evaluateAll((controls) => {
      const viewportWidth = document.documentElement.clientWidth;

      return controls.flatMap((control) => {
        const bounds = control.getBoundingClientRect();
        const label =
          control.getAttribute("aria-label") ??
          control.textContent?.trim() ??
          control.getAttribute("name") ??
          control.tagName.toLowerCase();

        return bounds.width > 0 &&
          (bounds.left < -1 || bounds.right > viewportWidth + 1)
          ? [label]
          : [];
      });
    });

  expect(overflowingControls).toEqual([]);
}

async function hasOverlappingControls(region: Locator) {
  return region
    .locator('a[href], button, input:not([type="hidden"]), textarea')
    .evaluateAll((controls) => {
      const bounds = controls
        .map((control) => control.getBoundingClientRect())
        .filter((box) => box.width > 0 && box.height > 0);

      return bounds.some((current, index) =>
        bounds.slice(index + 1).some(
          (candidate) =>
            current.left < candidate.right &&
            current.right > candidate.left &&
            current.top < candidate.bottom &&
            current.bottom > candidate.top,
        ),
      );
    });
}
