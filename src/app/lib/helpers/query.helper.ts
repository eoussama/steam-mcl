/**
 * React Query Client Configuration
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Steam API data is relatively stable, so we can cache for a bit longer
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      
      // Retry configuration for API calls
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      
      // Network settings
      networkMode: 'online',
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      // Most Steam API calls are read-only, but keeping mutation config for future use
      retry: 1,
      networkMode: 'online',
    },
  },
}); 