import type { ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/lib/context";
import { queryClient } from "@/lib/helpers";



type TClientWrapperProps = {
  children: ReactNode;
};

/**
 * @description
 * Wraps the application with its client side providers.
 *
 * @param props - Component props.
 * @param props.children - Content rendered inside the providers.
 * @returns The wrapped content.
 */
export const ClientWrapper: React.FC<TClientWrapperProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};
