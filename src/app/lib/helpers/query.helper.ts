import { QueryClient } from "@tanstack/react-query";



export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)

      // Retry configuration for API calls
      retry: (failureCount, error) => {
        // Don"t retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes("4")) {
          return false;
        }

        return failureCount < 3;
      },

      // Network settings
      networkMode: "online",
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  },
}); 