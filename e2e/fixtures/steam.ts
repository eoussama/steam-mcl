import type { Page, Route } from "@playwright/test";

import type { TLibrary, TSteamProfile, TStoreItem } from "../../src/lib/steam/types";

import { test as base } from "@playwright/test";



// Inputs are validated by the real API, the mock trusts what the app sends.
type TProcedureHandler = (input: never) => unknown;

/**
 * Error codes the API answers with, mirroring tRPC error shapes.
 */
const HTTP_STATUS = { NOT_FOUND: 404, FORBIDDEN: 403, TOO_MANY_REQUESTS: 429 } as const;

class ProcedureError extends Error {
  constructor(readonly code: keyof typeof HTTP_STATUS) {
    super(code);
  }
}

const AVATAR = `data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'><rect width='1' height='1' fill='#66c0f4'/></svg>")}`;

export const PROFILES = {
  gaben: { steamId: "76561197960287930", vanity: "gaben", name: "Gabe Newell", avatar: AVATAR, profileUrl: "https://steamcommunity.com/id/gaben/", isPublic: true },
  hidden: { steamId: "76561197960287931", vanity: "hidden", name: "Private Person", avatar: AVATAR, profileUrl: "https://steamcommunity.com/id/hidden/", isPublic: false },
} satisfies Record<string, TSteamProfile>;

const LIBRARIES: Record<string, TLibrary> = {
  [PROFILES.gaben.steamId]: {
    isPrivate: false,
    games: [
      { appid: 100, name: "Skyrim", playtimeMinutes: 5000, lastPlayed: null },
      { appid: 200, name: "Hollow Knight", playtimeMinutes: 1200, lastPlayed: null },
      { appid: 300, name: "Portal", playtimeMinutes: 300, lastPlayed: null },
    ],
  },
  [PROFILES.hidden.steamId]: { isPrivate: true, games: [] },
};

function item(appid: number, name: string, overrides: Partial<TStoreItem> = {}): TStoreItem {
  return {
    appid,
    name,
    type: "game",
    parentAppid: null,
    franchises: [],
    developers: [],
    publishers: [],
    headerImage: null,
    capsuleImage: null,
    price: null,
    priceCents: null,
    discountPercent: 0,
    isFree: false,
    isComingSoon: false,
    releaseDate: null,
    isPurchasable: true,
    ...overrides,
  };
}

const priced = (cents: number) => ({ price: `$${(cents / 100).toFixed(2)}`, priceCents: cents });

export const CATALOG: ReadonlyArray<TStoreItem> = [
  item(100, "Skyrim", { franchises: ["The Elder Scrolls"], developers: ["Bethesda Game Studios"] }),
  item(200, "Hollow Knight", { developers: ["Team Cherry"] }),
  item(300, "Portal", { franchises: ["Portal"], developers: ["Valve"] }),
  item(101, "Skyrim - Dawnguard", { type: "dlc", parentAppid: 100, ...priced(1999) }),
  item(102, "Skyrim - Hearthfire", { type: "dlc", parentAppid: 100, ...priced(499) }),
  item(103, "Skyrim Soundtrack", { type: "music", parentAppid: 100, ...priced(999) }),
  item(104, "The Elder Scrolls IV: Oblivion", { franchises: ["The Elder Scrolls"], developers: ["Bethesda Game Studios"], ...priced(1499) }),
  item(105, "Skyrim Special Edition", { franchises: ["The Elder Scrolls"], developers: ["Bethesda Game Studios"], ...priced(3999) }),
  item(201, "Hollow Knight OST", { type: "music", parentAppid: 200, ...priced(599) }),
  item(202, "Hollow Knight: Silksong", { developers: ["Team Cherry"], ...priced(1999) }),
  item(301, "Portal 2", { franchises: ["Portal"], developers: ["Valve"], ...priced(999) }),
];

/**
 * What the analysis should find for gaben, by category.
 */
export const EXPECTED = {
  dlc: ["Skyrim - Dawnguard", "Skyrim - Hearthfire"],
  soundtrack: ["Skyrim Soundtrack", "Hollow Knight OST"],
  edition: ["Skyrim Special Edition"],
  franchise: ["The Elder Scrolls IV: Oblivion", "Portal 2"],
  studio: ["Hollow Knight: Silksong"],
} as const;

export const EXPECTED_TOTAL = Object.values(EXPECTED).flat().length;

const DLC: Record<number, Array<number>> = { 100: [101, 102, 103], 200: [201], 300: [] };

