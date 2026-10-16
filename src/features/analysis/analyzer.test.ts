import type { TAnalysisSources } from "./types";

import type { TStoreItem } from "@/lib/steam";

import { describe, expect, it, vi } from "vitest";

import { LibraryAnalyzer } from "./analyzer";
import { makeStoreItem } from "./test-utils";



const CATALOG: ReadonlyArray<TStoreItem> = [
  makeStoreItem({ appid: 100, name: "Skyrim", franchises: ["The Elder Scrolls"], developers: ["Bethesda Game Studios"] }),
  makeStoreItem({ appid: 200, name: "Hollow Knight", developers: ["Team Cherry"] }),
  makeStoreItem({ appid: 101, name: "Skyrim Anniversary Upgrade", type: "dlc", parentAppid: 100 }),
  makeStoreItem({ appid: 102, name: "Skyrim Soundtrack", type: "music", parentAppid: 100 }),
  makeStoreItem({ appid: 103, name: "Oblivion", franchises: ["The Elder Scrolls"] }),
  makeStoreItem({ appid: 104, name: "Skyrim Special Edition", franchises: ["The Elder Scrolls"] }),
  makeStoreItem({ appid: 105, name: "Oblivion Shivering Isles", type: "dlc", parentAppid: 103 }),
  makeStoreItem({ appid: 201, name: "Hollow Knight OST", type: "music", parentAppid: 200 }),
  makeStoreItem({ appid: 202, name: "Silksong", developers: ["Team Cherry"] }),
  makeStoreItem({ appid: 203, name: "Delisted", developers: ["Team Cherry"], isPurchasable: false }),
];

const DLC_LISTS: Readonly<Record<number, Array<number>>> = { 100: [101, 102], 200: [201] };

const RELATED: Readonly<Record<string, Array<number>>> = {
  "The Elder Scrolls": [100, 103, 104, 105],
  "Team Cherry": [200, 201, 202, 203],
};

function makeSources(overrides: Partial<TAnalysisSources> = {}): TAnalysisSources {
  const byId = new Map(CATALOG.map(item => [item.appid, item]));

  return {
    items: vi.fn(async (appids: ReadonlyArray<number>) => appids.flatMap(appid => byId.get(appid) ?? [])),
    dlcBatch: vi.fn(async () => ({ 100: [101] })),
    dlc: vi.fn(async (appid: number) => DLC_LISTS[appid] ?? []),
    related: vi.fn(async (_kind: string, name: string) => RELATED[name] ?? []),
    ...overrides,
  };
}

const LIBRARY = [
  { appid: 100, name: "Skyrim", playtimeMinutes: 500, lastPlayed: null },
  { appid: 200, name: "Hollow Knight", playtimeMinutes: 50, lastPlayed: null },
];

describe("libraryAnalyzer", () => {
  it("finds and classifies missing content", async () => {
    const analyzer = new LibraryAnalyzer(makeSources());

    await analyzer.run(LIBRARY);

    const state = analyzer.store.state;
    const categories = Object.fromEntries([...state.items.values()].map(entry => [entry.item.appid, entry.category]));

    expect(state.phase).toBe("done");
    expect(state.done).toBe(state.total);
    expect(state.failed).toBe(0);
    expect(categories).toEqual({
      101: "dlc",
      102: "soundtrack",
      103: "franchise",
      104: "edition",
      201: "soundtrack",
      202: "studio",
    });
  });

  it("keeps going when some lookups fail", async () => {
    const analyzer = new LibraryAnalyzer(makeSources({
      related: vi.fn(async () => {
        throw new Error("rate limited");
      }),
    }));

    await analyzer.run(LIBRARY);

    const state = analyzer.store.state;

    expect(state.phase).toBe("done");
    expect(state.failed).toBeGreaterThan(0);
    expect([...state.items.keys()].sort()).toEqual([101, 102, 201]);
  });

  it("pauses on rate limits and retries the task", async () => {
    const rateLimited = new Error("rate limited");
    let calls = 0;
    const analyzer = new LibraryAnalyzer(makeSources({
      dlc: vi.fn(async (appid: number) => {
        calls++;

        if (appid === 100 && calls === 1) {
          throw rateLimited;
        }

        return DLC_LISTS[appid] ?? [];
      }),
    }), { isRateLimited: error => error === rateLimited, cooldown: 10 });

    const paused: Array<number | null> = [];

    analyzer.store.subscribe(state => paused.push(state.pausedUntil));
    await analyzer.run(LIBRARY);

    expect(paused.some(value => value !== null)).toBe(true);
    expect(analyzer.store.state.pausedUntil).toBeNull();
    expect(analyzer.store.state.failed).toBe(0);
    expect(analyzer.store.state.items.has(102)).toBe(true);
  });

  it("reports a failure to read the library", async () => {
    const analyzer = new LibraryAnalyzer(makeSources({
      items: vi.fn(async () => {
        throw new Error("Steam is down");
      }),
    }));

    await analyzer.run(LIBRARY);

    expect(analyzer.store.state).toMatchObject({ phase: "done", error: "Steam is down" });
  });

  it("discards the results of an aborted run", async () => {
    const analyzer = new LibraryAnalyzer(makeSources());
    const run = analyzer.run(LIBRARY);

    analyzer.abort();
    await run;

    expect(analyzer.store.state.items.size).toBe(0);
  });
});
