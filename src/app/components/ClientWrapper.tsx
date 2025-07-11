'use client';

import { ThemeProvider } from '../lib/theme-context';
import { ReactNode } from 'react';

interface ClientWrapperProps {
  children: ReactNode;
}

export const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  return (
    <ThemeProvider defaultTheme="system">
      {children}
    </ThemeProvider>
  );
}; 