const RELATED: Record<string, Array<number>> = {
  "The Elder Scrolls": [100, 104, 105],
  "Portal": [300, 301],
  "Bethesda Game Studios": [100, 104, 105],
  "Team Cherry": [200, 202],
  "Valve": [300, 301],
};

const catalog = new Map(CATALOG.map(entry => [entry.appid, entry]));

const PROCEDURES: Record<string, TProcedureHandler> = {
  "profile.resolve": ({ input }: { input: string }) => {
    const profile = Object.values(PROFILES).find(entry => entry.vanity === input || entry.steamId === input);

    if (!profile) {
      throw new ProcedureError("NOT_FOUND");
    }

    return profile;
  },
  "library.owned": ({ steamId }: { steamId: string }) => LIBRARIES[steamId] ?? { isPrivate: true, games: [] },
  "store.items": ({ appids }: { appids: Array<number> }) => appids.flatMap(appid => catalog.get(appid) ?? []),
  "store.dlcBatch": ({ appids }: { appids: Array<number> }) =>
    Object.fromEntries(appids.map(appid => [appid, (DLC[appid] ?? []).filter(id => catalog.get(id)?.type === "dlc")])),
  "store.dlc": ({ appid }: { appid: number }) => DLC[appid] ?? [],
  "store.related": ({ name }: { name: string }) => RELATED[name] ?? [],
};

export type TSteamMock = {
  /**
   * Requests made per procedure.
   */
  calls: Map<string, number>;
};

async function fulfill(route: Route, calls: Map<string, number>): Promise<void> {
  const url = new URL(route.request().url());
  const path = url.pathname.replace(/^\/api\/trpc\//, "");
  const handler = PROCEDURES[path];

  calls.set(path, (calls.get(path) ?? 0) + 1);

  if (!handler) {
    await route.fulfill({ status: 404, json: { error: { message: "Unknown procedure", code: -32004, data: { code: "NOT_FOUND", httpStatus: 404, path } } } });

    return;
  }

  try {
    const input: unknown = JSON.parse(url.searchParams.get("input") ?? "null");

    await route.fulfill({ json: { result: { data: (handler as (value: unknown) => unknown)(input) } } });
  }
  catch (error) {
    const code = error instanceof ProcedureError ? error.code : "NOT_FOUND";

    await route.fulfill({
      status: HTTP_STATUS[code],
      json: { error: { message: code, code: -32004, data: { code, httpStatus: HTTP_STATUS[code], path } } },
    });
  }
}

/**
 * @description
 * Answers every API call with fixtures, so the suite needs no Steam key and never meets a rate limit.
 *
 * @param page - Page to intercept.
 * @returns The mock, with the calls it served.
 */
export async function mockSteam(page: Page): Promise<TSteamMock> {
  const calls = new Map<string, number>();

  await page.context().route("**/api/trpc/**", route => fulfill(route, calls));

  return { calls };
}

/**
 * Every test runs against the mock, tests read `steam` to inspect the calls made.
 */
export const test = base.extend<{ steam: TSteamMock }>({
  steam: [async ({ page }, use) => {
    await use(await mockSteam(page));
  }, { auto: true }],
});

export { expect } from "@playwright/test";

/**
 * @description
 * Opens a profile and waits for its analysis to finish.
 *
 * @param page - Page to use.
 * @param slug - Profile slug.
 * @returns A promise resolving once the analysis is done.
 */
export async function openProfile(page: Page, slug: string): Promise<void> {
  await page.goto(`/${slug}`);
  await waitForAnalysis(page);
}

/**
 * @description
 * Waits for the analysis of the open profile to finish.
 *
 * @param page - Page to use.
 * @returns A promise resolving once the analysis is done.
 */
export async function waitForAnalysis(page: Page): Promise<void> {
  await page.getByText("missing items").first().waitFor();
  await page.waitForFunction(() => !document.querySelector("[data-slot=card] [role=status]"));
}

/**
 * @description
 * Locates the missing items count of the profile header.
 *
 * @param page - Page to use.
 * @returns The count locator.
 */
export function missingCount(page: Page) {
  return page.locator("[data-slot=card] span:has(> span:text-is(\"missing items\")) > strong");
}

/**
 * @description
 * Locates the result cards, in display order.
 *
 * @param page - Page to use.
 * @returns The card title locator.
 */
export function resultTitles(page: Page) {
  return page.locator("[role=listitem] h3:not(:has(button))");
}
