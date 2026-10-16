export type TStoreItemType = "game" | "dlc" | "music" | "software" | "episode" | "other";

export type TStoreItem = {
  appid: number;
  name: string;
  type: TStoreItemType;
  parentAppid: number | null;
  franchises: Array<string>;
  developers: Array<string>;
  publishers: Array<string>;
  headerImage: string | null;
  capsuleImage: string | null;
  price: string | null;
  discountPercent: number;
  isFree: boolean;
  isComingSoon: boolean;
  releaseDate: number | null;
  isPurchasable: boolean;
};

export type TSteamProfile = {
  steamId: string;
  vanity: string | null;
  name: string;
  avatar: string;
  profileUrl: string;
  isPublic: boolean;
};

export type TOwnedGame = {
  appid: number;
  name: string;
  playtimeMinutes: number;
  lastPlayed: number | null;
};

export type TLibrary = {
  games: Array<TOwnedGame>;
  isPrivate: boolean;
};

export type TRelatedKind = "franchise" | "developer" | "publisher";
