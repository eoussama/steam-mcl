import type { TAnalysisState } from "./types";

import type { TOwnedGame } from "@/lib/steam";

import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "@tanstack/react-store";
import { useCallback, useEffect, useMemo } from "react";

import { isRateLimitError } from "@/lib/query/retry";
import { useTRPC, useTRPCClient } from "@/lib/trpc";

import { LibraryAnalyzer } from "./analyzer";
import { createAnalysisSources } from "./sources";



export type TLibraryAnalysis = TAnalysisState & {
  /**
   * Runs the analysis again, reusing every cached lookup.
   */
  restart: () => void;
};

/**
 * @description
 * Runs the missing content analysis for a library and exposes its progressive state.
 *
 * @param games - Games in the library, the analysis starts once they are available.
 * @returns The current analysis state and a way to restart it.
 */
export function useLibraryAnalysis(games: ReadonlyArray<TOwnedGame> | undefined): TLibraryAnalysis {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();

  const analyzer = useMemo(
    () => new LibraryAnalyzer(
      createAnalysisSources({ queryClient, trpc, trpcClient }),
      { isRateLimited: isRateLimitError },
    ),
    [queryClient, trpc, trpcClient],
  );

  useEffect(() => {
    if (!games) {
      return;
    }

    void analyzer.run(games);

    return () => analyzer.abort();
  }, [analyzer, games]);

  const restart = useCallback(() => {
    if (games) {
      void analyzer.run(games);
    }
  }, [analyzer, games]);

  const state = useSelector(analyzer.store);

  return useMemo(() => ({ ...state, restart }), [state, restart]);
}
