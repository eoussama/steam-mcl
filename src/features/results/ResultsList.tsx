import type { TResultRow } from "./select-results";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, Gamepad2 } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { ResultCard } from "./ResultCard";



type TResultsListProps = {
  rows: ReadonlyArray<TResultRow>;
  collapsed: ReadonlySet<string>;
  onToggleGroup: (key: string) => void;
};

type TGroupRow = Extract<TResultRow, { kind: "group" }>;

const ITEM_ESTIMATE = 104;
const GROUP_ESTIMATE = 48;

/**
 * @description
 * Drops the items of collapsed groups, keeping their headers.
 *
 * @param rows - Group headers and items.
 * @param collapsed - Keys of the collapsed groups.
 * @returns The rows to display.
 */
function getVisibleRows(rows: ReadonlyArray<TResultRow>, collapsed: ReadonlySet<string>): ReadonlyArray<TResultRow> {
  if (collapsed.size === 0) {
    return rows;
  }

  let isHidden = false;

  return rows.filter((row) => {
    if (row.kind === "group") {
      isHidden = collapsed.has(row.key);

      return true;
    }

    return !isHidden;
  });
}

/**
 * @description
 * Heading of a group of results, toggling the group when pressed.
 *
 * @param props - Component props.
 * @param props.row - Group row.
 * @param props.isCollapsed - Whether the group items are hidden.
 * @param props.onToggle - Toggles the group.
 * @returns The group heading.
 */
const GroupHeading: React.FC<{ row: TGroupRow; isCollapsed: boolean; onToggle: () => void }> = ({ row, isCollapsed, onToggle }) => (
  <h3 className="pt-3 pb-1">
    <button
      type="button"
      aria-expanded={!isCollapsed}
      onClick={onToggle}
      className="group/heading flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left text-sm font-semibold outline-none transition-colors hover:text-link focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ChevronDown
        className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover/heading:text-link", isCollapsed && "-rotate-90")}
        aria-hidden="true"
      />
      <Gamepad2 className="size-4 shrink-0 text-steam-blue" aria-hidden="true" />
      <span className="truncate">{row.name}</span>
      <span className="rounded-full bg-foreground/10 px-1.5 text-xs tabular-nums text-muted-foreground">{row.count}</span>
    </button>
  </h3>
);

/**
 * @description
 * Virtualized list of results scrolling with the page, so thousands of items stay smooth. Groups collapse from
 * their heading.
 *
 * @param props - Component props.
 * @param props.rows - Group headers and items to display.
 * @param props.collapsed - Keys of the collapsed groups.
 * @param props.onToggleGroup - Collapses or expands a group.
 * @returns The list.
 */
export const ResultsList: React.FC<TResultsListProps> = ({ rows, collapsed, onToggleGroup }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  const visibleRows = useMemo(() => getVisibleRows(rows, collapsed), [rows, collapsed]);

  useLayoutEffect(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    const update = () => setScrollMargin(list.getBoundingClientRect().top + window.scrollY);
    const observer = new ResizeObserver(update);

    update();
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: visibleRows.length,
    estimateSize: index => (visibleRows[index]?.kind === "group" ? GROUP_ESTIMATE : ITEM_ESTIMATE),
    getItemKey: index => visibleRows[index]?.key ?? index,
    overscan: 8,
    scrollMargin,
  });

  return (
    <div ref={listRef} role="list" className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
      {virtualizer.getVirtualItems().map((virtual) => {
        const row = visibleRows[virtual.index];

        if (!row) {
          return null;
        }

        return (
          <div
            key={virtual.key}
            ref={virtualizer.measureElement}
            data-index={virtual.index}
            role="listitem"
            className="absolute top-0 left-0 w-full pb-2.5"
            style={{ transform: `translateY(${virtual.start - virtualizer.options.scrollMargin}px)` }}
          >
            {row.kind === "group"
              ? <GroupHeading row={row} isCollapsed={collapsed.has(row.key)} onToggle={() => onToggleGroup(row.key)} />
              : <ResultCard entry={row.entry} description={row.description} />}
          </div>
        );
      })}
    </div>
  );
};
