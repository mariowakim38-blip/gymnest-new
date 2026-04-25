import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BookingProvider } from "@/contexts/BookingContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { RatingProvider } from "@/contexts/RatingContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcReactClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";
    const inAdminGroup = segments[0] === "admin";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/auth/login");
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace(user?.role === "admin" ? "/admin" : "/(tabs)/(home)");
      return;
    }

    if (isAuthenticated && inAdminGroup && user?.role !== "admin") {
      router.replace("/(tabs)/(home)");
    }
  }, [isAuthenticated, isLoading, segments, router, user?.role]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="admin/index" options={{ title: "Admin Panel" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcReactClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BookingProvider>
              <RatingProvider>
                <AdminProvider>
                  <SidebarProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <RootLayoutNav />
                    </GestureHandlerRootView>
                  </SidebarProvider>
                </AdminProvider>
              </RatingProvider>
            </BookingProvider>
          </AuthProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}
