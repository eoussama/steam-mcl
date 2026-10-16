import type { TResultsSearch } from "./search-params";
import type { TMissingItem } from "@/features/analysis";

import type { TOwnershipStatus } from "@/features/ownership";

import { describe, expect, it } from "vitest";

import { makeStoreItem } from "@/features/analysis/test-utils";

import { RESULTS_SEARCH_DEFAULTS } from "./search-params";
import { selectResults } from "./select-results";



const GAMES = [
  { appid: 1, name: "Skyrim", playtimeMinutes: 900, lastPlayed: null },
  { appid: 2, name: "Hollow Knight", playtimeMinutes: 60, lastPlayed: null },
];

const ITEMS: Array<TMissingItem> = [
  { category: "dlc", relatedTo: [2], item: makeStoreItem({ appid: 10, name: "Godmaster", priceCents: 0, isFree: true }) },
  { category: "soundtrack", relatedTo: [1], item: makeStoreItem({ appid: 11, name: "Skyrim OST", priceCents: 1999, releaseDate: 100 }) },
  { category: "dlc", relatedTo: [1], item: makeStoreItem({ appid: 12, name: "Dawnguard", priceCents: 999, releaseDate: 300 }) },
  { category: "franchise", relatedTo: [1, 2], item: makeStoreItem({ appid: 13, name: "Oblivion", priceCents: null, price: null }) },
];

const search = (overrides: Partial<TResultsSearch> = {}): TResultsSearch => ({ ...RESULTS_SEARCH_DEFAULTS, ...overrides });

function appids(selection: ReturnType<typeof selectResults>) {
  return selection.rows.flatMap(row => (row.kind === "item" ? [row.entry.item.appid] : []));
}

describe("selectResults", () => {
  it("orders by the playtime of the related game by default", () => {
    expect(appids(selectResults(ITEMS, GAMES, search()))).toEqual([12, 11, 13, 10]);
  });

  it("counts every category but only lists the selected one", () => {
    const selection = selectResults(ITEMS, GAMES, search({ category: "dlc" }));

    expect(selection.counts).toMatchObject({ all: 4, dlc: 2, soundtrack: 1, franchise: 1, edition: 0 });
    expect(appids(selection)).toEqual([12, 10]);
    expect(selection.matched).toBe(2);
  });

  it("filters by name and updates the counts", () => {
    const selection = selectResults(ITEMS, GAMES, search({ q: "SKY" }));

    expect(appids(selection)).toEqual([11]);
    expect(selection.counts.all).toBe(1);
  });

  it("sorts by price, free first and unpriced last", () => {
    expect(appids(selectResults(ITEMS, GAMES, search({ sort: "price-asc" })))).toEqual([10, 12, 11, 13]);
    expect(appids(selectResults(ITEMS, GAMES, search({ sort: "price-desc" })))).toEqual([11, 12, 10, 13]);
  });

  it("sorts by release date", () => {
    expect(appids(selectResults(ITEMS, GAMES, search({ sort: "release" })))).toEqual([12, 11, 10, 13]);
  });

  it("groups items under their most played related game", () => {
    const rows = selectResults(ITEMS, GAMES, search({ group: true })).rows;

    expect(rows.map(row => (row.kind === "group" ? `#${row.name}:${row.count}` : row.entry.item.appid))).toEqual([
      "#Skyrim:3",
      12,
      11,
      13,
      "#Hollow Knight:1",
      10,
    ]);
  });

  it("describes items with the related games' names", () => {
    const row = selectResults(ITEMS, GAMES, search()).rows.find(entry => entry.kind === "item" && entry.entry.item.appid === 13);

    expect(row?.kind === "item" && row.description).toBe("Same franchise as Skyrim, Hollow Knight");
  });
});

