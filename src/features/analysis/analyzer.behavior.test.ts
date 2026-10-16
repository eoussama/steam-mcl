import type { TAnalysisSources, TAnalysisState } from "./types";

import type { TOwnedGame, TStoreItem } from "@/lib/steam";

import { deferred } from "@eoussama/core";
import { describe, expect, it, vi } from "vitest";

import { INITIAL_ANALYSIS_STATE, LibraryAnalyzer } from "./analyzer";
import { makeStoreItem } from "./test-utils";



type TCall = [kind: "items" | "dlcBatch" | "dlc" | "related", ...args: Array<unknown>];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function game(appid: number, playtimeMinutes: number, name = `Game ${appid}`): TOwnedGame {
  return { appid, name, playtimeMinutes, lastPlayed: null };
}

/**
 * @description
 * Sources answering from a catalog, logging every call in order.
 *
 * @param catalog - Known store items.
 * @param overrides - Sources to replace.
 * @param overrides.dlc - DLC lists per base game, or a source.
 * @param overrides.related - Related app lists per franchise or studio name, or a source.
 * @returns The sources and their call log.
 */
function makeSources(
  catalog: ReadonlyArray<TStoreItem>,
  { dlc = {}, related = {}, ...overrides }: Partial<Omit<TAnalysisSources, "dlc" | "related">> & {
    dlc?: Record<number, Array<number>> | TAnalysisSources["dlc"];
    related?: Record<string, Array<number>> | TAnalysisSources["related"];
  } = {},
) {
  const byId = new Map(catalog.map(item => [item.appid, item]));
  const calls: Array<TCall> = [];

  const sources: TAnalysisSources = {
    items: async (appids) => {
      calls.push(["items", [...appids]]);

      return appids.flatMap(appid => byId.get(appid) ?? []);
    },
    dlcBatch: async (appids) => {
      calls.push(["dlcBatch", [...appids]]);

      return {};
    },
    dlc: async (appid) => {
      calls.push(["dlc", appid]);

      return typeof dlc === "function" ? dlc(appid) : dlc[appid] ?? [];
    },
    related: async (kind, name) => {
      calls.push(["related", kind, name]);

      return typeof related === "function" ? related(kind, name) : related[name] ?? [];
    },
    ...overrides,
  };

  return { sources, calls, of: (kind: TCall[0]) => calls.filter(call => call[0] === kind).map(call => call.slice(1)) };
}

function record(analyzer: LibraryAnalyzer): Array<TAnalysisState> {
  const states: Array<TAnalysisState> = [];

  analyzer.store.subscribe(() => states.push(analyzer.store.state));

  return states;
}

