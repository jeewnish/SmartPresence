import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth, useUser } from '@clerk/expo';

import { setAuthTokenProvider } from '../config/api';
import { userApi } from '../config/api';
import useUserStore from '../store/userStore';

import StudentTabs from './StudentTabs';
import LecturerTabs from './LecturerTabs';
import LoadingScreen from '../components/common/LoadingScreen';
import { Colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isSignedIn, getToken } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const { user, role, isLoading, setUser, setLoading, clear } = useUserStore();

  // Register Clerk token provider with the API client once
  useEffect(() => {
    setAuthTokenProvider(getToken);
  }, [getToken]);

  // Fetch backend user profile on every sign-in
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      clear();
      return;
    }

    setLoading(true);
    userApi
      .getMe()
      .then((data) => setUser(data))
      .catch(() => {
        // If /users/me fails (user not onboarded yet) try onboarding
        if (clerkUser) {
          const [firstName, ...rest] = (clerkUser.fullName || '').split(' ');
          userApi
            .onboard({
              email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
              firstName: firstName ?? '',
              lastName: rest.join(' ') ?? '',
              role: 'ROLE_STUDENT', // default; lecturer accounts pre-created by admin
            })
            .then((data) => setUser(data))
            .catch(() => setLoading(false));
        } else {
          setLoading(false);
        }
      });
  }, [isSignedIn, isLoaded]);

  if (!isLoaded || isLoading) {
    return <LoadingScreen message="Authenticating…" />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {role === 'ROLE_LECTURER' ? (
          <Stack.Screen name="LecturerTabs" component={LecturerTabs} />
        ) : (
          <Stack.Screen name="StudentTabs" component={StudentTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
