import type { PropsWithChildren } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider } from "react-native-paper";

import { queryClient } from "../shared/lib/query-client";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <PaperProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>{children}</NavigationContainer>
      </QueryClientProvider>
    </PaperProvider>
  );
}
