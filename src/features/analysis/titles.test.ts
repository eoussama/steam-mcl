import { describe, expect, it } from "vitest";

import { isEditionTitle, isSameTitle, isSupersetEditionTitle, normalizeTitle } from "./titles";



describe("normalizeTitle", () => {
  it("drops marks, punctuation and edition qualifiers", () => {
    expect(normalizeTitle("The Witcher® 3: Wild Hunt — Game of the Year Edition")).toBe("the witcher 3 wild hunt");
    expect(normalizeTitle("Pokémon™ & Friends")).toBe("pokemon and friends");
    expect(normalizeTitle("Assassin's Creed")).toBe("assassins creed");
  });
});

describe("isSameTitle", () => {
  it.each([
    ["The Elder Scrolls V: Skyrim", "The Elder Scrolls V: Skyrim Special Edition"],
    ["The Witcher 3: Wild Hunt", "The Witcher 3: Wild Hunt — Remastered"],
    ["Grand Theft Auto V Legacy", "Grand Theft Auto V Enhanced"],
    ["Dark Souls", "DARK SOULS™: REMASTERED"],
    ["Grand Theft Auto: San Andreas", "Grand Theft Auto: San Andreas - The Definitive Edition"],
  ])("matches %s and %s", (a, b) => {
    expect(isSameTitle(a, b)).toBe(true);
  });

  it.each([
    ["Civilization V", "Civilization VI"],
    ["Portal", "Portal 2"],
    ["The Elder Scrolls V: Skyrim", "The Elder Scrolls V: Skyrim VR"],
    ["Edition", "Deluxe"],
  ])("does not match %s and %s", (a, b) => {
    expect(isSameTitle(a, b)).toBe(false);
  });
});

describe("isEditionTitle", () => {
  it("detects edition qualifiers", () => {
    expect(isEditionTitle("Fallout 3 - Game of the Year Edition")).toBe(true);
    expect(isEditionTitle("Yakuza Kiwami (Legacy)")).toBe(true);
    expect(isEditionTitle("Fallout 3")).toBe(false);
  });
});

describe("isSupersetEditionTitle", () => {
  it("detects editions that include the plain game", () => {
    expect(isSupersetEditionTitle("Fallout 3 - Game of the Year Edition")).toBe(true);
    expect(isSupersetEditionTitle("The Witcher 3: Wild Hunt - Complete Edition")).toBe(true);
    expect(isSupersetEditionTitle("Yakuza Kiwami (Legacy)")).toBe(false);
    expect(isSupersetEditionTitle("Fallout 3")).toBe(false);
  });
});
