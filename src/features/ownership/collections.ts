import { createCollection, localStorageCollectionOptions } from "@tanstack/react-db";

import { z } from "@/lib/zod";



export const OWNERSHIP_STATUSES = ["missing", "owned", "hidden"] as const;

export type TOwnershipStatus = (typeof OWNERSHIP_STATUSES)[number];

const markSchema = z.object({
  /**
   * `steamId:appid`, marks belong to the profile they were made on.
   */
  id: z.string(),
  steamId: z.string(),
  appid: z.number().int().positive(),
  /**
   * "missing" overrides an import that says otherwise.
   */
  status: z.enum(OWNERSHIP_STATUSES),
  markedAt: z.number(),
});

const importSchema = z.object({
  steamId: z.string(),
  owned: z.array(z.number().int().positive()),
  ignored: z.array(z.number().int().positive()),
  wishlist: z.array(z.number().int().positive()).default([]),
  importedAt: z.number(),
});

export type TOwnershipMark = z.infer<typeof markSchema>;
export type TOwnershipImport = z.infer<typeof importSchema>;

/**
 * Items marked owned, hidden or back to missing by hand. Kept in local storage and synced across tabs.
 */
export const marksCollection = createCollection(localStorageCollectionOptions({
  id: "ownership-marks",
  storageKey: "steam-mcl:marks",
  getKey: mark => mark.id,
  schema: markSchema,
}));

/**
 * Owned and ignored apps imported from the Steam store userdata, one entry per profile.
 */
export const importsCollection = createCollection(localStorageCollectionOptions({
  id: "ownership-imports",
  storageKey: "steam-mcl:imports",
  getKey: entry => entry.steamId,
  schema: importSchema,
}));

/**
 * @description
 * Key of a mark.
 *
 * @param steamId - Profile the mark belongs to.
 * @param appid - Marked app.
 * @returns The mark key.
 */
export function getMarkId(steamId: string, appid: number): string {
  return `${steamId}:${appid}`;
}
