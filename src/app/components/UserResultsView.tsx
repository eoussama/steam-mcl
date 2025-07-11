'use client';

import { useState, useEffect } from 'react';
import { Gamepad2, Globe, AlertTriangle, Search, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { ExternalLink } from './ExternalLink';
import { SteamPlayerResponse, useMissingContentAnalysis } from '../hooks/useSteam';
import { getIGDBImageUrl } from '../lib/igdb-api';

export interface UserResultsViewProps {
  data: SteamPlayerResponse;
  onClose: () => void;
}



export const UserResultsView: React.FC<UserResultsViewProps> = ({ data, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [supportsViewTransitions, setSupportsViewTransitions] = useState(false);
  
  // Use the missing content analysis hook
  const { data: missingContentData, isLoading: isAnalyzing, error: analysisError } = useMissingContentAnalysis(data.steamId);

  useEffect(() => {
    setMounted(true);
    setSupportsViewTransitions('startViewTransition' in document);
  }, []);

  const missingContentTypes = {
    DLC: { color: 'bg-purple-500/10 border-purple-500/30 text-purple-400', icon: '🎮' },
    Expansion: { color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400', icon: '📦' },
    Sequel: { color: 'bg-blue-500/10 border-blue-500/30 text-blue-400', icon: '🔄' },
    Prequel: { color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400', icon: '⏪' },
    'Spin-off': { color: 'bg-pink-500/10 border-pink-500/30 text-pink-400', icon: '🌀' },
    Remaster: { color: 'bg-orange-500/10 border-orange-500/30 text-orange-400', icon: '✨' },
    Bundle: { color: 'bg-green-500/10 border-green-500/30 text-green-400', icon: '🎫' }
  };

  const containerClassName = `w-full max-w-4xl space-y-6 flex flex-col h-full ${mounted ? 'animate-fadeInUp' : 'opacity-0'} ${!supportsViewTransitions ? 'page-transition-fallback' : ''}`;

  return (
    <div 
      className={containerClassName}
      style={{ viewTransitionName: supportsViewTransitions ? 'search-morph-container' : undefined }}
    >
      {/* User Info Header */}
      <div 
        className="relative bg-[var(--card-background)]/90 backdrop-blur-xl border border-[var(--card-border)]/50 rounded-2xl shadow-2xl overflow-hidden"
        style={{ viewTransitionName: supportsViewTransitions ? 'search-card' : undefined }}
      >
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
                style={{ viewTransitionName: supportsViewTransitions ? 'search-input' : undefined }}
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
              {isAnalyzing ? <Loader2 size={24} className="text-white animate-spin" /> : <AlertTriangle size={24} className="text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">
                Missing Content
              </h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                {isAnalyzing 
                  ? 'Analyzing your game library...' 
                  : analysisError 
                    ? 'Error analyzing content'
                    : `${missingContentData?.missingContent?.length || 0} items found that you might be interested in`
                }
              </p>
            </div>
          </div>

          {/* Missing Content List - Scrollable */}
          <div className="space-y-4 flex-1 pr-2 scrollbar-thin scrollbar-thumb-steam scrollbar-track-transparent">
            {analysisError ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <AlertTriangle size={48} className="text-red-400 mb-4" />
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Analysis Failed</h3>
                <p className="text-sm text-[var(--foreground-muted)] max-w-md">
                  {analysisError.message.includes('credentials') 
                    ? 'IGDB API is not configured. Please set up your Twitch credentials in the environment variables.'
                    : 'Unable to analyze your game library. Please try again later.'
                  }
                </p>
              </div>
            ) : isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Loader2 size={48} className="text-[var(--steam-accent)] mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Analyzing Your Library</h3>
                <p className="text-sm text-[var(--foreground-muted)] max-w-md">
                  Searching for missing DLC, expansions, sequels, and related content...
                </p>
              </div>
            ) : !missingContentData?.missingContent?.length ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Gamepad2 size={48} className="text-[var(--foreground-muted)] mb-4" />
                                 <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No Missing Content Found</h3>
                 <p className="text-sm text-[var(--foreground-muted)] max-w-md">
                   Great! It looks like you have all the available content for your games, or we couldn&apos;t find any related content in our database.
                 </p>
              </div>
            ) : (
              missingContentData.missingContent.map((item, index) => {
                const typeConfig = missingContentTypes[item.type as keyof typeof missingContentTypes];
              
                return (
                  <div
                    key={item.id}
                    className="group relative p-4 bg-[var(--background-secondary)]/40 hover:bg-[var(--background-secondary)]/60 rounded-xl border border-[var(--card-border)]/30 hover:border-[var(--steam-accent)]/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          {item.coverUrl ? (
                            <div className="relative w-12 h-16 flex-shrink-0">
                              <Image
                                src={getIGDBImageUrl(item.coverUrl, 'thumb')}
                                alt={item.name}
                                fill
                                className="object-cover rounded border border-[var(--card-border)]/30"
                              />
                            </div>
                          ) : (
                            <span className="text-2xl">{typeConfig?.icon || '🎮'}</span>
                          )}
                          <div>
                            <h3 className="font-bold text-[var(--foreground)] group-hover:text-[var(--steam-accent)] transition-colors duration-300">
                              {item.name}
                            </h3>
                            {item.baseGame && (
                              <p className="text-xs text-[var(--foreground-muted)]">
                                Related to: <span className="font-semibold">{item.baseGame}</span>
                              </p>
                            )}
                            {item.releaseDate && (
                              <p className="text-xs text-[var(--foreground-muted)]">
                                Released: {(() => {
                                  try {
                                    const date = new Date(item.releaseDate);
                                    return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Unknown';
                                  } catch {
                                    return 'Unknown';
                                  }
                                })()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                            {item.description.length > 200 
                              ? `${item.description.substring(0, 200)}...` 
                              : item.description
                            }
                          </p>
                        )}
                        
                        {item.platforms && item.platforms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.platforms.slice(0, 3).map((platform, platformIndex) => (
                              <span
                                key={platformIndex}
                                className="px-2 py-1 text-xs bg-[var(--background)] rounded border border-[var(--card-border)]/30"
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        {typeConfig && (
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${typeConfig.color}`}>
                            {item.type}
                          </span>
                        )}
                        <ExternalLink 
                          href={`https://www.igdb.com/games/${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                          className="text-xs text-[var(--steam-accent)] hover:text-[var(--steam-accent)]/80 underline"
                        >
                          View on IGDB
                        </ExternalLink>
                      </div>
                    </div>
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--steam-accent)]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                );
              })
            )}
          </div>
          
          {/* Footer note */}
          <div className="mt-6 p-4 bg-[var(--background-secondary)]/30 rounded-xl border border-[var(--card-border)]/20 flex-shrink-0">
            <p className="text-xs text-[var(--foreground-muted)] text-center">
              <span className="inline-flex items-center space-x-1">
                <span className="w-2 h-2 bg-[var(--steam-accent)] rounded-full animate-pulse" />
                <span>
                  Analysis powered by{' '}
                  <ExternalLink href="https://www.igdb.com/" className="text-[var(--steam-accent)] hover:text-[var(--steam-accent)]/80">
                    IGDB
                  </ExternalLink>
                  {missingContentData?.analyzedGames && (
                    <> • Analyzed {missingContentData.analyzedGames} games</>
                  )}
                </span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 