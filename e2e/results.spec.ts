import { expect, EXPECTED, EXPECTED_TOTAL, missingCount, openProfile, resultTitles, test } from "./fixtures/steam";



test.describe("results", () => {
  test.beforeEach(async ({ page }) => {
    await openProfile(page, "gaben");
  });

  test("counts every category", async ({ page }) => {
    await expect(resultTitles(page)).toHaveCount(EXPECTED_TOTAL);

    for (const [label, names] of [["DLC", EXPECTED.dlc], ["Soundtracks", EXPECTED.soundtrack], ["Editions", EXPECTED.edition], ["Franchise", EXPECTED.franchise], ["Studios", EXPECTED.studio]] as const) {
      await expect(page.getByRole("button", { name: new RegExp(`^${label}`) })).toContainText(String(names.length));
    }
  });

  test("filters by category through the URL", async ({ page }) => {
    await page.getByRole("button", { name: /^Soundtracks/ }).click();

    await expect(page).toHaveURL(/category=soundtrack/);
    await expect(resultTitles(page)).toHaveText([...EXPECTED.soundtrack]);

    await page.reload();
    await expect(page.getByRole("button", { name: /^Soundtracks/ })).toHaveAttribute("aria-pressed", "true");
    await expect(resultTitles(page)).toHaveText([...EXPECTED.soundtrack]);
  });

  test("filters by name and resets from the empty state", async ({ page }) => {
    const filter = page.getByLabel("Filter by name");

    await filter.fill("portal");
    await expect(page).toHaveURL(/q=portal/);
    await expect(resultTitles(page)).toHaveText(["Portal 2"]);

    await filter.fill("zzz");
    await expect(page.getByText("No matches")).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(resultTitles(page)).toHaveCount(EXPECTED_TOTAL);
  });

  test("sorts by price", async ({ page }) => {
    await page.getByRole("combobox", { name: "Sort" }).click();
    await page.getByRole("option", { name: "Price, low to high" }).click();

    await expect(page).toHaveURL(/sort=price-asc/);
    await expect(resultTitles(page).first()).toHaveText("Skyrim - Hearthfire");
    await expect(resultTitles(page).last()).toHaveText("Skyrim Special Edition");
  });

  test("groups by game and collapses groups", async ({ page }) => {
    await page.getByRole("button", { name: "Group by game" }).click();
    await expect(page).toHaveURL(/group=true/);

    const headings = page.locator("[role=listitem] h3 button");

    await expect(headings).toHaveCount(3);
    await expect(headings.first()).toContainText("Skyrim");

    await headings.first().click();
    await expect(headings.first()).toHaveAttribute("aria-expanded", "false");
    await expect(resultTitles(page)).not.toContainText(["Skyrim - Dawnguard"]);

    const toggleAll = page.getByRole("button", { name: "Collapse all groups" });

    await toggleAll.click();
    await expect(resultTitles(page)).toHaveCount(0);
    await page.getByRole("button", { name: "Expand all groups" }).click();
    await expect(resultTitles(page)).toHaveCount(EXPECTED_TOTAL);
  });

  test("links each item to its store page in a new tab", async ({ page }) => {
    const link = page.locator("[role=listitem] a").first();

    await expect(link).toHaveAttribute("href", /store\.steampowered\.com\/app\/\d+/);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("condenses the profile header into a sticky bar on scroll", async ({ page }) => {
    const bar = page.locator(".sticky.top-14");

    await expect(bar).not.toHaveAttribute("data-compact");
    await page.mouse.wheel(0, 600);
    await expect(bar).toHaveAttribute("data-compact", "true");
    await expect(bar).toBeInViewport();
    await expect(page.getByRole("button", { name: /^All/ })).toBeInViewport();

    await page.mouse.wheel(0, -2000);
    await expect(bar).not.toHaveAttribute("data-compact");
    await expect(missingCount(page)).toHaveText(String(EXPECTED_TOTAL));
  });
});
