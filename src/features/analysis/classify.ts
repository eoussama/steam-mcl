import type { TCandidateRelations, TMissingItem } from "./types";

import type { TStoreItem } from "@/lib/steam";

import { isEditionTitle, isSameTitle, isSupersetEditionTitle } from "./titles";



export type TClassifyContext = {
  owned: ReadonlySet<number>;
  ownedNames: ReadonlyMap<number, string>;
  relations: TCandidateRelations | undefined;
};

function addOn(item: TStoreItem, category: "dlc" | "soundtrack", context: TClassifyContext): TMissingItem | null {
  if (item.parentAppid !== null && context.owned.has(item.parentAppid)) {
    return { item, category, relatedTo: [item.parentAppid] };
  }

  const listedBy = [...(context.relations?.dlc ?? [])];

  return listedBy.length > 0 ? { item, category, relatedTo: listedBy } : null;
}

function standalone(item: TStoreItem, context: TClassifyContext): TMissingItem | null {
  const franchise = [...(context.relations?.franchise ?? [])];
  const studio = [...(context.relations?.studio ?? [])];
  // Stryker disable next-line StringLiteral: owned games always have a name, the fallback only satisfies the types.
  const nameOf = (appid: number) => context.ownedNames.get(appid) ?? "";
  const editionOf = [...new Set([...franchise, ...studio])].filter(appid => isSameTitle(item.name, nameOf(appid)));

  if (editionOf.length > 0) {
    // The plain game adds nothing when every owned version is a superset, such as a Game of the Year edition.
    const isSuperseded = !isEditionTitle(item.name) && editionOf.every(appid => isSupersetEditionTitle(nameOf(appid)));

    return isSuperseded ? null : { item, category: "edition", relatedTo: editionOf };
  }

  if (franchise.length > 0) {
    return { item, category: "franchise", relatedTo: franchise };
  }

  if (studio.length > 0) {
    return { item, category: "studio", relatedTo: studio };
  }

  return addOn(item, "dlc", context);
}

/**
 * @description
 * Decides whether a store item is content missing from the library, and why.
 *
 * DLC and soundtracks only count when their base game is owned. Games count when they share a franchise or a
 * studio with an owned game, and are flagged as an edition when they are another version of an owned game.
 *
 * @param item - Candidate store item.
 * @param context - Library ownership and how the candidate was discovered.
 * @returns The missing item, or null when it is owned, unavailable or unrelated.
 */
export function classifyCandidate(item: TStoreItem, context: TClassifyContext): TMissingItem | null {
  if (context.owned.has(item.appid) || !item.isPurchasable) {
    return null;
  }

  switch (item.type) {
    case "music":
      return addOn(item, "soundtrack", context);

    case "dlc":
      return addOn(item, "dlc", context);

    case "game":

    case "episode":

    case "software":
      return standalone(item, context);

    default:
      return null;
  }
}
