import type { TLibrary, TProfileInput, TSteamProfile } from "@/lib/steam";

import { getEnv } from "../env";

import { SteamError } from "./errors";
import { requestJson } from "./http";
import { ownedGamesSchema, playerSummariesSchema, resolveVanitySchema } from "./schemas";
import "@tanstack/react-start/server-only";



const WEB_API_URL = "https://api.steampowered.com";
const PUBLIC_VISIBILITY = 3;
const VANITY_URL_PATTERN = /\/id\/([^/]+)\/?$/;

function webApiUrl(path: string, params: Record<string, string>): URL {
  const url = new URL(path, WEB_API_URL);

  url.searchParams.set("key", getEnv().STEAM_KEY);

  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }

  return url;
}

async function resolveVanity(vanity: string): Promise<string> {
  const data = await requestJson(
    webApiUrl("/ISteamUser/ResolveVanityURL/v1/", { vanityurl: vanity }),
    resolveVanitySchema,
    { cacheTtl: 60 * 60 * 1000 },
  );

  if (data.response.success !== 1 || !data.response.steamid) {
    throw new SteamError("not_found", "No Steam profile uses that name");
  }

  return data.response.steamid;
}

/**
 * @description
 * Resolves user input to a public Steam profile.
 *
 * @param input - Parsed profile reference.
 * @returns The profile.
 */
export async function getProfile(input: TProfileInput): Promise<TSteamProfile> {
  const steamId = input.kind === "id" ? input.steamId : await resolveVanity(input.vanity);

  const data = await requestJson(
    webApiUrl("/ISteamUser/GetPlayerSummaries/v2/", { steamids: steamId }),
    playerSummariesSchema,
    { cacheTtl: 5 * 60 * 1000 },
  );

  const player = data.response.players[0];

  if (!player) {
    throw new SteamError("not_found", "No Steam profile has that ID");
  }

  return {
    steamId: player.steamid,
    vanity: VANITY_URL_PATTERN.exec(player.profileurl)?.[1] ?? null,
    name: player.personaname,
    avatar: player.avatarfull,
    profileUrl: player.profileurl,
    isPublic: player.communityvisibilitystate === PUBLIC_VISIBILITY,
  };
}

/**
 * @description
 * Fetches the games in a library. A private library answers with an empty response.
 *
 * @param steamId - Steam ID64 of the profile.
 * @returns The owned games and whether the library is private.
 */
export async function getLibrary(steamId: string): Promise<TLibrary> {
  const data = await requestJson(
    webApiUrl("/IPlayerService/GetOwnedGames/v1/", {
      steamid: steamId,
      include_appinfo: "1",
      include_played_free_games: "1",
    }),
    ownedGamesSchema,
    { cacheTtl: 5 * 60 * 1000 },
  );

  const { games, game_count: gameCount } = data.response;

  if (!games && gameCount === undefined) {
    return { games: [], isPrivate: true };
  }

  return {
    isPrivate: false,
    games: (games ?? []).map(game => ({
      appid: game.appid,
      name: game.name?.trim() || `App ${game.appid}`,
      playtimeMinutes: game.playtime_forever,
      lastPlayed: game.rtime_last_played || null,
    })),
  };
}
