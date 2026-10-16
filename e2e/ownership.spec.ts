import type { Page } from "@playwright/test";

import { expect, EXPECTED_TOTAL, missingCount, openProfile, resultTitles, test } from "./fixtures/steam";



const USERDATA = JSON.stringify({
  rgWishlist: [301, 999],
  rgOwnedApps: [100, 200, 300, 101],
  rgIgnoredApps: { 202: 0 },
  rgOwnedPackages: [],
});

function card(page: Page, name: string) {
  return page.locator("[role=listitem]").filter({ has: page.getByRole("heading", { name, exact: true }) });
}

async function importUserData(page: Page, text: string): Promise<void> {
  await page.getByRole("button", { name: "More actions" }).click();
  await page.getByRole("menuitem", { name: /Import what you own/ }).click();
  await page.getByLabel("Store data").fill(text);
  await page.getByRole("button", { name: "Import", exact: true }).click();
}

test.describe("ownership", () => {
  test.beforeEach(async ({ page }) => {
    await openProfile(page, "gaben");
  });

  test("rejects a paste that is not store data", async ({ page }) => {
    await importUserData(page, "hello");

    await expect(page.locator("[data-slot=field-error]")).toContainText("does not look like the userdata page");
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("imports owned, ignored and wishlisted apps", async ({ page }) => {
    await expect(page.getByText("Own some of these already?")).toBeVisible();

    await page.getByRole("button", { name: "More actions" }).click();
    await page.getByRole("menuitem", { name: /Import what you own/ }).click();
    await page.getByLabel("Store data").fill(`Pretty-print\n${USERDATA}`);
    await expect(page.getByText("Found 4 owned apps, 2 wishlisted and 1 ignored, which will be hidden.")).toBeVisible();
    await page.getByRole("button", { name: "Import", exact: true }).click();

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(missingCount(page)).toHaveText(String(EXPECTED_TOTAL - 2));
    await expect(page.getByRole("button", { name: /^Owned/ })).toContainText("1");
    await expect(page.getByRole("button", { name: /^Hidden/ })).toContainText("1");
    await expect(page.getByText("Own some of these already?")).toBeHidden();

    await expect(card(page, "Portal 2")).toContainText("Wishlisted");
    await page.getByRole("button", { name: /^Wishlisted/ }).click();
    await expect(page).toHaveURL(/wishlist=true/);
    await expect(resultTitles(page)).toHaveText(["Portal 2"]);
  });

  test("marks items owned or hidden, and moves them back @mobile", async ({ page }) => {
    await card(page, "Skyrim - Dawnguard").getByRole("button", { name: /^Mark as owned/ }).click();
    await card(page, "Hollow Knight OST").getByRole("button", { name: /^Hide/ }).click();

    await expect(missingCount(page)).toHaveText(String(EXPECTED_TOTAL - 2));
    await expect(resultTitles(page)).not.toContainText(["Skyrim - Dawnguard", "Hollow Knight OST"]);

    await page.getByRole("button", { name: /^Hidden/ }).click();
    await expect(page).toHaveURL(/view=hidden/);
    await expect(resultTitles(page)).toHaveText(["Hollow Knight OST"]);
    await card(page, "Hollow Knight OST").getByRole("button", { name: /^Show again/ }).click();
    await expect(resultTitles(page)).toHaveCount(0);

    await page.reload();
    await expect(missingCount(page)).toHaveText(String(EXPECTED_TOTAL - 1));
    await page.getByRole("button", { name: /^Owned/ }).click();
    await expect(resultTitles(page)).toHaveText(["Skyrim - Dawnguard"]);
  });

  test("syncs marks across tabs", async ({ page, context }) => {
    const other = await context.newPage();

    await openProfile(other, "gaben");
    await card(page, "Portal 2").getByRole("button", { name: /^Hide/ }).click();

    await expect(missingCount(other)).toHaveText(String(EXPECTED_TOTAL - 1));
  });

  test("keeps marks when the cache is cleared", async ({ page }) => {
    await card(page, "Portal 2").getByRole("button", { name: /^Hide/ }).click();

    await page.getByRole("button", { name: "More actions" }).click();
    await page.getByRole("menuitem", { name: /Clear cached data/ }).click();
    await Promise.all([page.waitForEvent("load"), page.getByRole("button", { name: "Clear and reload" }).click()]);

    await expect(missingCount(page)).toHaveText(String(EXPECTED_TOTAL - 1));
    await expect(page.getByRole("button", { name: /^Hidden/ })).toContainText("1");
  });
});
