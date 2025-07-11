'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, Wifi, User, Clock } from 'lucide-react';

export const ErrorMessage: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const fullErrorMessage = "Http failure response for https://cors-anywhere.herokuapp.com/http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=368F4B94FC9034A9A0261EA60AF74BB0&vanityurl=eoussama: 403 Forbidden";
  const shortErrorMessage = "Http failure response: 403 Forbidden";

  const solutions = [
    { icon: Wifi, text: "Check your network connection" },
    { icon: User, text: "Verify the Steam profile exists" },
    { icon: Clock, text: "Try again in a few moments" }
  ];

  return (
    <div className="relative animate-fadeInUp" style={{ animationDelay: '200ms' }}>
      <div className="bg-gradient-to-r from-[var(--error)]/10 via-[var(--warning)]/10 to-[var(--error)]/10 border border-[var(--warning)]/40 rounded-2xl p-6 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start space-x-5">
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-[var(--warning)] to-[var(--error)] rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle 
                size={28} 
                className="text-white animate-pulse group-hover:animate-bounce" 
              />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                API Request Failed
              </h3>
              <span className="px-3 py-1 text-xs font-bold bg-[var(--error)]/20 text-[var(--error)] rounded-full border border-[var(--error)]/40 animate-pulse">
                Error 403
              </span>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed font-mono bg-[var(--background-secondary)]/30 p-3 rounded-lg border border-[var(--card-border)]/50">
                {isExpanded ? fullErrorMessage : shortErrorMessage}
              </p>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center space-x-2 text-sm text-[var(--steam-accent)] hover:text-[var(--steam-hover)] transition-all duration-300 font-semibold hover:scale-105"
              >
                <span>{isExpanded ? 'Show less' : 'Show more details'}</span>
                <ChevronDown 
                  size={16}
                  className={`transition-all duration-300 ${isExpanded ? 'rotate-180 scale-110' : 'group-hover:scale-110'}`}
                />
              </button>
            </div>
            
            {isExpanded && (
              <div className="mt-6 p-4 bg-[var(--background-secondary)]/60 rounded-xl border border-[var(--card-border)]/50 animate-fadeIn backdrop-blur-sm">
                <p className="text-sm text-[var(--foreground-muted)] mb-4 font-semibold flex items-center space-x-2">
                  <span className="w-2 h-2 bg-[var(--steam-accent)] rounded-full animate-pulse" />
                  <span>Possible solutions:</span>
                </p>
                <ul className="space-y-3">
                  {solutions.map((solution, index) => {
                    const IconComponent = solution.icon;
                    return (
                      <li 
                        key={index}
                        className="flex items-center space-x-3 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors duration-200 p-2 rounded-lg hover:bg-[var(--background-secondary)]/40"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <IconComponent 
                          size={16} 
                          className="text-[var(--steam-accent)] flex-shrink-0" 
                        />
                        <span>{solution.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced decorative glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--warning)]/10 to-[var(--error)]/10 rounded-2xl blur-xl -z-10 group-hover:blur-2xl transition-all duration-300" />
    </div>
  );
}; 