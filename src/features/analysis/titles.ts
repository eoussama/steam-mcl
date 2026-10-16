const EDITION_PHRASES = [
  "game of the year",
  "directors cut",
  "collectors",
  "goty",
  "edition",
  "remastered",
  "remaster",
  "remake",
  "definitive",
  "enhanced",
  "special",
  "legendary",
  "complete",
  "ultimate",
  "deluxe",
  "gold",
  "anniversary",
  "redux",
  "legacy",
  "hd",
  "classic",
  "premium",
  "standard",
  "digital",
] as const;

/**
 * Qualifiers of editions that include everything the plain version has.
 */
const SUPERSET_PHRASES = [
  "game of the year",
  "directors cut",
  "collectors",
  "goty",
  "remastered",
  "remaster",
  "definitive",
  "enhanced",
  "special",
  "legendary",
  "complete",
  "ultimate",
  "deluxe",
  "gold",
  "anniversary",
  "premium",
] as const;

const EDITION_PATTERN = new RegExp(`\\b(?:${EDITION_PHRASES.join("|")})\\b`, "g");
const SUPERSET_PATTERN = new RegExp(`\\b(?:${SUPERSET_PHRASES.join("|")})\\b`);

function simplify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[™®©]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * @description
 * Reduces a store title to its core name, dropping marks, punctuation and edition qualifiers so that
 * "The Witcher 3: Wild Hunt — Remastered" and "The Witcher 3: Wild Hunt" compare equal.
 *
 * @param title - Store title.
 * @returns The normalized title.
 */
export function normalizeTitle(title: string): string {
  return simplify(title)
    .replace(EDITION_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @description
 * Checks whether two store titles are editions of the same game.
 *
 * @param a - First title.
 * @param b - Second title.
 * @returns Whether both titles share the same core name.
 */
export function isSameTitle(a: string, b: string): boolean {
  const normalized = normalizeTitle(a);

  return normalized.length > 0 && normalized === normalizeTitle(b);
}

/**
 * @description
 * Checks whether a title names a specific edition rather than the plain game.
 *
 * @param title - Store title.
 * @returns Whether the title carries an edition qualifier.
 */
export function isEditionTitle(title: string): boolean {
  return normalizeTitle(title) !== simplify(title).replace(/\s+/g, " ");
}

/**
 * @description
 * Checks whether a title names an edition that includes everything the plain game has, such as a
 * Game of the Year or Complete edition.
 *
 * @param title - Store title.
 * @returns Whether the title is a superset edition.
 */
export function isSupersetEditionTitle(title: string): boolean {
  return SUPERSET_PATTERN.test(simplify(title));
}
