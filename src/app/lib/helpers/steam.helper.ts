import { STEAM_API_BASE_URL, STEAM_API_ENDPOINTS } from "../consts";
import {
  TSteamUser,
  TOwnedGame,
  TSteamApp,
  TGetAppListResponse,
  TSteamMissingContent,
  TGetOwnedGamesResponse,
  TResolveVanityURLResponse,
  TGetPlayerSummariesResponse,
} from "../types";





const getSteamAPIKey = (): string => {
  if (typeof window !== "undefined") {
    throw new Error("Steam API key should not be used on client-side");
  }

  const apiKey = process.env.STEAM_KEY;
  if (!apiKey) {
    throw new Error("STEAM_KEY environment variable is not set");
  }

  return apiKey;
};

async function steamAPIRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = getSteamAPIKey();

  const url = new URL(STEAM_API_BASE_URL + endpoint);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("format", "json");

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Steam API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getAppList(): Promise<Array<TSteamApp>> {
  const data = await steamAPIRequest<TGetAppListResponse>(STEAM_API_ENDPOINTS.GET_APP_LIST);
  return data.applist.apps;
}

export async function getPlayerSummaries(steamIds: Array<string>): Promise<Array<TSteamUser>> {
  const data = await steamAPIRequest<TGetPlayerSummariesResponse>(
    STEAM_API_ENDPOINTS.GET_PLAYER_SUMMARIES,
    { steamids: steamIds.join(",") }
  );

  return data.response.players;
}

export async function getOwnedGames(steamId: string, includeAppInfo = true): Promise<Array<TOwnedGame>> {
  const data = await steamAPIRequest<TGetOwnedGamesResponse>(
    STEAM_API_ENDPOINTS.GET_OWNED_GAMES,
    {
      steamid: steamId,
      include_appinfo: includeAppInfo ? "1" : "0",
      include_played_free_games: "1",
    }
  );

  return data.response.games || [];
}

export async function resolveVanityURL(vanityUrl: string): Promise<string | null> {
  try {
    const data = await steamAPIRequest<TResolveVanityURLResponse>(
      STEAM_API_ENDPOINTS.RESOLVE_VANITY_URL,
      { vanityurl: vanityUrl }
    );

    if (data.response.success === 1 && data.response.steamid) {
      return data.response.steamid;
    }

    return null;
  } catch (error) {
    console.error("Error resolving vanity URL:", error);
    return null;
  }
}

export function extractSteamId(input: string): string | null {
  const trimmed = input.trim();

  if (/^\d{17}$/.test(trimmed)) {
    return trimmed;
  }

  const urlPatterns = [
    /steamcommunity\.com\/profiles\/(\d{17})/,
    /steamcommunity\.com\/id\/([^\/]+)/,
  ];

  for (const pattern of urlPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      if (pattern.source.includes("profiles")) {
        return match[1];
      } else {
        return match[1];
      }
    }
  }

  return trimmed;
}

function isAppLikelyAvailable(app: TSteamApp): boolean {
  const name = app.name.toLowerCase();

  const genericPatterns = [
    /^test$/,
    /^demo$/,
    /^sdk$/,
    /^tool$/,
    /^server$/,
    /^dedicated server$/,
    /^beta$/,
    /^alpha$/,
    /^prototype$/,
    /^sample$/,
    /^template$/,
    /^placeholder$/,
    /^unknown$/,
    /^untitled$/,
    /valve.*tool/,
    /source.*sdk/,
    /steamworks/,
    /^steam/,
    /^valve/
  ];

  if (genericPatterns.some(pattern => pattern.test(name))) {
    return false;
  }

  if (app.name.trim().length < 3) {
    return false;
  }

  if (name.includes("dedicated server") ||
    name.includes("source sdk") ||
    name.includes("steamworks") ||
    name.includes("valve tool")) {
    return false;
  }

  return true;
}

