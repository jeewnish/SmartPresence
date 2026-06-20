import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSignIn } from '@clerk/expo';

import AuthHeader from '../../components/common/AuthHeader';
import AuthInput from '../../components/common/AuthInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import StandardCard from '../../components/common/StandardCard';
import { Colors, Typography, Spacing } from '../../theme';
import { signInSchema, validate } from '../validation';

export default function SignInScreen({ navigation }) {
  const { isLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [clerkErrors, setClerkErrors] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const parseClerkErrors = (err) => {
    if (err && Array.isArray(err.errors)) {
      const fields = {};
      err.errors.forEach((e) => {
        const fieldName = e.meta?.paramName;
        if (fieldName) {
          fields[fieldName] = { message: e.message };
        }
      });
      return { fields };
    }
    return null;
  };

  const handleSignIn = async () => {
    if (!isLoaded) return;

    const validationErrors = validate(signInSchema, { email, password });
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setClerkErrors(null);

    try {
      const result = await signIn.create({
        strategy: 'password',
        identifier: email.trim(),
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else if (result.status === 'needs_second_factor' || result.status === 'needs_client_trust') {
        const emailCodeFactor = result.supportedSecondFactors?.find(
          (factor) => factor.strategy === 'email_code'
        );
        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
          });
        }
      }
    } catch (err) {
      const parsed = parseClerkErrors(err);
      if (parsed) {
        setClerkErrors(parsed);
      } else {
        Alert.alert('Sign In Error', err.message || 'An error occurred during sign in.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyDevice = async () => {
    if (!isLoaded) return;

    setSubmitting(true);
    setClerkErrors(null);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      }
    } catch (err) {
      const parsed = parseClerkErrors(err);
      if (parsed) {
        setClerkErrors(parsed);
      } else {
        Alert.alert('Verification Error', err.message || 'An error occurred during verification.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Device verification step (shown the first time a user signs in from a new device) ──
  if (signIn?.status === 'needs_client_trust' || signIn?.status === 'needs_second_factor') {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <AuthHeader
            title="Verify it's you"
            subtitle="Enter the code we just emailed you to confirm this device."
          />
          <StandardCard>
            <AuthInput
              label="Verification code"
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              icon="lock"
              keyboardType="number-pad"
              error={clerkErrors?.fields?.code?.message}
            />
            <PrimaryButton
              label="Verify"
              onPress={handleVerifyDevice}
              loading={submitting}
              disabled={!code}
            />
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={async () => {
                try {
                  await signIn.prepareSecondFactor({ strategy: 'email_code' });
                  Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
                } catch (err) {
                  Alert.alert('Error', err.message || 'Could not resend code.');
                }
              }}
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
        <AuthHeader title="SmartPresence" subtitle="Sign in to continue" />

        <StandardCard>
          <AuthInput
            label="Email address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@university.edu"
            icon="mail"
            keyboardType="email-address"
            returnKeyType="next"
            error={fieldErrors.email || clerkErrors?.fields?.identifier?.message}
          />
          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            icon="lock"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSignIn}
            error={fieldErrors.password || clerkErrors?.fields?.password?.message}
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>

          <PrimaryButton
            label="Sign In"
            onPress={handleSignIn}
            loading={submitting}
            style={styles.submitBtn}
          />
        </StandardCard>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerLink}>Sign up</Text>
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
  submitBtn: {
    marginTop: Spacing.sm,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
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
