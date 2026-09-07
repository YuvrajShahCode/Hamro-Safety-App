import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "@/store/authStore";
import { subscribeToNetworkStatus } from "@/utils/network";
import { flushRetryQueue } from "@/services/api/retryQueue";
import { apiClient } from "@/services/api/client";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await restoreSession();
      setReady(true);
      await SplashScreen.hideAsync().catch(() => {});
    })();

    const unsubscribe = subscribeToNetworkStatus((online) => {
      if (online) {
        flushRetryQueue(async (op) => {
          try {
            if (op.kind === "sync_emergency_event") {
              await apiClient.post("/emergency", op.payload);
              return true;
            }
            return false;
          } catch {
            return false;
          }
        });
      }
    });

    return unsubscribe;
  }, [restoreSession]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </ErrorBoundary>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