describe("selectResults relevance", () => {
  it("ranks add-ons of a played game above studio picks of a slightly more played one", () => {
    const games = [
      { appid: 1, name: "Grand Theft Auto V", playtimeMinutes: 1000, lastPlayed: null },
      { appid: 2, name: "Hades", playtimeMinutes: 800, lastPlayed: null },
    ];
    const items: Array<TMissingItem> = [
      { category: "studio", relatedTo: [1], item: makeStoreItem({ appid: 20, name: "Red Dead Redemption 2" }) },
      { category: "soundtrack", relatedTo: [2], item: makeStoreItem({ appid: 21, name: "Hades OST" }) },
    ];

    expect(appids(selectResults(items, games, search()))).toEqual([21, 20]);
  });

  it("names each related game once across its editions", () => {
    const games = [
      { appid: 1, name: "Grand Theft Auto: San Andreas", playtimeMinutes: 10, lastPlayed: null },
      { appid: 2, name: "Grand Theft Auto: San Andreas - The Definitive Edition", playtimeMinutes: 5, lastPlayed: null },
    ];
    const items: Array<TMissingItem> = [
      { category: "studio", relatedTo: [1, 2], item: makeStoreItem({ appid: 30, name: "L.A. Noire" }) },
    ];
    const row = selectResults(items, games, search()).rows[0];

    expect(row?.kind === "item" && row.description).toBe("From the studio behind Grand Theft Auto: San Andreas");
  });
});

describe("selectResults ownership", () => {
  const ownership = {
    statusOf: (appid: number): TOwnershipStatus => (appid === 12 ? "owned" : appid === 13 ? "hidden" : "missing"),
    isWishlisted: (appid: number) => appid === 11 || appid === 13,
  };

  it("lists each item under the view matching its status", () => {
    expect(appids(selectResults(ITEMS, GAMES, search(), ownership))).toEqual([11, 10]);
    expect(appids(selectResults(ITEMS, GAMES, search({ view: "owned" }), ownership))).toEqual([12]);
    expect(appids(selectResults(ITEMS, GAMES, search({ view: "hidden" }), ownership))).toEqual([13]);
  });

  it("counts every status, and categories in the current view only", () => {
    const selection = selectResults(ITEMS, GAMES, search(), ownership);

    expect(selection.views).toEqual({ missing: 2, owned: 1, hidden: 1 });
    expect(selection.counts.all).toBe(2);
  });

  it("narrows to wishlisted items of the current view and flags them", () => {
    const selection = selectResults(ITEMS, GAMES, search({ wishlist: true }), ownership);

    expect(appids(selection)).toEqual([11]);
    expect(selection.wishlisted).toBe(1);
    expect(selection.counts.all).toBe(1);
    expect(selection.rows[0]).toMatchObject({ kind: "item", isWishlisted: true });
  });

  it("counts wishlisted items without filtering when the filter is off", () => {
    const selection = selectResults(ITEMS, GAMES, search(), ownership);

    expect(selection.wishlisted).toBe(1);
    expect(selection.rows.filter(row => row.kind === "item" && row.isWishlisted)).toHaveLength(1);
  });
});

