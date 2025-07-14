export type TSteamApp = {
  appid: number;
  name: string;
}

export type TSteamUser = {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
}

export type TOwnedGame = {
  appid: number;
  name?: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url?: string;
  img_logo_url?: string;
}

export type TSteamMissingContent = {
  appid: number;
  name: string;
  type: "DLC" | "Expansion" | "Sequel" | "Edition" | "Bundle" | "Related";
  baseGame: string;
  baseGameAppid: number;
  description: string;
  steamUrl: string;
}

export type TGetAppListResponse = {
  applist: {
    apps: Array<TSteamApp>;
  };
}

export type TGetPlayerSummariesResponse = {
  response: {
    players: Array<TSteamUser>;
  };
}

export type TGetOwnedGamesResponse = {
  response: {
    game_count: number;
    games: Array<TOwnedGame>;
  };
}

export type TResolveVanityURLResponse = {
  response: {
    steamid?: string;
    success: number;
    message?: string;
  };
}