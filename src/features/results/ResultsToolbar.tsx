import type { TResultsSearch, TSortOption } from "./search-params";
import type { TResultsSelection } from "./select-results";

import { useDebouncedCallback } from "@tanstack/react-pacer";
import { ArrowDownUp, ChevronsDownUp, ChevronsUpDown, ListTree, Search, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { CATEGORIES, CATEGORY_ORDER } from "./categories";
import { SORT_OPTIONS } from "./search-params";



type TResultsToolbarProps = {
  search: TResultsSearch;
  counts: TResultsSelection["counts"];
  onChange: (patch: Partial<TResultsSearch>, options?: { animate?: boolean }) => void;
  allCollapsed: boolean;
  onToggleAll: () => void;
};

const SORT_ITEMS = SORT_OPTIONS.map(option => ({ value: option.value, label: option.label }));

/**
 * @description
 * Category tabs, name filter, sort and grouping controls of the results list.
 *
 * @param props - Component props.
 * @param props.search - Active filters.
 * @param props.counts - Item counts per category, for the current name filter.
 * @param props.onChange - Updates the filters.
 * @param props.allCollapsed - Whether every group is collapsed.
 * @param props.onToggleAll - Collapses every group, or expands them all when they already are.
 * @returns The toolbar.
 */
export const ResultsToolbar: React.FC<TResultsToolbarProps> = ({ search, counts, onChange, allCollapsed, onToggleAll }) => {
  const [query, setQuery] = useState(search.q);
  const commitQuery = useDebouncedCallback((value: string) => onChange({ q: value }), { wait: 250 });

  const handleQuery = (value: string) => {
    setQuery(value);
    commitQuery(value);
  };

  const tabs = [
    { value: "all", label: "All", count: counts.all },
    ...CATEGORY_ORDER.map(category => ({ value: category, label: CATEGORIES[category].plural, count: counts[category] })),
  ] as const;

  return (
    <div className="space-y-3">
      <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <ToggleGroup
          value={[search.category]}
          onValueChange={(value) => {
            const [category] = value as Array<TResultsSearch["category"]>;

            if (category) {
              onChange({ category }, { animate: true });
            }
          }}
          aria-label="Category"
          spacing={1}
          className="w-max"
        >
          {tabs.map(tab => (
            <ToggleGroupItem
              key={tab.value}
              value={tab.value}
              size="sm"
              className="h-8 gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 data-pressed:border-steam-blue/60 data-pressed:bg-steam-blue/15 data-pressed:text-foreground"
            >
              {tab.label}
              <span className={cn("rounded-full px-1.5 text-[0.7rem] tabular-nums", tab.count > 0 ? "bg-foreground/10" : "text-muted-foreground")}>
                {tab.count}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="h-9 min-w-0 flex-1 basis-56 bg-card/60">
          <InputGroupAddon>
            <Search className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={query}
            onChange={event => handleQuery(event.target.value)}
            placeholder="Filter by name"
            aria-label="Filter by name"
            maxLength={100}
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Clear filter" onClick={() => handleQuery("")}>
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>

        <Select
          items={SORT_ITEMS}
          value={search.sort}
          onValueChange={value => onChange({ sort: value as TSortOption }, { animate: true })}
        >
          <SelectTrigger className="h-9 min-w-0 bg-card/60 data-[size=default]:h-9" aria-label="Sort">
            <ArrowDownUp className="text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_ITEMS.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex">
          <Tooltip>
            <TooltipTrigger
              render={(
                <Toggle
                  pressed={search.group}
                  onPressedChange={group => onChange({ group }, { animate: true })}
                  variant="outline"
                  size="sm"
                  aria-label="Group by game"
                  className={cn("h-9 bg-card/60 data-pressed:border-steam-blue/60 data-pressed:bg-steam-blue/15", search.group && "rounded-r-none")}
                />
              )}
            >
              <ListTree />
              <span className="hidden sm:inline">Group</span>
            </TooltipTrigger>
            <TooltipContent>Group by the game they relate to</TooltipContent>
          </Tooltip>

          {search.group && (
            <Tooltip>
              <TooltipTrigger
                render={(
                  <Button
                    variant="outline"
                    size="icon-lg"
                    onClick={onToggleAll}
                    aria-label={allCollapsed ? "Expand all groups" : "Collapse all groups"}
                    className="rounded-l-none border-l-0 border-steam-blue/60 bg-card/60 animate-in fade-in-0 slide-in-from-left-1"
                  />
                )}
              >
                {allCollapsed ? <ChevronsUpDown /> : <ChevronsDownUp />}
              </TooltipTrigger>
              <TooltipContent>{allCollapsed ? "Expand all groups" : "Collapse all groups"}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};
