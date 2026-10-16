import process from "node:process";

import { z } from "@/lib/zod";
import "@tanstack/react-start/server-only";



const envSchema = z.object({
  STEAM_KEY: z
    .string({ error: "STEAM_KEY is not set, get one from https://steamcommunity.com/dev/apikey" })
    .regex(/^[A-F0-9]{32}$/i, "STEAM_KEY must be a 32 character hexadecimal Steam Web API key"),
});

export type TEnv = z.infer<typeof envSchema>;

let cached: TEnv | undefined;

/**
 * @description
 * Parses and validates the server environment. Runs lazily so builds never require secrets.
 *
 * @returns The validated server environment.
 */
export function getEnv(): TEnv {
  cached ??= envSchema.parse(process.env);

  return cached;
}
