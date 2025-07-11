'use client';

import { useState } from 'react';

export const ErrorMessage: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fullErrorMessage = "Http failure response for https://cors-anywhere.herokuapp.com/http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=368F4B94FC9034A9A0261EA60AF74BB0&vanityurl=eoussama: 403 Forbidden";
  const shortErrorMessage = "Http failure response: 403 Forbidden";

  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-[var(--error)]/10 to-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--warning)] to-[var(--error)] rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white animate-pulse"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                API Request Failed
              </h3>
              <span className="px-2 py-1 text-xs font-medium bg-[var(--error)]/20 text-[var(--error)] rounded-full border border-[var(--error)]/30">
                Error 403
              </span>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                {isExpanded ? fullErrorMessage : shortErrorMessage}
              </p>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center space-x-1 text-xs text-[var(--steam-accent)] hover:text-[var(--steam-hover)] transition-colors duration-200 font-medium"
              >
                <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                <svg 
                  className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {isExpanded && (
              <div className="mt-4 p-3 bg-[var(--background-secondary)] rounded-lg border border-[var(--card-border)]">
                <p className="text-xs text-[var(--foreground-muted)] mb-2 font-medium">
                  Possible solutions:
                </p>
                <ul className="text-xs text-[var(--foreground-muted)] space-y-1">
                  <li className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-[var(--steam-accent)] rounded-full mt-2 flex-shrink-0" />
                    <span>Check your network connection</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-[var(--steam-accent)] rounded-full mt-2 flex-shrink-0" />
                    <span>Verify the Steam profile exists</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1 h-1 bg-[var(--steam-accent)] rounded-full mt-2 flex-shrink-0" />
                    <span>Try again in a few moments</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--warning)]/5 to-[var(--error)]/5 rounded-2xl blur-xl -z-10" />
    </div>
  );
}; 