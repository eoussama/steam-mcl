const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * How long each kind of Steam data is considered fresh before it is fetched again.
 */
export const STALE_TIMES = {
  profile: DAY,
  library: HOUR,
  storeItem: 7 * DAY,
  storeLists: 3 * DAY,
} as const;

/**
 * How long unused data stays in memory and in the persisted cache.
 */
export const CACHE_MAX_AGE = 7 * DAY;