describe("libraryAnalyzer planning", () => {
  it("starts idle", () => {
    const { sources } = makeSources([]);

    expect(new LibraryAnalyzer(sources).store.state).toEqual({
      phase: "idle",
      done: 0,
      total: 0,
      failed: 0,
      pausedUntil: null,
      items: new Map(),
      error: null,
    });
    expect(INITIAL_ANALYSIS_STATE.phase).toBe("idle");
  });

  it("checks paid DLC in batches of 50 games, most played first, before anything else", async () => {
    const games = Array.from({ length: 120 }, (_, index) => game(1000 + index, index));
    const { sources, calls, of } = makeSources(games.map(entry => makeStoreItem({ appid: entry.appid, name: entry.name })));

    await new LibraryAnalyzer(sources).run(games);

    const batches = of("dlcBatch").map(([appids]) => appids as Array<number>);

    expect(batches.map(batch => batch.length)).toEqual([50, 50, 20]);
    expect(batches[0]).toEqual(games.slice(70).reverse().map(entry => entry.appid));
    expect(batches.flat().sort()).toEqual(games.map(entry => entry.appid).sort());
    expect(calls.findIndex(call => call[0] === "dlc")).toBeGreaterThan(calls.findLastIndex(call => call[0] === "dlcBatch"));
  });

  it("checks the full DLC list of each game, most played first", async () => {
    const games = [game(1, 10), game(2, 300), game(3, 0), game(4, 50)];
    const { sources, of } = makeSources(games.map(entry => makeStoreItem({ appid: entry.appid, name: entry.name })));

    await new LibraryAnalyzer(sources).run(games);

    expect(of("dlc").map(([appid]) => appid)).toEqual([2, 4, 1, 3]);
  });

  it("orders lookups of every kind by playtime", async () => {
    const games = [game(1, 5000), game(2, 0)];
    const { sources, calls } = makeSources([
      makeStoreItem({ appid: 1, name: "Played" }),
      makeStoreItem({ appid: 2, name: "Unplayed", franchises: ["Unplayed Saga"] }),
    ]);

    await new LibraryAnalyzer(sources).run(games);

    const order = calls.filter(call => call[0] !== "items").map(call => call.slice(0, 2).join(":"));

    expect(order).toEqual(["dlcBatch:1,2", "dlc:1", "related:franchise", "dlc:2"]);
  });

  it("only scans base games, and still scans games the store does not know", async () => {
    const games = [game(1, 10), game(2, 10), game(3, 10), game(4, 10)];
    const { sources, of } = makeSources([
      makeStoreItem({ appid: 1, name: "Base game" }),
      makeStoreItem({ appid: 2, name: "Owned DLC", type: "dlc", parentAppid: 1 }),
      makeStoreItem({ appid: 3, name: "Owned soundtrack", type: "music", parentAppid: 1 }),
    ]);

    await new LibraryAnalyzer(sources).run(games);

    expect(of("dlc").map(([appid]) => appid).sort()).toEqual([1, 4]);
    expect(of("related")).toEqual([]);
  });

  it("searches the 200 most played franchises and the 30 most played studios", async () => {
    const games = Array.from({ length: 250 }, (_, index) => game(1000 + index, index + 1));
    const { sources, of } = makeSources(games.map(entry => makeStoreItem({
      appid: entry.appid,
      name: entry.name,
      franchises: [`Franchise ${entry.appid}`],
      developers: [`Studio ${entry.appid}`],
    })));

    await new LibraryAnalyzer(sources).run(games);

    const franchises = of("related").filter(([kind]) => kind === "franchise").map(([, name]) => name);
    const studios = of("related").filter(([kind]) => kind === "developer").map(([, name]) => name);

    expect(franchises).toHaveLength(200);
    expect(franchises).toContain("Franchise 1249");
    expect(franchises).not.toContain("Franchise 1000");
    expect(studios).toHaveLength(30);
    expect(studios).toContain("Studio 1249");
    expect(studios).not.toContain("Studio 1219");
  });

  it("weighs a studio by every game of it, even unplayed ones", async () => {
    const solo = Array.from({ length: 30 }, (_, index) => game(1000 + index, 1));
    const trio = [game(2000, 0), game(2001, 0), game(2002, 0)];
    const games = [...solo, ...trio];
    const { sources, of } = makeSources(games.map(entry => makeStoreItem({
      appid: entry.appid,
      name: entry.name,
      developers: [entry.appid >= 2000 ? "Trio Studio" : `Studio ${entry.appid}`],
    })));

    await new LibraryAnalyzer(sources).run(games);

    expect(of("related").map(([, name]) => name)).toContain("Trio Studio");
  });
});

