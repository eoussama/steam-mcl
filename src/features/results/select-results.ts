import type { TResultsSearch } from "./search-params";

import type { TMissingCategory, TMissingItem } from "@/features/analysis";
import type { TOwnershipStatus } from "@/features/ownership";
import type { TOwnedGame } from "@/lib/steam";

import { isSameTitle } from "@/features/analysis/titles";

import { CATEGORIES, CATEGORY_ORDER } from "./categories";



export type TResultRow
  = | { kind: "group"; key: string; appid: number; name: string; count: number }
    | { kind: "item"; key: string; entry: TMissingItem; description: string };

export type TResultsSelection = {
  rows: Array<TResultRow>;
  counts: Record<TMissingCategory | "all", number>;
  /**
   * Items per ownership status, for the name filter but any category.
   */
  views: Record<TOwnershipStatus, number>;
  matched: number;
};

const NO_PRICE = Number.POSITIVE_INFINITY;

// One shared collator, `localeCompare` builds a new one on every call which is slow on large lists.
const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
const byName = (a: string, b: string) => collator.compare(a, b);

/**
 * How much each kind of relation counts towards relevance: add-ons of a game you play beat studio picks.
 */
const CATEGORY_WEIGHTS: Readonly<Record<TMissingCategory, number>> = {
  dlc: 1,
  soundtrack: 0.9,
  edition: 0.9,
  franchise: 0.7,
  studio: 0.4,
};

function priceOf(entry: TMissingItem): number {
  if (entry.item.isFree) {
    return 0;
  }

  return entry.item.priceCents ?? NO_PRICE;
}

/**
 * @description
 * Filters, sorts and optionally groups missing items for display.
 *
 * @param items - Missing items found by the analysis.
 * @param games - Games in the library, used for relevance and descriptions.
 * @param search - Active filters.
 * @param statusOf - Ownership status of an app, items are listed under the view matching their status.
 * @returns The display rows, per category and per status counts and the number of matching items.
 */
export function selectResults(
  items: Iterable<TMissingItem>,
  games: ReadonlyArray<TOwnedGame>,
  search: TResultsSearch,
  statusOf: (appid: number) => TOwnershipStatus = () => "missing",
): TResultsSelection {
  const owned = new Map(games.map(game => [game.appid, game]));
  const query = search.q.trim().toLowerCase();
  const counts: TResultsSelection["counts"] = { all: 0, dlc: 0, soundtrack: 0, edition: 0, franchise: 0, studio: 0 };
  const views: TResultsSelection["views"] = { missing: 0, owned: 0, hidden: 0 };

  const playtimeOf = (appid: number) => owned.get(appid)?.playtimeMinutes ?? 0;
  const primaryOf = (entry: TMissingItem) =>
    entry.relatedTo.reduce((best, appid) => (playtimeOf(appid) > playtimeOf(best) ? appid : best), entry.relatedTo[0] ?? 0);
  const relevanceOf = (entry: TMissingItem) => playtimeOf(primaryOf(entry)) * CATEGORY_WEIGHTS[entry.category];

  const matching: Array<TMissingItem> = [];

  for (const entry of items) {
    if (query && !entry.item.name.toLowerCase().includes(query)) {
      continue;
    }

    const status = statusOf(entry.item.appid);

    views[status]++;

    if (status !== search.view) {
      continue;
    }

    counts.all++;
    counts[entry.category]++;

    if (search.category === "all" || search.category === entry.category) {
      matching.push(entry);
    }
  }

  const compare = (a: TMissingItem, b: TMissingItem): number => {
    switch (search.sort) {
      case "name":
        return byName(a.item.name, b.item.name);

      case "price-asc":
        return priceOf(a) - priceOf(b) || byName(a.item.name, b.item.name);

      case "price-desc":
        return (priceOf(b) === NO_PRICE ? -1 : priceOf(b)) - (priceOf(a) === NO_PRICE ? -1 : priceOf(a))
          || byName(a.item.name, b.item.name);

      case "release":
        return (b.item.releaseDate ?? 0) - (a.item.releaseDate ?? 0) || byName(a.item.name, b.item.name);

      default:
        return relevanceOf(b) - relevanceOf(a)
          || CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
          || byName(a.item.name, b.item.name);
    }
  };

  const describe = (entry: TMissingItem) => {
    const names: Array<string> = [];

    // Owning two editions of a game should not name it twice.
    for (const appid of [...entry.relatedTo].sort((a, b) => playtimeOf(b) - playtimeOf(a))) {
      const name = owned.get(appid)?.name;

      if (name && !names.some(existing => isSameTitle(existing, name))) {
        names.push(name);
      }
    }

    const shown = names.slice(0, 2).join(", ");
    const more = names.length > 2 ? ` and ${names.length - 2} more` : "";

    return CATEGORIES[entry.category].describe(shown ? `${shown}${more}` : "a game you own");
  };

  const toRow = (entry: TMissingItem): TResultRow => ({
    kind: "item",
    key: `item-${entry.item.appid}`,
    entry,
    description: describe(entry),
  });

  matching.sort(compare);

  if (!search.group) {
    return { rows: matching.map(toRow), counts, views, matched: matching.length };
  }

  const groups = new Map<number, Array<TMissingItem>>();

  for (const entry of matching) {
    const appid = primaryOf(entry);

    groups.set(appid, [...(groups.get(appid) ?? []), entry]);
  }

  const rows = [...groups]
    .sort(([a], [b]) => playtimeOf(b) - playtimeOf(a) || byName(owned.get(a)?.name ?? "", owned.get(b)?.name ?? ""))
    .flatMap(([appid, entries]): Array<TResultRow> => [
      { kind: "group", key: `group-${appid}`, appid, name: owned.get(appid)?.name ?? "Other games", count: entries.length },
      ...entries.map(toRow),
    ]);

  return { rows, counts, views, matched: matching.length };
}
