import { expect, EXPECTED_TOTAL, missingCount, PROFILES, test, waitForAnalysis } from "./fixtures/steam";



test.describe("profile search", () => {
  test("reports an invalid profile reference inline", async ({ page }) => {
    await page.goto("/");

    const input = page.getByLabel("Steam profile");

    await input.fill("not valid!");
    await input.press("Enter");

    await expect(page.locator("[data-slot=field-error]")).toBeVisible();
    await expect(page).toHaveURL("/");
  });

  test("reports an unknown profile and recovers once the input changes", async ({ page, steam }) => {
    await page.goto("/");

    const input = page.getByLabel("Steam profile");

    await input.fill("nobody");
    await input.press("Enter");

    await expect(page.getByText("No Steam profile matches that name or ID")).toBeVisible();
    expect(steam.calls.get("profile.resolve")).toBe(1);

    await input.fill("gaben");
    await expect(page.getByText("No Steam profile matches that name or ID")).toBeHidden();
  });

  test("finds a profile and lists its missing content @mobile", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Steam profile").fill("gaben");
    await page.getByRole("button", { name: /Find/ }).click();

    await expect(page).toHaveURL("/gaben");
    await expect(page.getByRole("heading", { level: 1, name: PROFILES.gaben.name })).toBeVisible();
    await waitForAnalysis(page);

    await expect(page.getByText("3", { exact: true }).first()).toBeVisible();
    await expect(missingCount(page)).toHaveText(String(EXPECTED_TOTAL));
    await expect(page.getByRole("button", { name: /^All/ })).toContainText(String(EXPECTED_TOTAL));
  });

  test("redirects a Steam ID to the profile's custom URL", async ({ page }) => {
    await page.goto(`/${PROFILES.gaben.steamId}`);

    await expect(page).toHaveURL("/gaben");
  });

  test("shows a not found page for an unknown profile URL", async ({ page }) => {
    await page.goto("/nobody");

    await expect(page.getByText("Profile not found")).toBeVisible();
    await page.getByRole("button", { name: "New search" }).click();
    await expect(page).toHaveURL("/");
  });

  test("explains a private library", async ({ page }) => {
    await page.goto("/hidden");

    await expect(page.getByText("This library is private")).toBeVisible();
  });

  test("serves revisits from the local cache", async ({ page, steam }) => {
    await page.goto("/gaben");
    await waitForAnalysis(page);
    // Let the throttled persister write the cache.
    await page.waitForTimeout(2500);

    const before = [...steam.calls.values()].reduce((sum, count) => sum + count, 0);

    await page.reload();
    await waitForAnalysis(page);

    const after = [...steam.calls.values()].reduce((sum, count) => sum + count, 0);

    expect(after - before).toBe(0);
    await expect(missingCount(page)).toHaveText(String(EXPECTED_TOTAL));
  });
});