describe("libraryAnalyzer candidates", () => {
  const owned = [game(100, 100, "Skyrim")];
  const catalog = [
    makeStoreItem({ appid: 100, name: "Skyrim", developers: ["Bethesda"] }),
    makeStoreItem({ appid: 101, name: "Dawnguard", type: "dlc" }),
    makeStoreItem({ appid: 102, name: "Hearthfire", type: "dlc" }),
    makeStoreItem({ appid: 103, name: "Fallout 4", developers: ["Bethesda"] }),
  ];

  it("relates DLC found in batches to their base game", async () => {
    const { sources } = makeSources(catalog, { dlcBatch: async () => ({ 100: [101] }) });
    const analyzer = new LibraryAnalyzer(sources);

    await analyzer.run(owned);

    expect(analyzer.store.state.items.get(101)).toMatchObject({ category: "dlc", relatedTo: [100] });
  });

  it("relates DLC from full lists to their base game", async () => {
    const { sources } = makeSources(catalog, { dlc: { 100: [102] } });
    const analyzer = new LibraryAnalyzer(sources);

    await analyzer.run(owned);

    expect(analyzer.store.state.items.get(102)).toMatchObject({ category: "dlc", relatedTo: [100] });
  });

  it("relates studio picks to the games of that studio", async () => {
    const { sources } = makeSources(catalog, { related: { Bethesda: [100, 103] } });
    const analyzer = new LibraryAnalyzer(sources);

    await analyzer.run(owned);

    expect([...analyzer.store.state.items.values()]).toEqual([expect.objectContaining({ category: "studio", relatedTo: [100] })]);
  });

  it("requests each candidate once and never owned apps", async () => {
    const { sources, of } = makeSources(catalog, {
      dlcBatch: async () => ({ 100: [101, 102] }),
      dlc: { 100: [101, 102] },
      related: { Bethesda: [100, 101, 103] },
    });

    await new LibraryAnalyzer(sources).run(owned);

    const requested = of("items").slice(1).flatMap(([appids]) => appids as Array<number>);

    expect(requested.sort()).toEqual([101, 102, 103]);
  });

  it("requests candidates again after a failed lookup", async () => {
    let failures = 1;
    const failed = deferred<void>();
    const { sources } = makeSources(catalog, {
      dlcBatch: async () => ({ 100: [101] }),
      related: async () => {
        await failed.promise;

        return [101];
      },
    });
    const items = sources.items;
    const analyzer = new LibraryAnalyzer({
      ...sources,
      items: async (appids) => {
        if (appids.includes(101) && failures-- > 0) {
          setTimeout(() => failed.resolve(), 0);

          throw new Error("Steam is down");
        }

        return items(appids);
      },
    });

    await analyzer.run(owned);

    expect(analyzer.store.state.items.has(101)).toBe(true);
    expect(analyzer.store.state.failed).toBe(1);
  });

  it("drops an item once a later relation shows it is superseded", async () => {
    const hydrated = deferred<void>();
    const games = [game(10, 0, "Fallout 3 GOTY Edition"), game(20, 100, "Fallout New Vegas")];
    const { sources } = makeSources([
      makeStoreItem({ appid: 10, name: "Fallout 3 GOTY Edition", developers: ["Bethesda"] }),
      makeStoreItem({ appid: 20, name: "Fallout New Vegas", franchises: ["Fallout"] }),
      makeStoreItem({ appid: 30, name: "Fallout 3" }),
    ]);
    const items = sources.items;
    const analyzer = new LibraryAnalyzer({
      ...sources,
      items: async (appids) => {
        const found = await items(appids);

        if (appids.includes(30)) {
          // After a publish, so the item shows before it is dropped.
          setTimeout(() => hydrated.resolve(), 200);
        }

        return found;
      },
      related: async (kind) => {
        if (kind === "developer") {
          await hydrated.promise;
        }

        return [30];
      },
    });
    const states = record(analyzer);

    await analyzer.run(games);

    expect(states.some(state => state.items.get(30)?.category === "franchise")).toBe(true);
    expect(analyzer.store.state.items.has(30)).toBe(false);
  });
});

/**
 * @description
 * Gives Skyrim a franchise, so a slow franchise search keeps the scan going.
 *
 * @param items - Items source to wrap.
 * @returns The wrapped source.
 */
function withFranchise(items: TAnalysisSources["items"]): TAnalysisSources["items"] {
  return async appids => (await items(appids)).map(item => (item.appid === 100 ? { ...item, franchises: ["The Elder Scrolls"] } : item));
}

