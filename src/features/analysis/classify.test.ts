import type { TClassifyContext } from "./classify";
import type { TCandidateRelations } from "./types";

import { describe, expect, it } from "vitest";

import { classifyCandidate } from "./classify";
import { makeStoreItem } from "./test-utils";



const SKYRIM = 489830;

function relations(partial: Partial<Record<keyof TCandidateRelations, Array<number>>>): TCandidateRelations {
  return {
    dlc: new Set(partial.dlc),
    franchise: new Set(partial.franchise),
    studio: new Set(partial.studio),
  };
}

function context(overrides: Partial<TClassifyContext> = {}): TClassifyContext {
  return {
    owned: new Set([SKYRIM]),
    ownedNames: new Map([[SKYRIM, "The Elder Scrolls V: Skyrim Special Edition"]]),
    relations: undefined,
    ...overrides,
  };
}

describe("classifyCandidate", () => {
  it("lists DLC and soundtracks of owned games", () => {
    const dlc = makeStoreItem({ appid: 1, type: "dlc", parentAppid: SKYRIM });
    const music = makeStoreItem({ appid: 2, type: "music", parentAppid: SKYRIM });

    expect(classifyCandidate(dlc, context())).toEqual({ item: dlc, category: "dlc", relatedTo: [SKYRIM] });
    expect(classifyCandidate(music, context())).toEqual({ item: music, category: "soundtrack", relatedTo: [SKYRIM] });
  });

  it("falls back to the DLC listing when the parent is unknown", () => {
    const dlc = makeStoreItem({ appid: 1, type: "dlc" });

    expect(classifyCandidate(dlc, context({ relations: relations({ dlc: [SKYRIM] }) }))?.relatedTo).toEqual([SKYRIM]);
  });

  it("ignores DLC of games that are not owned", () => {
    const dlc = makeStoreItem({ appid: 1, type: "dlc", parentAppid: 999 });

    expect(classifyCandidate(dlc, context({ relations: relations({ franchise: [SKYRIM] }) }))).toBeNull();
  });

  it("ignores owned, unlisted and unsupported items", () => {
    expect(classifyCandidate(makeStoreItem({ appid: SKYRIM }), context({ relations: relations({ franchise: [SKYRIM] }) }))).toBeNull();
    expect(classifyCandidate(makeStoreItem({ appid: 3, isPurchasable: false }), context({ relations: relations({ franchise: [SKYRIM] }) }))).toBeNull();
    expect(classifyCandidate(makeStoreItem({ appid: 4, type: "other" }), context({ relations: relations({ franchise: [SKYRIM] }) }))).toBeNull();
  });

  it("flags other editions of owned games", () => {
    const anniversary = makeStoreItem({ appid: 5, name: "The Elder Scrolls V: Skyrim Anniversary Edition" });
    const plain = makeStoreItem({ appid: 10, name: "The Elder Scrolls V: Skyrim" });
    const franchise = context({ relations: relations({ franchise: [SKYRIM] }) });

    expect(classifyCandidate(anniversary, franchise)?.category).toBe("edition");
    expect(classifyCandidate(plain, franchise)).toBeNull();
  });

  it("skips plain versions of games owned in a superset edition", () => {
    const base = makeStoreItem({ appid: 8, name: "Fallout 3" });
    const owned = context({
      owned: new Set([22370]),
      ownedNames: new Map([[22370, "Fallout 3 - Game of the Year Edition"]]),
      relations: relations({ franchise: [22370] }),
    });

    expect(classifyCandidate(base, owned)).toBeNull();
    expect(classifyCandidate(makeStoreItem({ appid: 9, name: "Fallout 3 Remastered" }), owned)?.category).toBe("edition");
  });

  it("prefers the franchise over the studio relation", () => {
    const game = makeStoreItem({ appid: 6, name: "The Elder Scrolls IV: Oblivion" });

    expect(classifyCandidate(game, context({ relations: relations({ franchise: [SKYRIM], studio: [SKYRIM] }) }))?.category).toBe("franchise");
    expect(classifyCandidate(game, context({ relations: relations({ studio: [SKYRIM] }) }))?.category).toBe("studio");
  });

  it("ignores games with no relation to the library", () => {
    expect(classifyCandidate(makeStoreItem({ appid: 7 }), context())).toBeNull();
  });
});

describe("classifyCandidate edge cases", () => {
  it("skips add-ons of games that are not owned", () => {
    expect(classifyCandidate(makeStoreItem({ appid: 1, type: "dlc", parentAppid: 999 }), context())).toBeNull();
  });

  it("lists the plain game when one owned version is not a superset", () => {
    const plain = makeStoreItem({ appid: 3, name: "Fallout 3" });
    const owners = new Map([[10, "Fallout 3: Game of the Year Edition"], [11, "Fallout 3 HD"]]);

    expect(classifyCandidate(plain, context({ owned: new Set([10, 11]), ownedNames: owners, relations: relations({ franchise: [10, 11] }) })))
      .toMatchObject({ category: "edition", relatedTo: [10, 11] });
  });

  it.each(["episode", "software"] as const)("treats %s apps like games", (type) => {
    const app = makeStoreItem({ appid: 4, name: "Something else", type });

    expect(classifyCandidate(app, context({ relations: relations({ franchise: [SKYRIM] }) }))).toMatchObject({ category: "franchise" });
  });
});

describe("classifyCandidate fallbacks", () => {
  it("lists a game found only in a DLC list as DLC", () => {
    const pack = makeStoreItem({ appid: 5, name: "Season Pass", type: "game" });

    expect(classifyCandidate(pack, context({ relations: relations({ dlc: [SKYRIM] }) }))).toMatchObject({ category: "dlc", relatedTo: [SKYRIM] });
  });
});
