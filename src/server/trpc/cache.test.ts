import { describe, expect, it } from "vitest";

import { getCachePolicy } from "./cache";



describe("getCachePolicy", () => {
  it("lets the CDN share public store lookups", () => {
    expect(getCachePolicy(["store.dlc"], false)).toContain("s-maxage");
  });

  it("keeps profile data private", () => {
    expect(getCachePolicy(["profile.resolve"], false)).toMatch(/^private/);
    expect(getCachePolicy(["library.owned"], false)).toMatch(/^private/);
  });

  it("never caches failures, unknown paths or mixed batches", () => {
    expect(getCachePolicy(["store.dlc"], true)).toBe("no-store");
    expect(getCachePolicy(["admin.secret"], false)).toBe("no-store");
    expect(getCachePolicy(["store.dlc", "library.owned"], false)).toBe("no-store");
    expect(getCachePolicy(undefined, false)).toBe("no-store");
  });
});
