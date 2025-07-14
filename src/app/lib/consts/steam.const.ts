export const STEAM_API_BASE_URL = "https://api.steampowered.com";

export const STEAM_API_ENDPOINTS = {
  GET_APP_LIST: "/ISteamApps/GetAppList/v2/",
  GET_OWNED_GAMES: "/IPlayerService/GetOwnedGames/v1/",
  RESOLVE_VANITY_URL: "/ISteamUser/ResolveVanityURL/v1/",
  GET_PLAYER_SUMMARIES: "/ISteamUser/GetPlayerSummaries/v2/",
  GET_USER_STATS: "/ISteamUserStats/GetUserStatsForGame/v2/",
} as const;

export const STEAM_QUERY_KEYS = {
  appList: ["steam", "apps"] as const,
  playerData: (input: string) => ["steam", "player", input] as const,
  missingContent: (steamId: string) => ["steam", "missing-content", steamId] as const,
} as const;