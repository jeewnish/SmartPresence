import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  DevSettings,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { resourceCache } from '@clerk/expo/resource-cache';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import RootNavigator from './src/navigation/RootNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { Colors } from './src/theme';

// ─── Clerk token cache (persists across app restarts) ─────────────────────────
// ─── TanStack Query client ────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2,
    },
  },
});


function AuthGate() {
  // A newly-created Clerk session can briefly be "pending" while Clerk
  // finishes session tasks. Treating it as signed out leaves the auth
  // navigator mounted after a successful finalize(), which looks like the
  // sign-in/sign-up buttons did nothing.
  const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false });
  const [timedOut, setTimedOut] = useState(false);

  const resetClerkSession = async () => {
    await tokenCache?.clearToken?.('__clerk_client_jwt');
    DevSettings.reload();
  };

  useEffect(() => {
    if (isLoaded) {
      setTimedOut(false);
      return undefined;
    }

    const timeoutId = setTimeout(() => setTimedOut(true), 12000);
    return () => clearTimeout(timeoutId);
  }, [isLoaded]);

  if (!isLoaded) {
    if (timedOut) {
      return (
        <View style={styles.center}>
          <Text style={styles.startupTitle}>Sign-in service unavailable</Text>
          <Text style={styles.startupMessage}>
            Clerk did not finish loading. Check your internet connection and restart the app.
          </Text>
          <Pressable style={styles.resetButton} onPress={resetClerkSession}>
            <Text style={styles.resetButtonLabel}>Reset sign-in session</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primaryAccent} />
        <Text style={styles.loadingLabel}>Starting SmartPresence…</Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return <AuthNavigator />;
  }

  return <RootNavigator />;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    // Lato family
    'Lato_400Regular': require('./assets/font/Lato/Lato-Regular.ttf'),
    'Lato_700Bold': require('./assets/font/Lato/Lato-Bold.ttf'),
    'Lato_900Black': require('./assets/font/Lato/Lato-Black.ttf'),
    // Playfair Display — static files for precise weights
    'PlayfairDisplay_700Bold': require('./assets/font/Playfair_Display/static/PlayfairDisplay-Bold.ttf'),
    'PlayfairDisplay_600SemiBold': require('./assets/font/Playfair_Display/static/PlayfairDisplay-SemiBold.ttf'),
  });

  if (fontError) {
    return (
      <View style={styles.center}>
        <Text style={styles.startupTitle}>App resources could not load</Text>
        <Text style={styles.startupMessage}>{fontError.message}</Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primaryAccent} />
        <Text style={styles.loadingLabel}>Loading app resources…</Text>
      </View>
    );
  }
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable.");
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
      __experimental_resourceCache={resourceCache}
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
    padding: 24,
  },
  loadingLabel: {
    marginTop: 12,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  startupTitle: {
    fontFamily: 'Lato_700Bold',
    fontSize: 18,
    color: Colors.primaryText,
    textAlign: 'center',
  },
  startupMessage: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: 8,
  },
  resetButton: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: Colors.primaryAccent,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  resetButtonLabel: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    color: Colors.elevatedSurface,
  },
});
