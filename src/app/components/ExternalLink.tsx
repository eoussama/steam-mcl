'use client';

import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
}

export const ExternalLink: React.FC<ExternalLinkProps> = ({ 
  href, 
  children, 
  className = '',
  showIcon = true 
}) => {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        text-[var(--steam-accent)] font-semibold 
        hover:text-[var(--steam-hover)]
        transition-all duration-300 
        cursor-pointer hover:underline hover:scale-105 
        inline-flex items-center group
        ${className}
      `}
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