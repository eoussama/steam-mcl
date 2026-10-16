import type { TResultsSearch } from "./search-params";

import type { TMissingItem } from "@/features/analysis";

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
  const statusOf = (appid: number) => (appid === 12 ? "owned" : appid === 13 ? "hidden" : "missing");

  it("lists each item under the view matching its status", () => {
    expect(appids(selectResults(ITEMS, GAMES, search(), statusOf))).toEqual([11, 10]);
    expect(appids(selectResults(ITEMS, GAMES, search({ view: "owned" }), statusOf))).toEqual([12]);
    expect(appids(selectResults(ITEMS, GAMES, search({ view: "hidden" }), statusOf))).toEqual([13]);
  });

  it("counts every status, and categories in the current view only", () => {
    const selection = selectResults(ITEMS, GAMES, search(), statusOf);

    expect(selection.views).toEqual({ missing: 2, owned: 1, hidden: 1 });
    expect(selection.counts.all).toBe(2);
  });
});
