import type { LucideIcon } from "lucide-react";

import type { TMissingItem } from "@/features/analysis";
import type { TOwnershipStatus } from "@/features/ownership";

import { Check, Eye, EyeOff, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getStoreUrl } from "@/lib/steam";
import { cn } from "@/lib/utils";

import { CATEGORIES } from "./categories";



type TResultCardProps = {
  entry: TMissingItem;
  description: string;
  status: TOwnershipStatus;
  onSetStatus: (appid: number, status: TOwnershipStatus) => void;
};

function PriceTag({ entry }: { entry: TMissingItem }) {
  const { item } = entry;

  if (item.isComingSoon) {
    return <span className="text-xs font-semibold text-muted-foreground">Coming soon</span>;
  }

  if (item.isFree || item.priceCents === 0) {
    return <span className="text-sm font-semibold text-success">Free</span>;
  }

  if (!item.price) {
    return null;
  }

  return (
    <span className="flex items-center gap-1.5">
      {item.discountPercent > 0 && (
        <span className="rounded-md bg-success/15 px-1.5 py-0.5 text-xs font-bold text-success">
          -
          {item.discountPercent}
          %
        </span>
      )}
      <span className="text-sm font-semibold tabular-nums">{item.price}</span>
    </span>
  );
}

type TCardAction = {
  label: string;
  icon: LucideIcon;
  status: TOwnershipStatus;
};

const ACTIONS: Readonly<Record<TOwnershipStatus, ReadonlyArray<TCardAction>>> = {
  missing: [
    { label: "Mark as owned", icon: Check, status: "owned" },
    { label: "Hide", icon: EyeOff, status: "hidden" },
  ],
  owned: [{ label: "Move back to missing", icon: Undo2, status: "missing" }],
  hidden: [{ label: "Show again", icon: Eye, status: "missing" }],
};

/**
 * @description
 * One item, linking to its store page, with actions to mark it owned or hide it. The actions sit beside the link
 * rather than inside it, and show on hover or focus where a mouse is used.
 *
 * @param props - Component props.
 * @param props.entry - Missing item.
 * @param props.description - Why the item is listed, such as "DLC for Skyrim".
 * @param props.status - Ownership status of the item, which decides the actions offered.
 * @param props.onSetStatus - Changes the ownership status of the item.
 * @returns The result card.
 */
export const ResultCard: React.FC<TResultCardProps> = ({ entry, description, status, onSetStatus }) => {
  const category = CATEGORIES[entry.category];
  const Icon = category.icon;

  return (
    <div className="group relative">
      <a
        href={getStoreUrl(entry.item.appid)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 p-2.5 shadow-sm outline-none transition-[background-color,border-color,box-shadow,transform] duration-200 group-hover:-translate-y-px group-hover:border-steam-blue/50 group-hover:bg-card group-hover:shadow-md focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-4 sm:p-3"
      >
        <div className="relative aspect-[460/215] w-28 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-40">
          {entry.item.headerImage
            ? (
                <img
                  src={entry.item.headerImage}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )
            : (
                <div className="flex size-full items-center justify-center">
                  <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
                </div>
              )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className={cn("line-clamp-2 text-sm font-semibold leading-snug transition-colors group-hover:text-link sm:text-base", ACTIONS[status].length > 1 ? "pr-16" : "pr-8")}>
            {entry.item.name}
          </h3>

          <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">{description}</p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset", category.tone)}>
              <Icon className="size-3" aria-hidden="true" />
              {category.label}
            </span>
            <PriceTag entry={entry} />
          </div>
        </div>
      </a>

      <div className="absolute top-2 right-2 flex gap-1 transition-[opacity,transform] duration-200 group-hover:-translate-y-px pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100 sm:top-2.5 sm:right-2.5">
        {ACTIONS[status].map(action => (
          <Tooltip key={action.status}>
            <TooltipTrigger
              render={(
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={`${action.label}: ${entry.item.name}`}
                  onClick={() => onSetStatus(entry.item.appid, action.status)}
                  className="bg-card/90 text-muted-foreground hover:text-foreground"
                />
              )}
            >
              <action.icon />
            </TooltipTrigger>
            <TooltipContent>{action.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
