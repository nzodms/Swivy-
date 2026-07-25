import { Fraunces_500Medium, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Platform } from 'react-native';

import { Toast } from '@/components';
import { WebAppFrame } from '@/components/WebAppFrame';
import { useStoresHydrated } from '@/hooks/useStoreHydration';
import { useSessionLifecycle } from '@/features/analytics/track';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
  });
  const storesHydrated = useStoresHydrated();
  const ready = fontsLoaded && storesHydrated;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <WebAppFrame>
            <SessionTracker />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
              <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="similar/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen
                name="modals/filters"
                options={
                  Platform.OS === 'ios'
                    ? { presentation: 'formSheet', sheetAllowedDetents: [0.6], sheetCornerRadius: 28 }
                    : { presentation: 'modal' }
                }
              />
              <Stack.Screen name="dev/diagnostics" options={{ presentation: 'modal' }} />
            </Stack>
            <Toast />
          </WebAppFrame>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Démarre/termine la session analytics au montage de l'app. */
function SessionTracker() {
  useSessionLifecycle();
  return null;
}
