"use client";

import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/lib/context";
import { queryClient } from "@/app/lib/helpers";



type TClientWrapperProps = {
  children: ReactNode;
}

export const ClientWrapper: React.FC<TClientWrapperProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}; 