import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider, useAuth } from '@clerk/expo';
import * as SecureStore from 'expo-secure-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import RootNavigator from './src/navigation/RootNavigator';
import { Colors } from './src/theme';

// ─── Clerk token cache (persists across app restarts) ─────────────────────────
const tokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
};

// ─── TanStack Query client ────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2,
    },
  },
});

/**
 * Auth gate — uses useAuth() hook (must live inside ClerkProvider).
 * Shows a spinner until Clerk has loaded, then either shows the
 * main navigator (signed in) or a waiting spinner (signed out).
 */
function AuthGate() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primaryAccent} />
      </View>
    );
  }

  if (!isSignedIn) {
    // Clerk's own UI handles sign-in; show a neutral loading state.
    // Replace this with your own sign-in screen component when ready.
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primaryAccent} />
      </View>
    );
  }

  return <RootNavigator />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    // Lato family
    'Lato_400Regular': require('./assets/font/Lato/Lato-Regular.ttf'),
    'Lato_700Bold': require('./assets/font/Lato/Lato-Bold.ttf'),
    'Lato_900Black': require('./assets/font/Lato/Lato-Black.ttf'),
    // Playfair Display — static files for precise weights
    'PlayfairDisplay_700Bold': require('./assets/font/Playfair_Display/static/PlayfairDisplay-Bold.ttf'),
    'PlayfairDisplay_600SemiBold': require('./assets/font/Playfair_Display/static/PlayfairDisplay-SemiBold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primaryAccent} />
      </View>
    );
  }

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <AuthGate />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryBackground,
  },
});
