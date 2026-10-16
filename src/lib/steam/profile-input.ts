import { z } from "zod";



export type TProfileInput
  = | { kind: "id"; steamId: string }
    | { kind: "vanity"; vanity: string };

export const STEAM_ID_PATTERN = /^7656\d{13}$/;

const VANITY_PATTERN = /^[\w-]{2,32}$/;
const PROFILE_URL_PATTERN = /^(?:https?:\/\/)?(?:www\.)?steamcommunity\.com\/(profiles|id)\/([^/?#]+)/i;

/**
 * @description
 * Parses a Steam ID64, vanity name, or profile/permalink URL into a lookup target.
 *
 * @param raw - User input.
 * @returns The parsed target, or null when the input is not a valid profile reference.
 */
export function parseProfileInput(raw: string): TProfileInput | null {
  const input = raw.trim();

  if (input.length === 0 || input.length > 200) {
    return null;
  }

  const match = PROFILE_URL_PATTERN.exec(input);

  if (match) {
    const [, segment, value = ""] = match;

    if (segment?.toLowerCase() === "profiles") {
      return STEAM_ID_PATTERN.test(value) ? { kind: "id", steamId: value } : null;
    }

    return VANITY_PATTERN.test(value) ? { kind: "vanity", vanity: value } : null;
  }

  if (STEAM_ID_PATTERN.test(input)) {
    return { kind: "id", steamId: input };
  }

  return VANITY_PATTERN.test(input) ? { kind: "vanity", vanity: input } : null;
}

export const profileInputSchema = z
  .string()
  .trim()
  .min(1, "Enter a Steam profile")
  .max(200, "That input is too long")
  .refine(value => parseProfileInput(value) !== null, "Enter a Steam ID64, a profile URL or a custom profile name");