describe("selectResults edge cases", () => {
  const games = [
    { appid: 1, name: "Beta", playtimeMinutes: 100, lastPlayed: null },
    { appid: 2, name: "Alpha", playtimeMinutes: 100, lastPlayed: null },
    { appid: 3, name: "Gamma", playtimeMinutes: 5, lastPlayed: null },
  ];

  it("sorts free items first even with a list price", () => {
    const items: Array<TMissingItem> = [
      { category: "dlc", relatedTo: [1], item: makeStoreItem({ appid: 20, name: "Paid", priceCents: 100 }) },
      { category: "dlc", relatedTo: [1], item: makeStoreItem({ appid: 21, name: "Free weekend", priceCents: 500, isFree: true }) },
    ];

    expect(appids(selectResults(items, games, search({ sort: "price-asc" })))).toEqual([21, 20]);
  });

  it("puts items without a price last when sorting by highest price", () => {
    const items: Array<TMissingItem> = [
      { category: "dlc", relatedTo: [1], item: makeStoreItem({ appid: 22, name: "A", priceCents: null }) },
      { category: "dlc", relatedTo: [1], item: makeStoreItem({ appid: 23, name: "B", priceCents: 100 }) },
      { category: "dlc", relatedTo: [1], item: makeStoreItem({ appid: 24, name: "C", priceCents: null }) },
      { category: "dlc", relatedTo: [1], item: makeStoreItem({ appid: 25, name: "D", priceCents: 300 }) },
    ];

    expect(appids(selectResults(items, games, search({ sort: "price-desc" })))).toEqual([25, 23, 22, 24]);
  });

  it("sorts names naturally", () => {
    const items: Array<TMissingItem> = ["Game 10", "game 2", "Game 1"].map((name, index) => ({
      category: "franchise",
      relatedTo: [1],
      item: makeStoreItem({ appid: 30 + index, name }),
    }));

    expect(selectResults(items, games, search({ sort: "name" })).rows.map(row => (row.kind === "item" ? row.entry.item.name : ""))).toEqual(["Game 1", "game 2", "Game 10"]);
  });

  it("trims the name filter", () => {
    expect(appids(selectResults(ITEMS, GAMES, search({ q: "  dawn  " })))).toEqual([12]);
  });

  it("names up to two related games, then counts the rest", () => {
    const item: TMissingItem = { category: "franchise", relatedTo: [1, 2, 3], item: makeStoreItem({ appid: 40, name: "Delta" }) };
    const row = selectResults([item], games, search()).rows[0];

    expect(row).toMatchObject({ kind: "item", description: "Same franchise as Beta, Alpha and 1 more" });
  });

  it("groups under the first of equally played games, groups ordered by playtime then name", () => {
    const items: Array<TMissingItem> = [
      { category: "dlc", relatedTo: [3], item: makeStoreItem({ appid: 50, name: "Gamma DLC" }) },
      { category: "franchise", relatedTo: [1, 2], item: makeStoreItem({ appid: 51, name: "Shared" }) },
      { category: "dlc", relatedTo: [2], item: makeStoreItem({ appid: 52, name: "Alpha DLC" }) },
      { category: "studio", relatedTo: [999], item: makeStoreItem({ appid: 53, name: "Unknown owner" }) },
    ];
    const groups = selectResults(items, games, search({ group: true })).rows.flatMap(row => (row.kind === "group" ? [[row.key, row.name, row.count]] : []));

    expect(groups).toEqual([
      ["group-2", "Alpha", 1],
      ["group-1", "Beta", 1],
      ["group-3", "Gamma", 1],
      ["group-999", "Other games", 1],
    ]);
  });

  it("flags nothing as wishlisted without ownership data", () => {
    const selection = selectResults(ITEMS, GAMES, search());

    expect(selection.wishlisted).toBe(0);
    expect(selection.rows.every(row => row.kind !== "item" || row.isWishlisted === false)).toBe(true);
  });
});

describe("selectResults group order", () => {
  it("orders groups by playtime, then by name, with unknown games last", () => {
    const games = [
      { appid: 1, name: "Delta", playtimeMinutes: 10, lastPlayed: null },
      { appid: 2, name: "Charlie", playtimeMinutes: 700, lastPlayed: null },
      { appid: 3, name: "Bravo", playtimeMinutes: 10, lastPlayed: null },
      { appid: 4, name: "Alpha", playtimeMinutes: 300, lastPlayed: null },
    ];
    const items: Array<TMissingItem> = [1, 2, 3, 4, 998, 999].map(appid => ({
      category: "studio",
      relatedTo: [appid],
      item: makeStoreItem({ appid: 100 + appid, name: `Pick ${appid}` }),
    }));
    const order = selectResults(items, games, search({ group: true, sort: "name" })).rows.flatMap(row => (row.kind === "group" ? [row.appid] : []));

    expect(order).toEqual([2, 4, 3, 1, 998, 999]);
  });
});
