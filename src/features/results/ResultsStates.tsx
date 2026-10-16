import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Lock, PackageCheck, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";



type TStateProps = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  action?: ReactNode;
};

/**
 * @description
 * Centered empty or error state of the results area.
 *
 * @param props - Component props.
 * @param props.icon - Illustration icon.
 * @param props.title - Short headline.
 * @param props.children - Explanation.
 * @param props.action - Optional call to action.
 * @returns The state panel.
 */
export const ResultsState: React.FC<TStateProps> = ({ icon: Icon, title, children, action }) => (
  <Empty className="rounded-2xl border border-dashed border-border/70 bg-card/40 py-12">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Icon />
      </EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{children}</EmptyDescription>
    </EmptyHeader>
    {action && <EmptyContent>{action}</EmptyContent>}
  </Empty>
);

/**
 * @description
 * Shown when a library is private, explaining how to make it readable.
 *
 * @returns The private library state.
 */
export const PrivateLibraryState: React.FC = () => (
  <ResultsState
    icon={Lock}
    title="This library is private"
    action={(
      <Button
        variant="outline"
        render={<a href="https://steamcommunity.com/my/edit/settings" target="_blank" rel="noopener noreferrer" />}
      >
        Open Steam privacy settings
      </Button>
    )}
  >
    Set
    {" "}
    <strong>Game details</strong>
    {" "}
    to Public in your Steam privacy settings, then reload this page.
  </ResultsState>
);

/**
 * @description
 * Shown when the analysis finished without finding anything.
 *
 * @returns The complete library state.
 */
export const NothingMissingState: React.FC = () => (
  <ResultsState icon={PackageCheck} title="Nothing missing">
    You already own everything related to your games on the Steam store.
  </ResultsState>
);

/**
 * @description
 * Shown when filters hide every result.
 *
 * @param props - Component props.
 * @param props.onReset - Clears the filters.
 * @returns The no match state.
 */
export const NoMatchState: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <ResultsState icon={SearchX} title="No matches" action={<Button variant="outline" onClick={onReset}>Clear filters</Button>}>
    Nothing matches the current filters.
  </ResultsState>
);

/**
 * @description
 * Placeholder rows shown before the first results arrive.
 *
 * @returns The skeleton list.
 */
export const ResultsSkeleton: React.FC = () => (
  <div className="space-y-2.5" aria-hidden="true">
    {["a", "b", "c", "d", "e"].map((key, index) => (
      <div key={key} className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-3" style={{ opacity: 1 - index * 0.15 }}>
        <Skeleton className="aspect-[460/215] w-28 rounded-lg sm:w-40" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4" style={{ width: `${70 - index * 8}%` }} />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    ))}
  </div>
);
