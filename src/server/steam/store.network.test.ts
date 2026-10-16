import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { searchRelatedApps } from "./search";
import { getAppDlc, getDlcForApps, getStoreItems, toStoreItem } from "./store";



const HOUR = 60 * 60 * 1000;

let fetchMock: ReturnType<typeof vi.fn>;

function respond(body: unknown) {
  fetchMock.mockImplementation(async () => new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } }));
}

function requestedUrl(call = 0): URL {
  return new URL(String(fetchMock.mock.calls[call]?.[0]));
}

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/**
 * @description
 * Checks that a lookup is served from the cache for just under an hour, then fetched again.
 *
 * @param lookup - Lookup to repeat.
 * @returns A promise resolving once checked.
 */
async function expectCachedForAnHour(lookup: () => Promise<unknown>): Promise<void> {
  await lookup();
  await lookup();
  expect(fetchMock).toHaveBeenCalledTimes(1);

  vi.setSystemTime(Date.now() + HOUR - 60_000);
  await lookup();
  expect(fetchMock).toHaveBeenCalledTimes(1);

  vi.setSystemTime(Date.now() + 120_000);
  await lookup();
  expect(fetchMock).toHaveBeenCalledTimes(2);
}

describe("getStoreItems", () => {
  it("asks for basic info, related items, assets and release data of each app", async () => {
    respond({ response: { store_items: [{ appid: 10, success: 1, name: "Ten", type: 0 }, { appid: 11, success: 2 }] } });

    expect(await getStoreItems([10, 11])).toEqual([expect.objectContaining({ appid: 10, name: "Ten", type: "game" })]);

    const url = requestedUrl();

    expect(`${url.origin}${url.pathname}`).toBe("https://api.steampowered.com/IStoreBrowseService/GetItems/v1/");
    expect(JSON.parse(url.searchParams.get("input_json") ?? "")).toEqual({
      ids: [{ appid: 10 }, { appid: 11 }],
      context: { language: "english", country_code: "US" },
      data_request: { include_basic_info: true, include_related_items: true, include_assets: true, include_release: true },
    });
  });

  it("handles a response without items", async () => {
    respond({ response: {} });

    expect(await getStoreItems([12])).toEqual([]);
  });

  it("caches lookups for an hour", async () => {
    respond({ response: { store_items: [] } });

    await expectCachedForAnHour(() => getStoreItems([13]));
  });
});

describe("getAppDlc", () => {
  it("reads the DLC list from the app details", async () => {
    respond({ 20: { success: true, data: { dlc: [21, 22] } } });

    expect(await getAppDlc(20)).toEqual([21, 22]);

    const url = requestedUrl();

    expect(`${url.origin}${url.pathname}`).toBe("https://store.steampowered.com/api/appdetails");
    expect(Object.fromEntries(url.searchParams)).toEqual({ appids: "20", filters: "basic", cc: "US", l: "english" });
  });

  it("returns no DLC for unknown apps or apps without DLC", async () => {
    respond({ 23: { success: false } });
    expect(await getAppDlc(23)).toEqual([]);

    respond({ 24: { success: true, data: {} } });
    expect(await getAppDlc(24)).toEqual([]);

    respond({});
    expect(await getAppDlc(25)).toEqual([]);
  });

  it("caches lookups for an hour", async () => {
    respond({ 26: { success: true, data: { dlc: [] } } });

    await expectCachedForAnHour(() => getAppDlc(26));
  });
});

describe("getDlcForApps", () => {
  it("maps DLC lists by base game", async () => {
    respond({ response: { dlc_lists: [{ parent_appid: 30, dlc_appids: [31] }, { parent_appid: 32 }] } });

    expect(await getDlcForApps([30, 32])).toEqual({ 30: [31], 32: [] });

    const url = requestedUrl();

    expect(`${url.origin}${url.pathname}`).toBe("https://api.steampowered.com/IStoreBrowseService/GetDLCForAppsSolr/v1/");
    expect(JSON.parse(url.searchParams.get("input_json") ?? "")).toEqual({ appids: [30, 32], context: { language: "english", country_code: "US" } });
  });

  it("handles a response without lists", async () => {
    respond({ response: {} });

    expect(await getDlcForApps([33])).toEqual({});
  });

  it("caches lookups for an hour", async () => {
    respond({ response: { dlc_lists: [] } });

    await expectCachedForAnHour(() => getDlcForApps([34]));
  });
});

describe("searchRelatedApps", () => {
  it("searches the store by franchise, developer or publisher", async () => {
    respond({ results_html: `<a data-ds-appid="40"></a><a data-ds-appid="41"></a>` });

    expect(await searchRelatedApps("developer", "Team Cherry")).toEqual([40, 41]);

    const url = requestedUrl();

    expect(`${url.origin}${url.pathname}`).toBe("https://store.steampowered.com/search/results/");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      developer: "Team Cherry",
      infinite: "1",
      start: "0",
      count: "100",
      ignore_preferences: "1",
      cc: "US",
      l: "english",
    });
  });

  it("caches searches for an hour", async () => {
    respond({ results_html: "" });

    await expectCachedForAnHour(() => searchRelatedApps("franchise", "Hollow Knight"));
  });
});

describe("toStoreItem types", () => {
  it.each([
    [0, "game"],
    [4, "dlc"],
    [6, "software"],
    [9, "episode"],
    [11, "music"],
  ])("maps type %i to %s", (type, expected) => {
    expect(toStoreItem({ appid: 1, success: 1, name: "A", type })?.type).toBe(expected);
  });

  it("maps a missing type to other", () => {
    expect(toStoreItem({ appid: 1, success: 1, name: "A" })?.type).toBe("other");
  });

  it("needs an app id and a name", () => {
    expect(toStoreItem({ success: 1, name: "A" })).toBeNull();
    expect(toStoreItem({ appid: 1, success: 1, name: "" })).toBeNull();
  });

  it("defaults missing details", () => {
    expect(toStoreItem({ appid: 1, success: 1, name: "A", basic_info: {} })).toMatchObject({
      franchises: [],
      developers: [],
      publishers: [],
      parentAppid: null,
      price: null,
      priceCents: null,
      discountPercent: 0,
      isFree: false,
      isComingSoon: false,
      releaseDate: null,
      isPurchasable: true,
    });
  });
});

describe("toStoreItem failures", () => {
  it("rejects a failed item even with an id and a name", () => {
    expect(toStoreItem({ appid: 1, success: 2, name: "A" })).toBeNull();
  });
});
