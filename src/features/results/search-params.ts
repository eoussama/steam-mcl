import { z } from "@/lib/zod";



export const SORT_OPTIONS = [
  { value: "relevance", label: "Most played first" },
  { value: "name", label: "Name" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "release", label: "Newest first" },
] as const;

export type TSortOption = (typeof SORT_OPTIONS)[number]["value"];

export const RESULTS_SEARCH_DEFAULTS = {
  category: "all",
  q: "",
  sort: "relevance",
  group: false,
  view: "missing",
  wishlist: false,
} as const;

/**
 * Filters of the results page, kept in the URL so views can be shared and survive reloads. Invalid values fall
 * back to their defaults instead of failing the page.
 */
export const resultsSearchSchema = z.object({
  category: z.enum(["all", "dlc", "soundtrack", "edition", "franchise", "studio"]).default("all").catch("all"),
  q: z.string().max(100).default("").catch(""),
  sort: z.enum(["relevance", "name", "price-asc", "price-desc", "release"]).default("relevance").catch("relevance"),
  group: z.boolean().default(false).catch(false),
  view: z.enum(["missing", "owned", "hidden"]).default("missing").catch("missing"),
  wishlist: z.boolean().default(false).catch(false),
});

export type TResultsSearch = z.infer<typeof resultsSearchSchema>;
