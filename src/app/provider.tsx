import type { PropsWithChildren } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';

import { queryClient } from '@/lib/query-client';

import { appTheme, navigationTheme } from './theme';

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <PaperProvider theme={appTheme}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={navigationTheme}>{children}</NavigationContainer>
      </QueryClientProvider>
    </PaperProvider>
  );
}