describe("libraryAnalyzer progress", () => {
  const owned = [game(100, 100, "Skyrim")];
  const catalog = [makeStoreItem({ appid: 100, name: "Skyrim" }), makeStoreItem({ appid: 101, name: "Dawnguard", type: "dlc", parentAppid: 100 })];

  it("reads the library, scans, then finishes", async () => {
    const { sources } = makeSources(catalog, { dlc: { 100: [101] } });
    const analyzer = new LibraryAnalyzer(sources);
    const states = record(analyzer);

    await analyzer.run(owned);

    expect(states[0]).toMatchObject({ phase: "library", done: 0, total: 0 });
    expect(states.find(state => state.phase === "scanning")).toMatchObject({ total: 2 });
    expect(analyzer.store.state).toMatchObject({ phase: "done", done: 2, total: 2, failed: 0 });
  });

  it("finishes straight away for an empty library", async () => {
    const { sources, of } = makeSources([]);
    const analyzer = new LibraryAnalyzer(sources);

    await analyzer.run([]);

    expect(analyzer.store.state).toMatchObject({ phase: "done", total: 0 });
    expect(of("dlc")).toEqual([]);
  });

  it("publishes results while the scan is still running", async () => {
    const slow = deferred<Array<number>>();
    const { sources } = makeSources(catalog, { dlc: { 100: [101] } });
    const analyzer = new LibraryAnalyzer({ ...sources, items: withFranchise(sources.items), related: () => slow.promise });
    const run = analyzer.run(owned);

    await sleep(400);

    expect(analyzer.store.state.phase).toBe("scanning");
    expect(analyzer.store.state.items.has(101)).toBe(true);

    slow.resolve([]);
    await run;
  });

  it("counts failed lookups", async () => {
    const { sources } = makeSources(catalog, {
      dlc: async () => {
        throw new Error("Steam is down");
      },
    });
    const analyzer = new LibraryAnalyzer(sources);

    await analyzer.run(owned);

    expect(analyzer.store.state).toMatchObject({ phase: "done", done: 2, failed: 1 });
  });
});

describe("libraryAnalyzer rate limits", () => {
  const owned = [game(100, 100, "Skyrim")];
  const catalog = [makeStoreItem({ appid: 100, name: "Skyrim" })];
  const rateLimited = new Error("rate limited");
  const isRateLimited = (error: unknown) => error === rateLimited;

  it("gives up on a lookup after five rate limits", async () => {
    const dlc = vi.fn(async () => {
      throw rateLimited;
    });
    const { sources } = makeSources(catalog, { dlc });
    const analyzer = new LibraryAnalyzer(sources, { isRateLimited, cooldown: 1 });

    await analyzer.run(owned);

    expect(dlc).toHaveBeenCalledTimes(5);
    expect(analyzer.store.state.failed).toBe(1);
  });

  it("doubles the pause on each rate limit, up to the cap", async () => {
    let limits = 4;
    const { sources } = makeSources(catalog, {
      dlc: async () => {
        if (limits-- > 0) {
          throw rateLimited;
        }

        return [];
      },
    });
    const analyzer = new LibraryAnalyzer(sources, { isRateLimited, cooldown: 10, maxCooldown: 25 });
    const pauses: Array<number> = [];

    analyzer.store.subscribe(() => {
      const { pausedUntil } = analyzer.store.state;

      if (pausedUntil !== null && pausedUntil !== pauses.at(-1)) {
        pauses.push(pausedUntil);
      }
    });

    const started = Date.now();

    await analyzer.run(owned);

    const delays = pauses.map((until, index) => until - (index === 0 ? started : pauses[index - 1]!));

    expect(delays).toHaveLength(4);
    expect(delays[0]).toBeGreaterThanOrEqual(10);
    expect(delays[0]).toBeLessThan(20);
    expect(delays[1]).toBeGreaterThanOrEqual(20);
    expect(delays[2]).toBeGreaterThanOrEqual(25);
    expect(delays[3]).toBeGreaterThanOrEqual(25);
    expect(delays[3]).toBeLessThan(45);
    expect(analyzer.store.state).toMatchObject({ pausedUntil: null, failed: 0 });
  });

  it("does not treat errors as rate limits unless told how", async () => {
    const dlc = vi.fn(async () => {
      throw rateLimited;
    });
    const { sources } = makeSources(catalog, { dlc });
    const analyzer = new LibraryAnalyzer(sources);

    await analyzer.run(owned);

    expect(dlc).toHaveBeenCalledTimes(1);
    expect(analyzer.store.state.pausedUntil).toBeNull();
  });
});

