import { z } from "@/lib/zod";



export type TUserData = {
  /**
   * Every app the signed-in account owns, DLC and soundtracks included.
   */
  owned: Array<number>;
  /**
   * Apps the account chose to ignore on the store.
   */
  ignored: Array<number>;
  /**
   * Apps on the account wishlist.
   */
  wishlist: Array<number>;
};

export const USERDATA_URL = "https://store.steampowered.com/dynamicstore/userdata/";

/**
 * Larger pastes are not Steam userdata, the biggest libraries stay well under a megabyte.
 */
const MAX_LENGTH = 5_000_000;

const appidSchema = z.number().int().positive();

/**
 * Only the fields used are validated, the page carries many more. Ignored apps come as an object keyed by app id,
 * or an empty array when there are none.
 */
const wishlistEntrySchema = z.union([appidSchema, z.object({ appid: appidSchema }).transform(entry => entry.appid)]);

const userDataSchema = z.object({
  rgOwnedApps: z.array(appidSchema),
  rgWishlist: z.array(wishlistEntrySchema).optional(),
  rgIgnoredApps: z.union([z.record(z.string().regex(/^\d+$/), z.unknown()), z.array(z.unknown())]).optional(),
});

/**
 * @description
 * Removes duplicates and sorts app ids.
 *
 * @param appids - App ids.
 * @returns The unique app ids, ascending.
 */
function sortedUnique(appids: ReadonlyArray<number>): Array<number> {
  return [...new Set(appids)].sort((a, b) => a - b);
}

/**
 *
 */
export class UserDataError extends Error {
  override readonly name = "UserDataError";
}

/**
 * @description
 * Parses the content of the Steam store userdata page. Browsers add controls such as a pretty print toggle around
 * raw JSON, so only the outermost object is read.
 *
 * @param text - Pasted page content.
 * @returns The owned and ignored apps.
 * @throws {UserDataError} When the text is not userdata, or shows a signed out visitor.
 */
export function parseUserData(text: string): TUserData {
  if (text.length > MAX_LENGTH) {
    throw new UserDataError("That is far too long to be the userdata page.");
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  // Stryker disable next-line EqualityOperator: "{" and "}" can never share an index.
  if (start === -1 || end < start) {
    throw new UserDataError("That does not look like the userdata page. Copy everything on it and paste it again.");
  }

  let json: unknown;

  try {
    json = JSON.parse(text.slice(start, end + 1));
  }
  catch {
    throw new UserDataError("Part of the page is missing. Copy everything on it and paste it again.");
  }

  const result = userDataSchema.safeParse(json);

  if (!result.success) {
    throw new UserDataError("That does not look like the userdata page. Copy everything on it and paste it again.");
  }

  const { rgOwnedApps, rgIgnoredApps, rgWishlist } = result.data;

  if (rgOwnedApps.length === 0) {
    throw new UserDataError("The page lists no owned apps, you are probably signed out. Sign in to the Steam store and reload it.");
  }

  const ignored = Array.isArray(rgIgnoredApps) ? [] : Object.keys(rgIgnoredApps ?? {}).map(Number);

  return {
    owned: sortedUnique(rgOwnedApps),
    ignored: sortedUnique(ignored),
    wishlist: sortedUnique(rgWishlist ?? []),
  };
}
