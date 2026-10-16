const PRIVATE_SHORT = "private, max-age=300";
const PUBLIC_STORE = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
const NO_STORE = "no-store";

const POLICIES: ReadonlyArray<[prefix: string, policy: string]> = [
  ["profile.", PRIVATE_SHORT],
  ["library.", PRIVATE_SHORT],
  ["store.", PUBLIC_STORE],
];

/**
 * @description
 * Picks the Cache-Control policy of a tRPC response. Public store lookups are cached by the CDN and shared
 * across visitors, profile data stays in the visitor's browser, and failures are never cached.
 *
 * @param paths - Procedure paths served by the response.
 * @param failed - Whether any procedure failed.
 * @returns The Cache-Control header value.
 */
export function getCachePolicy(paths: ReadonlyArray<string> | undefined, failed: boolean): string {
  if (failed || !paths || paths.length === 0) {
    return NO_STORE;
  }

  const policies = new Set(paths.map(path => POLICIES.find(([prefix]) => path.startsWith(prefix))?.[1] ?? NO_STORE));
  const [policy] = policies;

  return policies.size === 1 && policy ? policy : NO_STORE;
}
