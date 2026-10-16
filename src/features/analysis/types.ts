import type { TOwnedGame, TRelatedKind, TStoreItem } from "@/lib/steam";



export type TMissingCategory = "dlc" | "soundtrack" | "edition" | "franchise" | "studio";

export type TMissingItem = {
  item: TStoreItem;
  category: TMissingCategory;
  /**
   * Owned app ids this item relates to, such as the base game of a DLC.
   */
  relatedTo: Array<number>;
};

export type TCandidateRelations = {
  dlc: Set<number>;
  franchise: Set<number>;
  studio: Set<number>;
};

export type TAnalysisPhase = "idle" | "library" | "scanning" | "done";

export type TAnalysisState = {
  phase: TAnalysisPhase;
  done: number;
  total: number;
  failed: number;
  /**
   * When Steam is rate limiting, the time the analysis resumes at, in epoch milliseconds.
   */
  pausedUntil: number | null;
  items: ReadonlyMap<number, TMissingItem>;
  error: string | null;
};

export type TAnalysisSources = {
  /**
   * Store metadata of the given apps, unknown apps are omitted.
   */
  items: (appids: ReadonlyArray<number>) => Promise<Array<TStoreItem>>;
  /**
   * Paid DLC of several base games at once, keyed by base game.
   */
  dlcBatch: (appids: ReadonlyArray<number>) => Promise<Record<number, Array<number>>>;
  /**
   * Complete DLC list of one base game, soundtracks included.
   */
  dlc: (appid: number) => Promise<Array<number>>;
  /**
   * Apps sharing a franchise, developer or publisher.
   */
  related: (kind: TRelatedKind, name: string) => Promise<Array<number>>;
};

export type TAnalysisInput = {
  games: ReadonlyArray<TOwnedGame>;
};
