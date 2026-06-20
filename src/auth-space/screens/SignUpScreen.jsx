import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSignUp } from '@clerk/expo';

import AuthHeader from '../../components/common/AuthHeader';
import AuthInput from '../../components/common/AuthInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import StandardCard from '../../components/common/StandardCard';
import { Colors, Typography, Spacing } from '../../theme';
import { signUpSchema, validate } from '../validation';

export default function SignUpScreen({ navigation }) {
  const { signUp, errors, fetchStatus } = useSignUp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const submitting = fetchStatus === 'fetching';

  const handleCreateAccount = async () => {
    const validationErrors = validate(signUpSchema, { firstName, lastName, email, password });
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const { error } = await signUp.password({
      emailAddress: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
    if (error) return;

    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: () => {
          // RootNavigator takes over automatically once the session is active.
        },
      });
    }
  };

  const showVerifyStep =
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields?.includes('email_address') &&
    signUp.missingFields?.length === 0;

  if (showVerifyStep) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <AuthHeader
            title="Verify your email"
            subtitle={`We sent a code to ${email}`}
          />
          <StandardCard>
            <AuthInput
              label="Verification code"
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              icon="lock"
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={handleVerify}
              error={errors?.fields?.code?.message}
            />
            <PrimaryButton
              label="Verify & continue"
              onPress={handleVerify}
              loading={submitting}
              disabled={!code}
            />
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => signUp.verifications.sendEmailCode()}
            >
              <Text style={styles.linkText}>Resend code</Text>
            </TouchableOpacity>
          </StandardCard>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AuthHeader title="Create account" subtitle="Sign up as a student" />

        <StandardCard>
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <AuthInput
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Jane"
                autoCapitalize="words"
                returnKeyType="next"
                error={fieldErrors.firstName || errors?.fields?.firstName?.message}
              />
            </View>
            <View style={styles.nameField}>
              <AuthInput
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Doe"
                autoCapitalize="words"
                returnKeyType="next"
                error={fieldErrors.lastName || errors?.fields?.lastName?.message}
              />
            </View>
          </View>

          <AuthInput
            label="Email address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@university.edu"
            icon="mail"
            keyboardType="email-address"
            returnKeyType="next"
            error={fieldErrors.email || errors?.fields?.emailAddress?.message}
          />
          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            icon="lock"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleCreateAccount}
            error={fieldErrors.password || errors?.fields?.password?.message}
          />

          <PrimaryButton
            label="Create account"
            onPress={handleCreateAccount}
            loading={submitting}
            style={styles.submitBtn}
          />
        </StandardCard>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  nameField: {
    flex: 1,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  linkBtn: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  linkText: {
    ...Typography.bodyMedium,
    color: Colors.primaryAccent,
    fontFamily: 'Lato_700Bold',
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
  },
  footerLink: {
    ...Typography.bodyMedium,
    color: Colors.primaryAccent,
    fontFamily: 'Lato_700Bold',
  },
});
