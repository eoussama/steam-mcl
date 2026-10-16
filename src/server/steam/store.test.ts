import { describe, expect, it } from "vitest";

import { toStoreItem } from "./store";



describe("toStoreItem", () => {
  it("maps a store browse item", () => {
    expect(toStoreItem({
      appid: 598190,
      success: 1,
      visible: true,
      name: "Hollow Knight - Official Soundtrack",
      type: 11,
      related_items: { parent_appid: 367520 },
      basic_info: { developers: [{ name: "Team Cherry" }], publishers: [{ name: "Team Cherry" }] },
      // eslint-disable-next-line no-template-curly-in-string -- Steam's literal asset placeholder, not a template.
      assets: { asset_url_format: "steam/apps/598190/${FILENAME}?t=1", header: "header.jpg" },
      release: { steam_release_date: 1487000000 },
      best_purchase_option: { formatted_final_price: "$4.99", final_price_in_cents: 499, discount_pct: 20 },
    })).toEqual({
      appid: 598190,
      name: "Hollow Knight - Official Soundtrack",
      type: "music",
      parentAppid: 367520,
      franchises: [],
      developers: ["Team Cherry"],
      publishers: ["Team Cherry"],
      headerImage: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/598190/header.jpg?t=1",
      capsuleImage: null,
      price: "$4.99",
      priceCents: 499,
      discountPercent: 20,
      isFree: false,
      isComingSoon: false,
      releaseDate: 1487000000,
      isPurchasable: true,
    });
  });

  it("marks unlisted and hidden apps as not purchasable", () => {
    expect(toStoreItem({ appid: 1, success: 1, name: "A", unlisted: true })?.isPurchasable).toBe(false);
    expect(toStoreItem({ appid: 1, success: 1, name: "A", visible: false })?.isPurchasable).toBe(false);
  });

  it("maps unknown types to other", () => {
    expect(toStoreItem({ appid: 1, success: 1, name: "A", type: 3 })?.type).toBe("other");
  });

  it("returns null for apps Steam does not know", () => {
    expect(toStoreItem({ success: 2 })).toBeNull();
    expect(toStoreItem({ appid: 1, success: 1 })).toBeNull();
  });
});
