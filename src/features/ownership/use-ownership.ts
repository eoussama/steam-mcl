import type { TOwnershipStatus } from "./collections";
import type { TUserData } from "./userdata";

import { eq, useLiveQuery } from "@tanstack/react-db";
import { useCallback, useMemo } from "react";

import { getMarkId, importsCollection, marksCollection } from "./collections";



export type TOwnership = {
  /**
   * Status of an app for this profile, marks first, then the import.
   */
  statusOf: (appid: number) => TOwnershipStatus;
  /**
   * Whether an app is on the imported wishlist.
   */
  isWishlisted: (appid: number) => boolean;
  /**
   * Summary of the imported userdata, null when nothing was imported.
   */
  imported: { owned: number; ignored: number; wishlist: number; importedAt: number } | null;
  setStatus: (appid: number, status: TOwnershipStatus) => void;
  importUserData: (data: TUserData) => void;
  removeImport: () => void;
};

/**
 * @description
 * Ownership the Steam Web API cannot see for a profile: DLC imported from the store userdata, and items marked owned
 * or hidden by hand. Everything stays in this browser.
 *
 * @param steamId - Profile, undefined while it resolves.
 * @returns The ownership state and its actions.
 */
export function useOwnership(steamId: string | undefined): TOwnership {
  const id = steamId ?? "";

  const { data: marks } = useLiveQuery(
    q => q.from({ mark: marksCollection }).where(({ mark }) => eq(mark.steamId, id)),
    [id],
  );

  const { data: imports } = useLiveQuery(
    q => q.from({ entry: importsCollection }).where(({ entry }) => eq(entry.steamId, id)),
    [id],
  );

  const entry = imports[0];

  const importedStatusOf = useMemo(() => {
    const owned = new Set(entry?.owned);
    const ignored = new Set(entry?.ignored);

    return (appid: number): TOwnershipStatus => {
      if (owned.has(appid)) {
        return "owned";
      }

      return ignored.has(appid) ? "hidden" : "missing";
    };
  }, [entry]);

  const isWishlisted = useMemo(() => {
    const wishlist = new Set(entry?.wishlist);

    return (appid: number) => wishlist.has(appid);
  }, [entry]);

  const statusOf = useMemo(() => {
    const manual = new Map(marks.map(mark => [mark.appid, mark.status]));

    return (appid: number) => manual.get(appid) ?? importedStatusOf(appid);
  }, [marks, importedStatusOf]);

  const setStatus = useCallback((appid: number, status: TOwnershipStatus) => {
    if (!steamId) {
      return;
    }

    const key = getMarkId(steamId, appid);
    const exists = marksCollection.has(key);

    // A mark that agrees with the import is redundant.
    if (status === importedStatusOf(appid)) {
      if (exists) {
        marksCollection.delete(key);
      }

      return;
    }

    if (exists) {
      marksCollection.update(key, (draft) => {
        draft.status = status;
        draft.markedAt = Date.now();
      });
    }
    else {
      marksCollection.insert({ id: key, steamId, appid, status, markedAt: Date.now() });
    }
  }, [steamId, importedStatusOf]);

  const importUserData = useCallback((data: TUserData) => {
    if (!steamId) {
      return;
    }

    const value = { steamId, owned: data.owned, ignored: data.ignored, wishlist: data.wishlist, importedAt: Date.now() };

    if (importsCollection.has(steamId)) {
      importsCollection.update(steamId, (draft) => {
        Object.assign(draft, value);
      });
    }
    else {
      importsCollection.insert(value);
    }
  }, [steamId]);

  const removeImport = useCallback(() => {
    if (steamId && importsCollection.has(steamId)) {
      importsCollection.delete(steamId);
    }
  }, [steamId]);

  const imported = useMemo(
    () => (entry
      ? { owned: entry.owned.length, ignored: entry.ignored.length, wishlist: entry.wishlist.length, importedAt: entry.importedAt }
      : null),
    [entry],
  );

  return useMemo(
    () => ({ statusOf, isWishlisted, imported, setStatus, importUserData, removeImport }),
    [statusOf, isWishlisted, imported, setStatus, importUserData, removeImport],
  );
}
