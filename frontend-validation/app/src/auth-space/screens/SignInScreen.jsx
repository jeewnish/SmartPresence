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
import { useAuth, useSignIn } from '@clerk/expo';

import AuthHeader from '../../components/common/AuthHeader';
import AuthInput from '../../components/common/AuthInput';
import OtpCodeInput from '../../components/common/OtpCodeInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import StandardCard from '../../components/common/StandardCard';
import { Colors, Typography, Spacing } from '../../theme';
import { STUDENT_ID_EXAMPLE, STUDENT_ID_PATTERN, signInSchema, validate } from '../validation';

export default function SignInScreen({ navigation }) {
  // @clerk/expo v3 exposes `signIn` (a SignInFuture), `errors`, and `fetchStatus` —
  // there is no `isLoaded`/`setActive` on this hook in v3 (that was the legacy Core 2 API).
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth({ treatPendingAsSignedOut: false });

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [verificationError, setVerificationError] = useState('');

  const submitting = fetchStatus === 'fetching';

  const finalizeSignIn = async () => {
    if (signIn.status === 'complete') {
      // Activating the Clerk session updates AuthGate in App.js. The signed-in
      // navigator starts on the Home tab, so no manual navigation is needed.
      const { error } = await signIn.finalize();
      if (error) {
        throw error;
      }
    }
  };

  const handleSignIn = async () => {
    const validationErrors = validate(signInSchema, { identifier, password });
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setVerificationError('');

    try {
      const normalizedIdentifier = identifier.trim();
      const { error } = await signIn.password({
        identifier: STUDENT_ID_PATTERN.test(normalizedIdentifier.toUpperCase())
          ? normalizedIdentifier.toUpperCase()
          : normalizedIdentifier,
        password,
      });
      if (error) {
        if (error.errors?.[0]?.code === 'session_exists') {
          // Clerk already has an active session for this client — not a real
          // failure. With pending sessions included, AuthGate will route to
          // RootNavigator as soon as Clerk publishes the active session.
          return;
        }
        setFieldErrors({ identifier: 'Invalid email, Student ID, or password' });
        return;
      }

      if (signIn.status === 'complete') {
        await finalizeSignIn();
      } else if (
        signIn.status === 'needs_second_factor' ||
        signIn.status === 'needs_client_trust'
      ) {
        const emailCodeFactor = signIn.supportedSecondFactors?.find(
          (factor) => factor.strategy === 'email_code'
        );
        if (emailCodeFactor) {
          setCode('');
          setVerificationError('');
          const { error: sendError } = await signIn.mfa.sendEmailCode();
          if (sendError) {
            Alert.alert(
              'Verification Error',
              'Your password was accepted, but the device verification code could not be sent.'
            );
          }
        } else {
          Alert.alert(
            'Verification unavailable',
            'This account does not have email code verification available.'
          );
        }
      } else {
        console.error('Sign-in attempt not complete:', signIn.status);
        Alert.alert('Sign In Error', 'Could not complete sign in. Please try again.');
      }
    } catch (err) {
      console.error('Sign-in threw:', err);
      if (err?.errors?.length) {
        setFieldErrors({ identifier: 'Invalid email, Student ID, or password' });
      } else {
        Alert.alert('Sign In Error', 'Something went wrong. Please try again.');
      }
    }
  };

  const handleVerifyDevice = async (codeOverride) => {
    const codeToVerify = codeOverride ?? code;
    if (!codeToVerify || codeToVerify.length < 6) return;

    setVerificationError('');
    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code: codeToVerify });
      if (error) {
        setVerificationError('Incorrect code');
        return;
      }

      if (signIn.status === 'complete') {
        await finalizeSignIn();
      } else {
        setVerificationError('Incorrect code');
      }
    } catch (err) {
      console.error('Device verify threw:', err);
      setVerificationError('Incorrect code');
    }
  };

  if (isSignedIn) {
    return null;
  }

  // ── Device verification step (shown the first time a user signs in from a new device) ──
  if (
    (signIn?.status === 'needs_client_trust' || signIn?.status === 'needs_second_factor') &&
    signIn.supportedSecondFactors?.some((factor) => factor.strategy === 'email_code')
  ) {
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
            <OtpCodeInput
              value={code}
              onChangeText={(value) => {
                setCode(value);
                setVerificationError('');
              }}
              onComplete={(fullCode) => handleVerifyDevice(fullCode)}
              error={verificationError || errors?.fields?.code?.message}
              autoFocus
            />
            <PrimaryButton
              label="Verify"
              onPress={() => handleVerifyDevice()}
              loading={submitting}
              disabled={code.length < 6}
              style={styles.submitBtn}
            />
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={async () => {
                setCode('');
                setVerificationError('');
                await signIn.mfa.sendEmailCode();
              }}
            >
              <Text style={styles.linkText}>Resend code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkBtn} onPress={() => signIn.reset()}>
              <Text style={styles.linkText}>Start over</Text>
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
            label="Email address or Student ID"
            value={identifier}
            onChangeText={(value) => {
              setIdentifier(value.includes('@') ? value : value.toUpperCase());
              setFieldErrors((current) => ({ ...current, identifier: undefined }));
            }}
            placeholder={`you@university.edu or ${STUDENT_ID_EXAMPLE}`}
            icon="user"
            autoCapitalize="none"
            returnKeyType="next"
            error={fieldErrors.identifier}
          />
          <AuthInput
            label="Password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setFieldErrors((current) => ({
                ...current,
                identifier: undefined,
                password: undefined,
              }));
            }}
            placeholder="••••••••"
            icon="lock"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSignIn}
            error={fieldErrors.password}
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
