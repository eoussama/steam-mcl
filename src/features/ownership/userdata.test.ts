import { describe, expect, it } from "vitest";

import { parseUserData, UserDataError } from "./userdata";



const PAGE = JSON.stringify({
  rgWishlist: [400],
  rgOwnedPackages: [1, 2],
  rgOwnedApps: [220, 10, 220, 2_028_850],
  rgIgnoredApps: { 730: 0, 570: 0 },
  rgRecommendedTags: [],
});

describe("parseUserData", () => {
  it("reads owned and ignored apps, sorted and unique", () => {
    expect(parseUserData(PAGE)).toEqual({ owned: [10, 220, 2_028_850], ignored: [570, 730] });
  });

  it("ignores text browsers add around raw JSON", () => {
    expect(parseUserData(`Pretty-print\n${PAGE}\n`).owned).toHaveLength(3);
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
