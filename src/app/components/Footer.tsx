"use client";

import { cn } from "@/lib/helpers";
import { ExternalLink } from "./ExternalLink";
import packageJson from "../../../package.json";



type TFooterProps = {
  mounted: boolean;
}

export const Footer: React.FC<TFooterProps> = ({ mounted }: TFooterProps) => {
  return (
    <div
      style={{ animationDelay: "300ms" }}
      className={cn(
        "relative z-10 text-center py-2 border-t border-[var(--card-border)]/30 bg-[var(--background)]/50 backdrop-blur-sm",
        mounted ? "animate-fadeIn" : "opacity-0",
      )}
    >
      <div className="flex flex-row items-center justify-center gap-1.5 text-xs text-[var(--foreground-muted)] font-medium">
        <span>v{packageJson.version}</span>

        <span>•</span>

        <ExternalLink href={packageJson.author_url}>
          {packageJson.author}
        </ExternalLink>

        <span>•</span>

        <ExternalLink href={packageJson.repository.url}>
          GitHub
        </ExternalLink>
      </div>
    </div>
  );
};