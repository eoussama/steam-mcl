import { describe, expect, it } from "vitest";

import { parseProfileInput, profileInputSchema } from "./profile-input";



describe("parseProfileInput", () => {
  it.each([
    ["76561197960287930", { kind: "id", steamId: "76561197960287930" }],
    ["  76561197960287930  ", { kind: "id", steamId: "76561197960287930" }],
    ["https://steamcommunity.com/profiles/76561197960287930", { kind: "id", steamId: "76561197960287930" }],
    ["steamcommunity.com/profiles/76561197960287930/games?tab=all", { kind: "id", steamId: "76561197960287930" }],
    ["https://steamcommunity.com/id/gabelogannewell/", { kind: "vanity", vanity: "gabelogannewell" }],
    ["http://www.steamcommunity.com/id/some_name-1", { kind: "vanity", vanity: "some_name-1" }],
    ["eoussama", { kind: "vanity", vanity: "eoussama" }],
  ])("parses %s", (input, expected) => {
    expect(parseProfileInput(input)).toEqual(expected);
  });

  it.each([
    "",
    "   ",
    "a",
    "has spaces",
    "semi;colon",
    "https://steamcommunity.com/profiles/123",
    "https://example.com/id/someone",
    "x".repeat(201),
  ])("rejects %j", (input) => {
    expect(parseProfileInput(input)).toBeNull();
  });

  it("treats a 17 digit number outside the Steam ID range as a vanity name", () => {
    expect(parseProfileInput("12345678901234567")).toEqual({ kind: "vanity", vanity: "12345678901234567" });
  });
});

describe("profileInputSchema", () => {
  it("accepts valid references and reports invalid ones", () => {
    expect(profileInputSchema.safeParse("eoussama").success).toBe(true);
    expect(profileInputSchema.safeParse("not valid!").success).toBe(false);
  });
});
