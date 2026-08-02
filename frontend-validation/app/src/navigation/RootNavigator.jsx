import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth, useUser } from '@clerk/expo';

import { deviceApi, setAuthTokenProvider, userApi } from '../config/api';
import { getDeviceIdentity } from '../services/deviceIdentity';
import useUserStore from '../store/userStore';
import { USER_ROLES, normalizeUserRole } from '../auth-space/roles';
import { Colors, Typography } from '../theme';

import StudentTabs from './StudentTabs';
import LecturerTabs from './LecturerTabs';

const Stack = createNativeStackNavigator();
const PROFILE_LOAD_TIMEOUT_MS = 12000;

function withTimeout(promise, timeoutMs, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export default function RootNavigator() {
  const { isSignedIn, getToken, signOut } = useAuth({
    treatPendingAsSignedOut: false,
  });
  const { user: clerkUser, isLoaded } = useUser();
  const { user, isLoading, setUser, setLoading, clear } = useUserStore();
  const [clerkProfileTimedOut, setClerkProfileTimedOut] = useState(false);
  const profileSyncUserIdRef = useRef(null);
  const clerkRole = normalizeUserRole(clerkUser?.publicMetadata?.role);
  const userRole =
    normalizeUserRole(user?.role) ??
    (clerkRole === USER_ROLES.LECTURER ? USER_ROLES.LECTURER : USER_ROLES.STUDENT);

  const returnToSignIn = async () => {
    clear();

    try {
      await signOut();
    } catch (error) {
      console.error('Clerk sign-out failed:', error);
    }
  };

  useEffect(() => {
    setAuthTokenProvider(getToken);
    return () => setAuthTokenProvider(null);
  }, [getToken]);

  useEffect(() => () => clear(), [clear]);

  useEffect(() => {
    if (isLoaded) {
      setClerkProfileTimedOut(false);
      return undefined;
    }

    const timeoutId = setTimeout(() => setClerkProfileTimedOut(true), 12000);
    return () => clearTimeout(timeoutId);
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      profileSyncUserIdRef.current = null;
      clear();
      return;
    }

    const clerkUserId = clerkUser?.id;
    if (!clerkUserId) return;

    if (
      user?.clerkUserId === clerkUserId ||
      profileSyncUserIdRef.current === clerkUserId
    ) {
      return;
    }

    let cancelled = false;
    profileSyncUserIdRef.current = clerkUserId;

    const syncProfile = async () => {
      setLoading(true);

      try {
        let profile;

        try {
          profile = await withTimeout(
            userApi.getMe(),
            PROFILE_LOAD_TIMEOUT_MS,
            'SmartPresence profile request timed out'
          );
        } catch (error) {
          if (error?.response?.status !== 404 || !clerkUser) {
            throw error;
          }

          profile = await withTimeout(
            userApi.onboard({
              email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
              firstName: clerkUser.firstName ?? '',
              lastName: clerkUser.lastName ?? '',
              universityId: clerkUser.username ?? '',
            }),
            PROFILE_LOAD_TIMEOUT_MS,
            'SmartPresence profile creation timed out'
          );
        }

        if (!cancelled) {
          setUser(profile);
        }
      } catch (error) {
        console.error(
          'SmartPresence profile sync failed:',
          error?.response?.status,
          error?.response?.data ?? error?.message
        );
        if (!cancelled) {
          profileSyncUserIdRef.current = null;
          setLoading(false);
        }
      }
    };

    syncProfile();

    return () => {
      cancelled = true;
    };
  }, [
    isSignedIn,
    isLoaded,
    clerkUser?.id,
    user?.clerkUserId,
    setLoading,
    setUser,
    clear,
  ]);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    getDeviceIdentity()
      .then((identity) => deviceApi.register(identity))
      .catch((error) => {
        if (!cancelled) {
          console.warn(
            'POST /devices/register failed:',
            error?.response?.status,
            error?.response?.data ?? error?.message
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!isLoaded && clerkProfileTimedOut) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Account details unavailable</Text>
        <Text style={styles.errorMessage}>
          Clerk did not finish loading your account. Check your connection, then restart the app.
        </Text>
        <Pressable onPress={returnToSignIn}>
          <Text style={styles.signOutLabel}>Sign out</Text>
        </Pressable>
      </View>
    );
  }

  if (!isLoaded || (isSignedIn && isLoading && !user)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryAccent} />
        <Text style={styles.loadingLabel}>Loading your account…</Text>
        <Pressable style={styles.authEscapeButton} onPress={returnToSignIn}>
          <Text style={styles.authEscapeLabel}>Back to sign in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userRole === USER_ROLES.LECTURER ? (
          <Stack.Screen name="LecturerTabs" component={LecturerTabs} />
        ) : (
          <Stack.Screen name="StudentTabs" component={StudentTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryBackground,
    padding: 24,
  },
  loadingLabel: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: 12,
  },
  authEscapeButton: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  authEscapeLabel: {
    ...Typography.bodyMedium,
    color: Colors.primaryAccent,
    fontFamily: 'Lato_700Bold',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryBackground,
    padding: 24,
    gap: 16,
  },
  errorTitle: {
    ...Typography.h2,
    textAlign: 'center',
  },
  errorMessage: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
  },
  signOutLabel: {
    ...Typography.bodyMedium,
    color: Colors.primaryAccent,
  },
});
