import type { TAnalysisState } from "./types";

import type { TOwnedGame } from "@/lib/steam";

import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "@tanstack/react-store";
import { useEffect, useMemo } from "react";

import { isRateLimitError } from "@/lib/query/retry";
import { useTRPC, useTRPCClient } from "@/lib/trpc";

import { LibraryAnalyzer } from "./analyzer";
import { createAnalysisSources } from "./sources";



/**
 * @description
 * Runs the missing content analysis for a library and exposes its progressive state.
 *
 * @param games - Games in the library, the analysis starts once they are available.
 * @returns The current analysis state.
 */
export function useLibraryAnalysis(games: ReadonlyArray<TOwnedGame> | undefined): TAnalysisState {
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

  return useSelector(analyzer.store);
}