describe("libraryAnalyzer cancellation", () => {
  const owned = [game(100, 100, "Skyrim")];
  const catalog = [makeStoreItem({ appid: 100, name: "Skyrim" }), makeStoreItem({ appid: 101, name: "Dawnguard", type: "dlc", parentAppid: 100 })];

  it("does not start lookups once aborted", async () => {
    const { sources, calls } = makeSources(catalog);
    const analyzer = new LibraryAnalyzer(sources);

    analyzer.store.subscribe(() => {
      if (analyzer.store.state.phase === "scanning") {
        queueMicrotask(() => analyzer.abort());
      }
    });

    await analyzer.run(owned);

    expect(calls.filter(call => call[0] !== "items")).toEqual([]);
  });

  it("ignores lookups that finish after an abort", async () => {
    const pending = deferred<Array<number>>();
    const { sources, of } = makeSources(catalog);
    const analyzer = new LibraryAnalyzer({ ...sources, dlc: () => pending.promise });
    const run = analyzer.run(owned);

    await sleep(50);
    analyzer.abort();

    const before = analyzer.store.state;

    pending.resolve([101]);
    await run;
    await sleep(250);

    expect(of("items")).toHaveLength(1);
    expect(analyzer.store.state).toBe(before);
  });

  it("stops publishing once aborted", async () => {
    const slow = deferred<Array<number>>();
    const { sources } = makeSources(catalog, { dlc: { 100: [101] } });
    const analyzer = new LibraryAnalyzer({ ...sources, items: withFranchise(sources.items), related: () => slow.promise });
    const run = analyzer.run(owned);

    await sleep(30);
    analyzer.abort();

    const before = analyzer.store.state;

    await sleep(250);
    slow.resolve([]);
    await run;

    expect(analyzer.store.state).toBe(before);
  });

  it("does not pause for a rate limit hit after an abort", async () => {
    const pending = deferred<never>();
    const rateLimited = new Error("rate limited");
    const { sources } = makeSources(catalog);
    const analyzer = new LibraryAnalyzer({ ...sources, dlc: () => pending.promise }, { isRateLimited: error => error === rateLimited });
    const run = analyzer.run(owned);

    await sleep(50);
    analyzer.abort();
    pending.reject(rateLimited);
    await run;
    await sleep(20);

    expect(analyzer.store.state.pausedUntil).toBeNull();
  });

  it("stays paused once aborted during a pause", async () => {
    let limits = 1;
    const rateLimited = new Error("rate limited");
    const dlc = vi.fn(async () => {
      if (limits-- > 0) {
        throw rateLimited;
      }

      return [];
    });
    const { sources } = makeSources(catalog, { dlc });
    const analyzer = new LibraryAnalyzer(sources, { isRateLimited: error => error === rateLimited, cooldown: 50 });
    const run = analyzer.run(owned);

    await sleep(20);
    analyzer.abort();
    await run;
    await sleep(100);

    expect(dlc).toHaveBeenCalledTimes(1);
  });

  it("replaces the results of a run that is still going", async () => {
    const first = deferred<Array<number>>();
    const { sources } = makeSources([
      ...catalog,
      makeStoreItem({ appid: 200, name: "Hollow Knight", developers: ["Team Cherry"] }),
      makeStoreItem({ appid: 201, name: "Hollow Knight OST", type: "music", parentAppid: 200 }),
    ], { dlc: { 200: [201] } });
    const slowRelated = deferred<Array<number>>();
    const analyzer = new LibraryAnalyzer({
      ...sources,
      dlc: async appid => (appid === 100 ? first.promise : [201]),
      related: () => slowRelated.promise,
    });

    const firstRun = analyzer.run(owned);

    await sleep(30);

    const secondRun = analyzer.run([game(200, 10, "Hollow Knight")]);

    await sleep(30);
    first.resolve([101]);
    await firstRun;
    await sleep(200);

    expect(analyzer.store.state.phase).toBe("scanning");
    expect(analyzer.store.state.items.has(101)).toBe(false);

    slowRelated.resolve([]);
    await secondRun;

    expect([...analyzer.store.state.items.keys()]).toEqual([201]);
    expect(analyzer.store.state.done).toBe(analyzer.store.state.total);
  });
});

