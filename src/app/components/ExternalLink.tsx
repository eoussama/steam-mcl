"use client";

import { type ReactNode } from "react";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";

import { cn } from "@/lib/helpers";



type TExternalLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
}

export const ExternalLink: React.FC<TExternalLinkProps> = ({
  href,
  children,
  className = "",
  showIcon = true
}) => {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-[var(--steam-accent)] font-semibold hover:text-[var(--steam-hover)]transition-all duration-300 cursor-pointer hover:underline hover:scale-105 inline-flex items-center group",
        className
      )}
    >
      {children}
      {showIcon && (
        <span className="overflow-hidden transition-all duration-300 w-0 group-hover:w-4 group-hover:ml-1">
          <ExternalLinkIcon 
            size={12} 
            className="flex-shrink-0" 
          />
        </span>
      )}
    </a>
  );
}; 