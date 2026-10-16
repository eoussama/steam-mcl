import type { TRelatedKind } from "@/lib/steam";

import { requestJson } from "./http";
import { searchResultsSchema } from "./schemas";



const SEARCH_URL = "https://store.steampowered.com/search/results/";
const MAX_RESULTS = 100;
const APP_ID_ATTRIBUTE = /data-ds-appid="(\d+)"/g;

/**
 * @description
 * Extracts app ids from store search result markup. Rows listing several apps are packages and are skipped.
 *
 * @param html - Search result rows.
 * @returns The unique app ids, in result order.
 */
export function extractSearchAppIds(html: string): Array<number> {
  const ids = new Set<number>();

  for (const match of html.matchAll(APP_ID_ATTRIBUTE)) {
    ids.add(Number(match[1]));
  }

  return [...ids];
}

/**
 * @description
 * Lists the store apps tagged with a franchise, developer or publisher name.
 *
 * @param kind - Which store filter to apply.
 * @param name - Franchise, developer or publisher name, as reported by the store.
 * @returns Up to 100 matching app ids.
 */
export async function searchRelatedApps(kind: TRelatedKind, name: string): Promise<Array<number>> {
  const url = new URL(SEARCH_URL);

  url.searchParams.set(kind, name);
  url.searchParams.set("infinite", "1");
  url.searchParams.set("start", "0");
  url.searchParams.set("count", String(MAX_RESULTS));
  url.searchParams.set("ignore_preferences", "1");
  url.searchParams.set("cc", "US");
  url.searchParams.set("l", "english");

  const data = await requestJson(url, searchResultsSchema, { cacheTtl: 60 * 60 * 1000 });

  return extractSearchAppIds(data.results_html);
}
