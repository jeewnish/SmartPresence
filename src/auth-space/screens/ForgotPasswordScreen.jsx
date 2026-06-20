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
import { useSignIn } from '@clerk/expo';

import AuthHeader from '../../components/common/AuthHeader';
import AuthInput from '../../components/common/AuthInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import StandardCard from '../../components/common/StandardCard';
import { Colors, Typography, Spacing } from '../../theme';
import { forgotPasswordEmailSchema, newPasswordSchema, validate } from '../validation';

export default function ForgotPasswordScreen({ navigation }) {
  const { signIn, errors, fetchStatus } = useSignIn();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const submitting = fetchStatus === 'fetching';

  // Step 1: send the reset code to the user's email
  const handleSendCode = async () => {
    const validationErrors = validate(forgotPasswordEmailSchema, { email });
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const { error: createError } = await signIn.create({ identifier: email.trim() });
    if (createError) return;

    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) return;

    setCodeSent(true);
  };

  // Step 2: verify the code
  const handleVerifyCode = async () => {
    if (!code) {
      setFieldErrors({ code: 'Enter the code we emailed you' });
      return;
    }
    setFieldErrors({});
    await signIn.resetPasswordEmailCode.verifyCode({ code });
  };

  // Step 3: submit the new password
  const handleSetNewPassword = async () => {
    const validationErrors = validate(newPasswordSchema, { password });
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      signOutOfOtherSessions: true,
    });
    if (error) return;

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: () => {
          // RootNavigator takes over automatically once the session is active.
        },
      });
    }
  };

  // ── Step 3 UI: new password ──
  if (signIn.status === 'needs_new_password') {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <AuthHeader title="Set a new password" subtitle="Choose a password you'll remember" />
          <StandardCard>
            <AuthInput
              label="New password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              icon="lock"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSetNewPassword}
              error={fieldErrors.password || errors?.fields?.password?.message}
            />
            <PrimaryButton
              label="Set new password"
              onPress={handleSetNewPassword}
              loading={submitting}
            />
          </StandardCard>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Step 2 UI: enter the code ──
  if (codeSent) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <AuthHeader title="Check your email" subtitle={`We sent a reset code to ${email}`} />
          <StandardCard>
            <AuthInput
              label="Verification code"
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              icon="lock"
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={handleVerifyCode}
              error={fieldErrors.code || errors?.fields?.code?.message}
            />
            <PrimaryButton label="Verify code" onPress={handleVerifyCode} loading={submitting} />
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={() => signIn.resetPasswordEmailCode.sendCode()}
            >
              <Text style={styles.linkText}>Resend code</Text>
            </TouchableOpacity>
          </StandardCard>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Step 1 UI: enter email ──
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <AuthHeader
          title="Forgot password?"
          subtitle="Enter your email and we'll send you a reset code"
        />
        <StandardCard>
          <AuthInput
            label="Email address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@university.edu"
            icon="mail"
            keyboardType="email-address"
            returnKeyType="done"
            onSubmitEditing={handleSendCode}
            error={fieldErrors.email || errors?.fields?.identifier?.message}
          />
          <PrimaryButton
            label="Send reset code"
            onPress={handleSendCode}
            loading={submitting}
          />
        </StandardCard>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Remember your password? </Text>
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
