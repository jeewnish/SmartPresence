import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignInScreen from '../auth-space/screens/SignInScreen';
import SignUpScreen from '../auth-space/screens/SignUpScreen';
import ForgotPasswordScreen from '../auth-space/screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

/**
 * Pre-auth navigation stack — shown by AuthGate (App.js) whenever the user
 * isn't signed in yet. Owns its own NavigationContainer since it's never
 * rendered alongside RootNavigator's.
 */
export default function AuthNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