export async function analyzeMissingContent(ownedGames: Array<TOwnedGame>): Promise<Array<TSteamMissingContent>> {
  try {
    const allApps = await getAppList();
    const missingContent: Array<TSteamMissingContent> = [];
    const availableApps = allApps.filter(isAppLikelyAvailable);
    const ownedAppIds = new Set(ownedGames.map(game => game.appid));

    for (const ownedGame of ownedGames) {
      if (!ownedGame.name) continue;

      const baseName = ownedGame.name;
      const baseNameLower = baseName.toLowerCase();

      const relatedApps = availableApps.filter(app => {
        if (ownedAppIds.has(app.appid)) return false;

        const appNameLower = app.name.toLowerCase();
        if (appNameLower === baseNameLower) return false;
        if (app.name.length < 3) return false;

        return (
          appNameLower.includes(baseNameLower + " -") ||
          appNameLower.includes(baseNameLower + ":") ||
          appNameLower.includes(baseNameLower + " dlc") ||
          appNameLower.includes(baseNameLower + " expansion") ||

          (appNameLower.includes(baseNameLower) && (
            appNameLower.includes("edition") ||
            appNameLower.includes("remaster") ||
            appNameLower.includes("enhanced") ||
            appNameLower.includes("definitive") ||
            appNameLower.includes("complete") ||
            appNameLower.includes("ultimate") ||
            appNameLower.includes("deluxe") ||
            appNameLower.includes("gold") ||
            appNameLower.includes("goty") ||
            appNameLower.includes("game of the year")
          )) ||

          (appNameLower.startsWith(baseNameLower + " ") && (
            /\s(2|3|4|5|ii|iii|iv|v)\b/.test(appNameLower) ||
            appNameLower.includes(" sequel") ||
            appNameLower.includes(" returns") ||
            appNameLower.includes(" continues")
          )) ||

          (appNameLower.includes("bundle") && appNameLower.includes(baseNameLower)) ||
          (appNameLower.includes("collection") && appNameLower.includes(baseNameLower)) ||
          (appNameLower.includes("pack") && appNameLower.includes(baseNameLower))
        );
      });

      for (const relatedApp of relatedApps) {
        const relatedNameLower = relatedApp.name.toLowerCase();
        let type: TSteamMissingContent["type"] = "Related";
        let description = `Related content for ${baseName}`;

        if (relatedNameLower.includes("dlc") ||
          relatedNameLower.includes(baseNameLower + " -") ||
          relatedNameLower.includes(baseNameLower + ":")) {
          type = "DLC";
          description = `DLC for ${baseName}`;
        } else if (relatedNameLower.includes("expansion")) {
          type = "Expansion";
          description = `Expansion for ${baseName}`;
        } else if (relatedNameLower.includes("edition") ||
          relatedNameLower.includes("remaster") ||
          relatedNameLower.includes("enhanced") ||
          relatedNameLower.includes("definitive") ||
          relatedNameLower.includes("complete") ||
          relatedNameLower.includes("ultimate") ||
          relatedNameLower.includes("deluxe") ||
          relatedNameLower.includes("gold") ||
          relatedNameLower.includes("goty")) {
          type = "Edition";
          description = `Enhanced edition of ${baseName}`;
        } else if (relatedNameLower.includes("bundle") ||
          relatedNameLower.includes("collection") ||
          relatedNameLower.includes("pack")) {
          type = "Bundle";
          description = `Bundle containing ${baseName}`;
        } else if (/\s(2|3|4|5|ii|iii|iv|v)\b/.test(relatedNameLower) ||
          relatedNameLower.includes(" sequel") ||
          relatedNameLower.includes(" returns") ||
          relatedNameLower.includes(" continues")) {
          type = "Sequel";
          description = `Sequel to ${baseName}`;
        }

        missingContent.push({
          type,
          description,
          baseGame: baseName,
          name: relatedApp.name,
          appid: relatedApp.appid,
          baseGameAppid: ownedGame.appid,
          steamUrl: `https://store.steampowered.com/app/${relatedApp.appid}/`,
        });
      }
    }

    const uniqueContent = missingContent.filter((content, index, self) =>
      index === self.findIndex(c => c.appid === content.appid)
    );

    const typePriority = { "DLC": 1, "Expansion": 2, "Edition": 3, "Sequel": 4, "Bundle": 5, "Related": 6 };
    uniqueContent.sort((a, b) => {
      const priorityDiff = typePriority[a.type] - typePriority[b.type];

      if (priorityDiff !== 0) return priorityDiff;

      return a.name.localeCompare(b.name);
    });

    return uniqueContent;

  } catch (error) {
    console.error("Error analyzing missing content with Steam data:", error);
    return [];
  }
} 