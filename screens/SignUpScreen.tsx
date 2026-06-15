import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { registerUserWithBackend } from '../services/backendAuth';

type SignUpScreenProps = {
  onBack: () => void;
  onGoSignIn: () => void;
};

export function SignUpScreen({ onBack, onGoSignIn }: SignUpScreenProps) {
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const trimmedStudentId = studentId.trim();

    if (!trimmedEmail || !trimmedUsername || !trimmedPassword || !trimmedConfirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await registerUserWithBackend({
        username: trimmedUsername,
        email: trimmedEmail,
        password: trimmedPassword,
        studentId: trimmedStudentId || undefined,
      });
      setSuccessMessage('Registration successful. You can now sign in.');
    } catch {
      setErrorMessage(
        'Registration failed. Confirm your backend endpoint and Keycloak service account setup.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F6F8] px-6 pt-14">
      <Pressable className="mb-8 self-start rounded-full p-2" onPress={onBack}>
        <Ionicons name="arrow-back" size={34} color="#5F6776" />
      </Pressable>

      <Text className="font-inter-bold text-[24px] leading-[32px] text-[#111A37]">Sign Up</Text>
      

      <View className="mt-10 gap-4">
        <View>
          <Text className="font-inter-semibold mb-2 text-[14px] leading-[20px] text-[#253B61]">
            Student ID (optional)
          </Text>
          <View className="flex-row items-center rounded-[18px] border border-[#D6DBE3] bg-white px-5 py-3">
            <Ionicons name="card-outline" size={24} color="#98A2B3" />
            <TextInput
              className="font-inter ml-3 flex-1 text-[16px] leading-[22px] text-[#1A2B45]"
              value={studentId}
              onChangeText={setStudentId}
              placeholder="e.g. 10023456"
              placeholderTextColor="#98A2B3"
            />
          </View>
        </View>

        <View>
          <Text className="font-inter-semibold mb-2 text-[14px] leading-[20px] text-[#253B61]">
            Username
          </Text>
          <View className="flex-row items-center rounded-[18px] border border-[#D6DBE3] bg-white px-5 py-3">
            <Ionicons name="person-outline" size={24} color="#98A2B3" />
            <TextInput
              className="font-inter ml-3 flex-1 text-[16px] leading-[22px] text-[#1A2B45]"
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor="#98A2B3"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View>
          <Text className="font-inter-semibold mb-2 text-[14px] leading-[20px] text-[#253B61]">
            University Email
          </Text>
          <View className="flex-row items-center rounded-[18px] border border-[#D6DBE3] bg-white px-5 py-3">
            <Ionicons name="mail-outline" size={24} color="#98A2B3" />
            <TextInput
              className="font-inter ml-3 flex-1 text-[16px] leading-[22px] text-[#1A2B45]"
              value={email}
              onChangeText={setEmail}
              placeholder="student@university.edu"
              placeholderTextColor="#98A2B3"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>
        </View>

        <View>
          <Text className="font-inter-semibold mb-2 text-[14px] leading-[20px] text-[#253B61]">
            Password
          </Text>
          <View className="flex-row items-center rounded-[18px] border border-[#D6DBE3] bg-white px-5 py-3">
            <Ionicons name="lock-closed-outline" size={24} color="#98A2B3" />
            <TextInput
              className="font-inter ml-3 flex-1 text-[16px] leading-[22px] text-[#1A2B45]"
              value={password}
              onChangeText={setPassword}
              placeholder="Create password"
              placeholderTextColor="#98A2B3"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View>
          <Text className="font-inter-semibold mb-2 text-[14px] leading-[20px] text-[#253B61]">
            Confirm Password
          </Text>
          <View className="flex-row items-center rounded-[18px] border border-[#D6DBE3] bg-white px-5 py-3">
            <Ionicons name="shield-checkmark-outline" size={24} color="#98A2B3" />
            <TextInput
              className="font-inter ml-3 flex-1 text-[16px] leading-[22px] text-[#1A2B45]"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              placeholderTextColor="#98A2B3"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      </View>

      <Pressable
        className="mt-12 rounded-[24px] bg-[#4762EA] py-6 shadow-sm"
        onPress={handleRegister}
        disabled={isSubmitting}>
        <Text className="font-inter-semibold text-center text-[17px] text-white">
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Text>
      </Pressable>

      {!!errorMessage && (
        <Text className="font-inter mt-4 text-center text-[14px] leading-[20px] text-[#C81E1E]">
          {errorMessage}
        </Text>
      )}

      {!!successMessage && (
        <Text className="font-inter mt-4 text-center text-[14px] leading-[20px] text-[#0B8F45]">
          {successMessage}
        </Text>
      )}

      <View className="mt-auto flex-row items-center justify-center pb-10">
        <Text className="font-inter text-[14px] text-[#6C7586]">Already registered? </Text>
        <Pressable onPress={onGoSignIn}>
          <Text className="font-inter-semibold text-[14px] text-[#4762EA]">Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}
