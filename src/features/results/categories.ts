import type { LucideIcon } from "lucide-react";

import type { TMissingCategory } from "@/features/analysis";

import { Disc3, Download, Layers, Sparkles, Users } from "lucide-react";



export type TCategoryConfig = {
  label: string;
  plural: string;
  icon: LucideIcon;
  /**
   * Badge and accent classes, tuned for both themes.
   */
  tone: string;
  describe: (names: string) => string;
};

export const CATEGORY_ORDER: ReadonlyArray<TMissingCategory> = ["dlc", "soundtrack", "edition", "franchise", "studio"];

export const CATEGORIES: Readonly<Record<TMissingCategory, TCategoryConfig>> = {
  dlc: {
    label: "DLC",
    plural: "DLC",
    icon: Download,
    tone: "bg-violet-500/12 text-violet-700 ring-violet-500/25 dark:text-violet-300",
    describe: names => `DLC for ${names}`,
  },
  soundtrack: {
    label: "Soundtrack",
    plural: "Soundtracks",
    icon: Disc3,
    tone: "bg-pink-500/12 text-pink-700 ring-pink-500/25 dark:text-pink-300",
    describe: names => `Soundtrack of ${names}`,
  },
  edition: {
    label: "Edition",
    plural: "Editions",
    icon: Sparkles,
    tone: "bg-amber-500/14 text-amber-800 ring-amber-500/30 dark:text-amber-300",
    describe: names => `Another edition of ${names}`,
  },
  franchise: {
    label: "Franchise",
    plural: "Franchise",
    icon: Layers,
    tone: "bg-sky-500/12 text-sky-700 ring-sky-500/25 dark:text-sky-300",
    describe: names => `Same franchise as ${names}`,
  },
  studio: {
    label: "Studio",
    plural: "Studios",
    icon: Users,
    tone: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
    describe: names => `From the studio behind ${names}`,
  },
};
