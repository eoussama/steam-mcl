import type { TRawStoreItem } from "./schemas";

import type { TStoreItem, TStoreItemType } from "@/lib/steam";

import { getAssetUrl } from "@/lib/steam/urls";

import { requestJson } from "./http";
import { appDetailsSchema, dlcListsSchema, storeItemsSchema } from "./schemas";



const STORE_BROWSE_URL = "https://api.steampowered.com/IStoreBrowseService";
const APP_DETAILS_URL = "https://store.steampowered.com/api/appdetails";
const STORE_CONTEXT = { language: "english", country_code: "US" } as const;
const ONE_HOUR = 60 * 60 * 1000;

const STORE_ITEM_TYPES: Readonly<Record<number, TStoreItemType>> = {
  0: "game",
  4: "dlc",
  6: "software",
  9: "episode",
  11: "music",
};

function storeBrowseUrl(method: string, input: unknown): URL {
  const url = new URL(`${STORE_BROWSE_URL}/${method}/v1/`);

  url.searchParams.set("input_json", JSON.stringify(input));

  return url;
}

/**
 * @description
 * Maps a raw store browse item to the app's store item shape.
 *
 * @param raw - Item returned by `IStoreBrowseService/GetItems`.
 * @returns The store item, or null when Steam does not know the app.
 */
export function toStoreItem(raw: TRawStoreItem): TStoreItem | null {
  if (raw.success !== 1 || !raw.appid || !raw.name) {
    return null;
  }

  const assets = raw.assets;
  const info = raw.basic_info;

  return {
    appid: raw.appid,
    name: raw.name,
    type: STORE_ITEM_TYPES[raw.type ?? -1] ?? "other",
    parentAppid: raw.related_items?.parent_appid ?? null,
    franchises: info?.franchises?.map(entry => entry.name) ?? [],
    developers: info?.developers?.map(entry => entry.name) ?? [],
    publishers: info?.publishers?.map(entry => entry.name) ?? [],
    headerImage: getAssetUrl(assets?.asset_url_format, assets?.header),
    capsuleImage: getAssetUrl(assets?.asset_url_format, assets?.small_capsule),
    price: raw.best_purchase_option?.formatted_final_price ?? null,
    discountPercent: raw.best_purchase_option?.discount_pct ?? 0,
    isFree: raw.is_free ?? false,
    isComingSoon: raw.release?.is_coming_soon ?? false,
    releaseDate: raw.release?.steam_release_date ?? null,
    isPurchasable: raw.visible !== false && raw.unlisted !== true,
  };
}

/**
 * @description
 * Fetches store metadata for a batch of apps.
 *
 * @param appids - App ids to look up, at most 50 so the request URL stays short.
 * @returns The apps Steam knows about, in no particular order.
 */
export async function getStoreItems(appids: ReadonlyArray<number>): Promise<Array<TStoreItem>> {
  const data = await requestJson(
    storeBrowseUrl("GetItems", {
      ids: appids.map(appid => ({ appid })),
      context: STORE_CONTEXT,
      data_request: {
        include_basic_info: true,
        include_related_items: true,
        include_assets: true,
        include_release: true,
      },
    }),
    storeItemsSchema,
    { cacheTtl: ONE_HOUR },
  );

  return (data.response.store_items ?? []).flatMap(raw => toStoreItem(raw) ?? []);
}

/**
 * @description
 * Fetches the complete DLC list of an app, soundtracks and free DLC included.
 *
 * @param appid - App id of the base game.
 * @returns The DLC app ids.
 */
export async function getAppDlc(appid: number): Promise<Array<number>> {
  const url = new URL(APP_DETAILS_URL);

  url.searchParams.set("appids", String(appid));
  url.searchParams.set("filters", "basic");
  url.searchParams.set("cc", STORE_CONTEXT.country_code);
  url.searchParams.set("l", STORE_CONTEXT.language);

  const data = await requestJson(url, appDetailsSchema, { cacheTtl: ONE_HOUR });

  return data[String(appid)]?.data?.dlc ?? [];
}

/**
 * @description
 * Fetches the paid DLC of several apps at once. Faster than `getAppDlc` but skips soundtracks and free DLC.
 *
 * @param appids - App ids of the base games, at most 50.
 * @returns The DLC app ids keyed by base game app id.
 */
export async function getDlcForApps(appids: ReadonlyArray<number>): Promise<Record<number, Array<number>>> {
  const data = await requestJson(
    storeBrowseUrl("GetDLCForAppsSolr", { appids, context: STORE_CONTEXT }),
    dlcListsSchema,
    { cacheTtl: ONE_HOUR },
  );

  const lists: Record<number, Array<number>> = {};

  for (const list of data.response.dlc_lists ?? []) {
    lists[list.parent_appid] = list.dlc_appids ?? [];
  }

  return lists;
}
