import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { parseProfileInput, STEAM_ID_PATTERN } from "@/lib/steam";

import {
  getAppDlc,
  getDlcForApps,
  getLibrary,
  getProfile,
  getStoreItems,
  searchRelatedApps,
} from "../steam";
import { publicProcedure, router } from "./init";



const appid = z.number().int().positive().max(100_000_000);
const appidBatch = z.array(appid).min(1).max(50);

export const appRouter = router({
  profile: router({
    resolve: publicProcedure
      .input(z.object({ input: z.string().trim().min(1).max(200) }))
      .query(async ({ input }) => {
        const target = parseProfileInput(input.input);

        if (!target) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "That is not a Steam ID64, profile URL or custom profile name" });
        }

        return getProfile(target);
      }),
  }),

  library: router({
    owned: publicProcedure
      .input(z.object({ steamId: z.string().regex(STEAM_ID_PATTERN) }))
      .query(({ input }) => getLibrary(input.steamId)),
  }),

  store: router({
    items: publicProcedure
      .input(z.object({ appids: appidBatch }))
      .query(({ input }) => getStoreItems(input.appids)),

    dlc: publicProcedure
      .input(z.object({ appid }))
      .query(({ input }) => getAppDlc(input.appid)),

    dlcBatch: publicProcedure
      .input(z.object({ appids: appidBatch }))
      .query(({ input }) => getDlcForApps(input.appids)),

    related: publicProcedure
      .input(z.object({
        kind: z.enum(["franchise", "developer", "publisher"]),
        name: z.string().trim().min(1).max(100),
      }))
      .query(({ input }) => searchRelatedApps(input.kind, input.name)),
  }),
});

export type TAppRouter = typeof appRouter;
