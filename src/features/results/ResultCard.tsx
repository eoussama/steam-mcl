import type { TMissingItem } from "@/features/analysis";

import { ExternalLink } from "lucide-react";

import { getStoreUrl } from "@/lib/steam";
import { cn } from "@/lib/utils";

import { CATEGORIES } from "./categories";



type TResultCardProps = {
  entry: TMissingItem;
  description: string;
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

/**
 * @description
 * One missing item, linking to its store page.
 *
 * @param props - Component props.
 * @param props.entry - Missing item.
 * @param props.description - Why the item is listed, such as "DLC for Skyrim".
 * @returns The result card.
 */
export const ResultCard: React.FC<TResultCardProps> = ({ entry, description }) => {
  const category = CATEGORIES[entry.category];
  const Icon = category.icon;

  return (
    <a
      href={getStoreUrl(entry.item.appid)}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 p-2.5 shadow-sm outline-none transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-steam-blue/50 hover:bg-card hover:shadow-md focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:gap-4 sm:p-3"
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
        <div className="flex items-start gap-2">
          <h3 className="line-clamp-2 flex-1 text-sm font-semibold leading-snug transition-colors group-hover:text-link sm:text-base">
            {entry.item.name}
          </h3>
          <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
        </div>

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
  );
};
