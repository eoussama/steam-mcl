import type { TStoreItem } from "@/lib/steam";



/**
 * @description
 * Builds a store item for tests, purchasable game by default.
 *
 * @param overrides - Fields to override.
 * @returns The store item.
 */
export function makeStoreItem(overrides: Partial<TStoreItem> & Pick<TStoreItem, "appid">): TStoreItem {
  return {
    name: `App ${overrides.appid}`,
    type: "game",
    parentAppid: null,
    franchises: [],
    developers: [],
    publishers: [],
    headerImage: null,
    capsuleImage: null,
    price: "$9.99",
    priceCents: 999,
    discountPercent: 0,
    isFree: false,
    isComingSoon: false,
    releaseDate: null,
    isPurchasable: true,
    ...overrides,
  };
}
