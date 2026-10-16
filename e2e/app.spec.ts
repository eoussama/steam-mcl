import { expect, openProfile, test } from "./fixtures/steam";



test.describe("app shell", () => {
  test("loads without console errors or CSP violations", async ({ page }) => {
    const problems: Array<string> = [];

    page.on("console", message => message.type() === "error" && problems.push(message.text()));
    page.on("pageerror", error => problems.push(error.message));
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", event => console.error(`CSP ${event.violatedDirective}`));
    });

    await page.goto("/");
    await openProfile(page, "gaben");

    expect(problems).toEqual([]);
  });

  test("sends security headers", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();

    expect(headers["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
  });

  test("keeps the theme choice across reloads without a flash", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Change theme" }).click();
    await page.getByRole("menuitemradio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload({ waitUntil: "commit" });
    await page.waitForSelector("html.dark", { state: "attached" });
  });

  test("shows the GitHub link on profiles only", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Source code on GitHub" })).toHaveCount(0);

    await openProfile(page, "gaben");
    await expect(page.getByRole("link", { name: "Source code on GitHub" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Steam Missing Content Lookup/ })).toContainText("Steam");
  });

  test("focuses the search field after New search", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("Steam profile")).not.toBeFocused();

    await openProfile(page, "gaben");
    await page.getByRole("link", { name: "New search" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByLabel("Steam profile")).toBeFocused();
  });

  test("starts with a skip link", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  });
});
