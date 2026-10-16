import type { TAnalysisState } from "./types";

import type { TOwnedGame } from "@/lib/steam";

import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "@tanstack/react-store";
import { useCallback, useEffect, useMemo } from "react";

import { isRateLimitError } from "@/lib/query/retry";
import { useTRPC, useTRPCClient } from "@/lib/trpc";

import { LibraryAnalyzer } from "./analyzer";
import { createAnalysisSources } from "./sources";



/**
 * @description
 * Waits for the page transition in progress, if any. Its morph needs the main thread on every frame, and a cached
 * analysis starting alongside it would stall it on its first, blurry frames.
 *
 * @returns A promise resolving once no view transition is running.
 */
function afterViewTransition(): Promise<void> {
  const transition = (document as { activeViewTransition?: ViewTransition | null }).activeViewTransition;

  return transition ? transition.finished.then(() => undefined, () => undefined) : Promise.resolve();
}

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

    let isCancelled = false;

    void afterViewTransition().then(() => {
      if (!isCancelled) {
        void analyzer.run(games);
      }
    });

    return () => {
      isCancelled = true;
      analyzer.abort();
    };
  }, [analyzer, games]);

  const restart = useCallback(() => {
    if (games) {
      void analyzer.run(games);
    }
  }, [analyzer, games]);

  const state = useSelector(analyzer.store);

  return useMemo(() => ({ ...state, restart }), [state, restart]);
}
