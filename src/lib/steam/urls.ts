const STORE_URL = "https://store.steampowered.com";
const ASSET_BASE_URL = "https://shared.akamai.steamstatic.com/store_item_assets/";

/**
 * @description
 * Builds the Steam store page URL of an app.
 *
 * @param appid - Steam app id.
 * @returns The store page URL.
 */
export function getStoreUrl(appid: number): string {
  return `${STORE_URL}/app/${appid}/`;
}

/**
 * @description
 * Resolves a store asset file name against the asset URL format returned by the store browse API.
 *
 * @param format - Asset URL format containing a `${FILENAME}` placeholder.
 * @param fileName - Asset file name.
 * @returns The absolute asset URL, or null when either part is missing.
 */
export function getAssetUrl(format: string | undefined, fileName: string | undefined): string | null {
  if (!format || !fileName) {
    return null;
  }

  return ASSET_BASE_URL + format.replace(/\$\{FILENAME\}/, fileName);
}
