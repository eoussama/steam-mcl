'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../lib/theme-context';
import { queryClient } from '../lib/react-query-client';
import { ReactNode } from 'react';

interface ClientWrapperProps {
  children: ReactNode;
}

export const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}; 