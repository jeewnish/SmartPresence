import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import {
  KeycloakAuthError,
  fetchKeycloakUserInfo,
  loginWithKeycloak,
} from '../services/keycloakAuth';
import { saveAuthSession } from '../services/tokenStorage';

type SignInScreenProps = {
  onBack: () => void;
  onGoSignUp: () => void;
  onVerified: () => void;
};

export function SignInScreen({ onBack, onGoSignUp, onVerified }: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const token = await loginWithKeycloak(trimmedEmail, trimmedPassword);
      await fetchKeycloakUserInfo(token.access_token);
      await saveAuthSession(token);
      onVerified();
    } catch (error) {
      if (error instanceof KeycloakAuthError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Sign in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F6F8] px-6 pt-14">
      <Pressable className="mb-8 self-start rounded-full p-2" onPress={onBack}>
        <Ionicons name="arrow-back" size={34} color="#5F6776" />
      </Pressable>

      <Text className="font-inter-bold text-[24px] leading-[32px] text-[#111A37]">Sign In</Text>
      <Text className="font-inter mt-5 text-[16px] leading-[26px] text-[#5A6C84]">
        Sign in with your Keycloak email and password. If your account is not verified, Keycloak
        will require email verification before allowing login.
      </Text>

      <View className="mt-12 gap-7">
        <View>
          <Text className="font-inter-semibold mb-4 text-[14px] leading-[20px] text-[#253B61]">
            University Email
          </Text>
          <View className="flex-row items-center rounded-[22px] border border-[#D6DBE3] bg-white px-6 py-4">
            <Ionicons name="mail-outline" size={28} color="#98A2B3" />
            <TextInput
              className="font-inter ml-4 flex-1 text-[16px] leading-[22px] text-[#1A2B45]"
              value={email}
              onChangeText={setEmail}
              placeholder="student@university.edu"
              placeholderTextColor="#98A2B3"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <Text className="font-inter-semibold mb-4 text-[14px] leading-[20px] text-[#253B61]">
          Password
        </Text>
        <View className="flex-row items-center rounded-[22px] border border-[#D6DBE3] bg-white px-6 py-4">
          <Ionicons name="lock-closed-outline" size={28} color="#98A2B3" />
          <TextInput
            className="font-inter ml-4 flex-1 text-[16px] leading-[22px] text-[#1A2B45]"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#98A2B3"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <Pressable
        className="mt-12 rounded-[24px] bg-[#4762EA] py-6 shadow-sm"
        onPress={handleSignIn}
        disabled={isSubmitting}>
        <Text className="font-inter-semibold text-center text-[17px] text-white">
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Text>
      </Pressable>

      {!!errorMessage && (
        <Text className="font-inter mt-4 text-center text-[14px] leading-[20px] text-[#C81E1E]">
          {errorMessage}
        </Text>
      )}

      <View className="mt-auto flex-row items-center justify-center pb-10">
        <Text className="font-inter text-[14px] text-[#6C7586]">New account? </Text>
        <Pressable onPress={onGoSignUp}>
          <Text className="font-inter-semibold text-[14px] text-[#4762EA]">Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}
