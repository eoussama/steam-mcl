import { describe, expect, it } from "vitest";

import { parseUserData, UserDataError } from "./userdata";



const PAGE = JSON.stringify({
  rgWishlist: [400, 300, 400],
  rgOwnedPackages: [1, 2],
  rgOwnedApps: [220, 10, 220, 2_028_850],
  rgIgnoredApps: { 730: 0, 570: 0 },
  rgRecommendedTags: [],
});

describe("parseUserData", () => {
  it("reads owned and ignored apps, sorted and unique", () => {
    expect(parseUserData(PAGE)).toEqual({ owned: [10, 220, 2_028_850], ignored: [570, 730], wishlist: [300, 400] });
  });

  it("ignores text browsers add around raw JSON", () => {
    expect(parseUserData(`Pretty-print\n${PAGE}\n`).owned).toHaveLength(3);
  });

  it("reads wishlist entries sent as objects", () => {
    expect(parseUserData(JSON.stringify({ rgOwnedApps: [10], rgWishlist: [{ appid: 7, priority: 1 }, 5] })).wishlist).toEqual([5, 7]);
  });

  it("treats a missing wishlist as empty", () => {
    expect(parseUserData(JSON.stringify({ rgOwnedApps: [10] })).wishlist).toEqual([]);
  });

  it("accepts an empty ignored list sent as an array", () => {
    expect(parseUserData(JSON.stringify({ rgOwnedApps: [10], rgIgnoredApps: [] })).ignored).toEqual([]);
  });

  it("reports a signed out page", () => {
    expect(() => parseUserData(JSON.stringify({ rgOwnedApps: [], rgIgnoredApps: [] }))).toThrow(/signed out/);
  });

  it.each([
    ["plain text", "hello"],
    ["truncated JSON", "{\"rgOwnedApps\": [10, 20"],
    ["another JSON document", JSON.stringify({ apps: [10] })],
    ["invalid app ids", JSON.stringify({ rgOwnedApps: ["10", -1] })],
  ])("rejects %s", (_, text) => {
    expect(() => parseUserData(text)).toThrow(UserDataError);
  });
});

describe("parseUserData limits", () => {
  it("accepts a page up to five million characters", () => {
    const page = JSON.stringify({ rgOwnedApps: [10] });

    expect(parseUserData(page.padEnd(5_000_000, " ")).owned).toEqual([10]);
    expect(() => parseUserData(page.padEnd(5_000_001, " "))).toThrow("far too long");
  });

  it("explains each kind of bad paste", () => {
    expect(() => parseUserData("} nothing {")).toThrow("does not look like the userdata page");
    expect(() => parseUserData("{\"rgOwnedApps\": [10,}")).toThrow("Part of the page is missing");
    expect(() => parseUserData(JSON.stringify({ apps: [10] }))).toThrow("does not look like the userdata page");
  });

  it.each(["12a", "a12"])("rejects ignored app ids such as %s", (key) => {
    expect(() => parseUserData(JSON.stringify({ rgOwnedApps: [10], rgIgnoredApps: { [key]: 0 } }))).toThrow(UserDataError);
  });
});

describe("userDataError", () => {
  it("is named after its kind", () => {
    expect(() => parseUserData("hello")).toThrow(expect.objectContaining({ name: "UserDataError" }));
  });
});
