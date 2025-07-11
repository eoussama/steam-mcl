'use client';

import { useState, useEffect } from 'react';
import { Gamepad2, Globe, AlertTriangle, Search } from 'lucide-react';
import Image from 'next/image';
import { ExternalLink } from './ExternalLink';
import { SteamPlayerResponse } from '../hooks/useSteam';

export interface UserResultsViewProps {
  data: SteamPlayerResponse;
  onClose: () => void;
}

// Mock missing content data with Steam URLs - replace with actual implementation
const mockMissingContent = [
  {
    id: 1,
    steamAppId: 570,
    name: "Portal 2 DLC",
    type: "DLC",
    baseGame: "Portal 2",
    price: "$9.99",
    description: "Additional test chambers and content for Portal 2"
  },
  {
    id: 2,
    steamAppId: 546560,
    name: "Half-Life: Alyx",
    type: "Sequel",
    baseGame: "Half-Life 2",
    price: "$59.99",
    description: "VR adventure in the Half-Life universe"
  },
  {
    id: 3,
    steamAppId: 730,
    name: "Counter-Strike 2 Premium",
    type: "Premium Content",
    baseGame: "Counter-Strike 2",
    price: "$14.99",
    description: "Premium features and exclusive skins"
  },
  {
    id: 4,
    steamAppId: 570,
    name: "Dota 2 Battle Pass",
    type: "Season Pass",
    baseGame: "Dota 2",
    price: "$9.99",
    description: "Exclusive rewards, features, and content"
  },
  {
    id: 5,
    steamAppId: 550,
    name: "Left 4 Dead 3",
    type: "Sequel",
    baseGame: "Left 4 Dead 2",
    price: "$39.99",
    description: "The highly anticipated sequel to Left 4 Dead 2"
  }
];

export const UserResultsView: React.FC<UserResultsViewProps> = ({ data, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const missingContentTypes = {
    DLC: { color: 'bg-purple-500/10 border-purple-500/30 text-purple-400', icon: '🎮' },
    Sequel: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-400', icon: '🔄' },
    'Premium Content': { color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400', icon: '⭐' },
    'Season Pass': { color: 'bg-green-500/10 border-green-500/30 text-green-400', icon: '🎫' }
  };

  return (
    <div className={`w-full max-w-4xl space-y-6 flex flex-col h-full ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
      {/* User Info Header */}
      <div className="relative bg-[var(--card-background)]/90 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--steam-accent)]/10 via-transparent to-[var(--steam-accent)]/5 opacity-50" />
        
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src={data.player.avatarfull}
                  alt={`${data.player.personaname}'s avatar`}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full border-4 border-[var(--steam-accent)]/30 shadow-xl"
                />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-[var(--foreground)]">
                  {data.player.personaname}
                </h1>
                <p className="text-sm text-[var(--foreground-muted)] font-mono">
                  Steam ID: {data.player.steamid}
                </p>
                {data.ownedGames && (
                  <div className="flex items-center space-x-2 text-[var(--foreground-secondary)]">
                    <Gamepad2 size={16} />
                    <span className="font-semibold">{data.ownedGames.length} games owned</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Steam Profile Button */}
              <ExternalLink 
                href={data.player.profileurl}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-[var(--steam-primary)] hover:bg-[var(--steam-primary)]/80 text-white hover:text-white text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--steam-accent)]/50 shadow-lg hover:shadow-xl"
              >
                <Globe size={16} />
                <span>View Profile</span>
              </ExternalLink>
              
              {/* Back to Search Button */}
              <button
                onClick={onClose}
                className="group relative px-4 py-2 bg-[var(--background-secondary)]/50 hover:bg-[var(--steam-accent)]/10 border border-[var(--card-border)]/30 hover:border-[var(--steam-accent)]/30 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--steam-accent)]/50 cursor-pointer flex items-center space-x-2"
                aria-label="Back to search"
              >
                <Search 
                  size={16} 
                  className="text-[var(--foreground-muted)] group-hover:text-[var(--steam-accent)] transition-colors duration-300" 
                />
                <span className="text-sm font-medium text-[var(--foreground-muted)] group-hover:text-[var(--steam-accent)] transition-colors duration-300">
                  Search Again
                </span>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-[var(--steam-accent)]/20 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 -z-10" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Content Section */}
      <div className="relative bg-[var(--card-background)]/90 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl flex-1 flex flex-col">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--steam-accent)]/5 via-transparent to-[var(--steam-accent)]/10 opacity-50" />
        
        <div className="relative p-6 flex flex-col h-full">
          <div className="flex items-center space-x-3 mb-6 flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--steam-accent)] to-[var(--steam-primary)] rounded-full flex items-center justify-center shadow-xl">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">
                Missing Content
              </h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                {mockMissingContent.length} items found that you might be interested in
              </p>
            </div>
          </div>

          {/* Missing Content List - Scrollable */}
          <div className="space-y-4 flex-1 pr-2 scrollbar-thin scrollbar-thumb-steam scrollbar-track-transparent">
            {mockMissingContent.map((item, index) => {
              const typeConfig = missingContentTypes[item.type as keyof typeof missingContentTypes];
              
              return (
                <a
                  key={item.id}
                  href={`https://store.steampowered.com/app/${item.steamAppId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-4 bg-[var(--background-secondary)]/40 hover:bg-[var(--background-secondary)]/60 rounded-xl border border-[var(--card-border)]/30 hover:border-[var(--steam-accent)]/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer block"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{typeConfig.icon}</span>
                        <div>
                          <h3 className="font-bold text-[var(--foreground)] group-hover:text-[var(--steam-accent)] transition-colors duration-300">
                            {item.name}
                          </h3>
                          <p className="text-xs text-[var(--foreground-muted)]">
                            Related to: <span className="font-semibold">{item.baseGame}</span>
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${typeConfig.color}`}>
                        {item.type}
                      </span>
                      <span className="text-lg font-black text-[var(--steam-accent)]">
                        {item.price}
                      </span>
                    </div>
                  </div>
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--steam-accent)]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </a>
              );
            })}
          </div>
          
          {/* Footer note */}
          <div className="mt-6 p-4 bg-[var(--background-secondary)]/30 rounded-xl border border-[var(--card-border)]/20 flex-shrink-0">
            <p className="text-xs text-[var(--foreground-muted)] text-center">
              <span className="inline-flex items-center space-x-1">
                <span className="w-2 h-2 bg-[var(--steam-accent)] rounded-full animate-pulse" />
                <span>Analysis based on your owned games and Steam community data</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 