describe("libraryAnalyzer weighting and pauses", () => {
  it("prefers the studio of a much played game over one with more unplayed games", async () => {
    const regulars = Array.from({ length: 29 }, (_, index) => game(1000 + index, 500));
    const games = [game(2000, 1000), game(3000, 0), game(3001, 0), ...regulars];
    const { sources, of } = makeSources(games.map(entry => makeStoreItem({
      appid: entry.appid,
      name: entry.name,
      developers: [entry.appid >= 3000 ? "Twin Studio" : `Studio ${entry.appid}`],
    })));

    await new LibraryAnalyzer(sources).run(games);

    const studios = of("related").map(([, name]) => name);

    expect(studios).toContain("Studio 2000");
    expect(studios).not.toContain("Twin Studio");
  });

  it("pauses once when several lookups hit a rate limit together", async () => {
    const rateLimited = new Error("rate limited");
    const limited = new Set<number>();
    const games = [game(1, 40), game(2, 30), game(3, 20)];
    const { sources } = makeSources(games.map(entry => makeStoreItem({ appid: entry.appid, name: entry.name })), {
      dlc: async (appid) => {
        await sleep(5);

        if (!limited.has(appid)) {
          limited.add(appid);

          throw rateLimited;
        }

        return [];
      },
    });
    const analyzer = new LibraryAnalyzer(sources, { isRateLimited: error => error === rateLimited, cooldown: 30 });
    const pauses = new Set<number>();

    analyzer.store.subscribe(() => {
      const { pausedUntil } = analyzer.store.state;

      if (pausedUntil !== null) {
        pauses.add(pausedUntil);
      }
    });

    await analyzer.run(games);

    expect(pauses.size).toBe(1);
    expect(analyzer.store.state.failed).toBe(0);
  });

  it("shows what was found before a pause straight away", async () => {
    const rateLimited = new Error("rate limited");
    let limits = 1;
    const { sources } = makeSources([
      makeStoreItem({ appid: 100, name: "Skyrim" }),
      makeStoreItem({ appid: 101, name: "Dawnguard", type: "dlc", parentAppid: 100 }),
    ], {
      dlcBatch: async () => ({ 100: [101] }),
      dlc: async () => {
        if (limits-- > 0) {
          throw rateLimited;
        }

        return [];
      },
    });
    const analyzer = new LibraryAnalyzer(sources, { isRateLimited: error => error === rateLimited, cooldown: 30 });
    const atPause: Array<boolean> = [];

    analyzer.store.subscribe(() => {
      const { pausedUntil, items } = analyzer.store.state;

      if (pausedUntil !== null && atPause.length === 0) {
        atPause.push(items.has(101));
      }
    });

    await analyzer.run([game(100, 10, "Skyrim")]);

    expect(atPause).toEqual([true]);
  });
});
