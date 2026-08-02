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
  Modal,
  Pressable,
} from 'react-native';
import { useAuth, useSignUp } from '@clerk/expo';

import AuthHeader from '../../components/common/AuthHeader';
import AuthInput from '../../components/common/AuthInput';
import OtpCodeInput from '../../components/common/OtpCodeInput';
import PrimaryButton from '../../components/common/PrimaryButton';
import StandardCard from '../../components/common/StandardCard';
import { Colors, Typography, Spacing } from '../../theme';
import { STUDENT_ID_EXAMPLE, signUpSchema, validate } from '../validation';

export default function SignUpScreen({ navigation }) {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth({ treatPendingAsSignedOut: false });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [verificationVisible, setVerificationVisible] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const submitting = fetchStatus === 'fetching';

  const sendVerificationCode = async () => {
    setDeliveryMessage('');
    setVerificationError('');

    const { error } = await signUp.verifications.sendEmailCode();
    if (error) {
      const message =
        error?.errors?.[0]?.longMessage ||
        error?.errors?.[0]?.message ||
        'Clerk could not send the verification code. Please try again.';

      console.error('Clerk send-email-code error:', JSON.stringify(error, null, 2));
      Alert.alert('Code not sent', message);
      return false;
    }

    setCode('');
    setDeliveryMessage('Code sent. Check your inbox and spam folder.');
    setVerificationVisible(true);
    return true;
  };

  const handleCreateAccount = async () => {
    if (submitting) return;

    const validationErrors = validate(signUpSchema, {
      firstName,
      lastName,
      studentId,
      email,
      password,
      confirmPassword,
    });
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const { error } = await signUp.password({
        emailAddress: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        // Clerk stores the Student ID in its username field so it can also be
        // used as the student's sign-in identifier.
        username: studentId.trim().toUpperCase(),
      });
      if (error) {
        const firstError = error?.errors?.[0];
        const rawField = firstError?.meta?.paramName || firstError?.meta?.param_name;
        const field = {
          emailAddress: 'email',
          email_address: 'email',
          username: 'studentId',
        }[rawField] ?? rawField;
        const message =
          firstError?.longMessage || firstError?.message || 'Could not create your account';

        if (field) {
          setFieldErrors((current) => ({ ...current, [field]: message }));
        } else {
          Alert.alert('Sign Up Error', message);
        }
        return;
      }

      await sendVerificationCode();
    } catch (error) {
      console.error('Sign-up threw:', error);
      Alert.alert('Sign Up Error', 'Something went wrong. Please try again.');
    }
  };

  const handleVerify = async (codeOverride) => {
    if (submitting) return;

    const codeToVerify = codeOverride ?? code;
    if (!codeToVerify || codeToVerify.length < 6) return;

    setVerificationError('');
    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: codeToVerify,
      });
      if (error) {
        setVerificationError(
          error?.errors?.[0]?.longMessage ??
            error?.errors?.[0]?.message ??
            'Incorrect code'
        );
        return;
      }

      if (signUp.status === 'complete') {
        setVerificationVisible(false);
        const { error: finalizeError } = await signUp.finalize();
        if (finalizeError) {
          throw finalizeError;
        }
      } else {
        console.error('Sign-up attempt not complete:', signUp.status);
        setVerificationError('Verification could not be completed');
      }
    } catch (err) {
      console.error('Verify email threw:', err);
      setVerificationError(
        err?.errors?.[0]?.longMessage ??
          err?.errors?.[0]?.message ??
          'Incorrect code'
      );
    }
  };

  if (isSignedIn) {
    return null;
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
            label="Student ID"
            value={studentId}
            onChangeText={(value) => {
              setStudentId(value.toUpperCase());
              setFieldErrors((current) => ({ ...current, studentId: undefined }));
            }}
            placeholder={STUDENT_ID_EXAMPLE}
            icon="user"
            maxLength={9}
            autoCapitalize="none"
            returnKeyType="next"
            error={fieldErrors.studentId || errors?.fields?.username?.message}
          />
          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            icon="lock"
            secureTextEntry
            returnKeyType="next"
            error={fieldErrors.password || errors?.fields?.password?.message}
          />
          <AuthInput
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            icon="lock"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleCreateAccount}
            error={fieldErrors.confirmPassword}
          />

          <PrimaryButton
            label="Sign Up"
            onPress={handleCreateAccount}
            loading={submitting}
            style={styles.submitBtn}
          />

          {/* Required by Clerk's bot sign-up protection for custom Expo flows. */}
          <View nativeID="clerk-captcha" />
        </StandardCard>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={verificationVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.modalBackdrop} />
          <StandardCard style={styles.verificationCard}>
            <Text style={styles.modalTitle}>Verify Email</Text>
            <Text style={styles.modalSubtitle}>
              Enter the 6-digit code sent to your email.
            </Text>
            <Text selectable style={styles.verificationEmail}>
              {email.trim()}
            </Text>
            {deliveryMessage ? (
              <Text selectable style={styles.deliveryMessage}>
                {deliveryMessage}
              </Text>
            ) : null}

            <OtpCodeInput
              value={code}
              onChangeText={(value) => {
                setCode(value);
                setVerificationError('');
              }}
              error={verificationError || errors?.fields?.code?.message}
              autoFocus
            />

            <PrimaryButton
              label="Verify"
              onPress={() => handleVerify()}
              loading={submitting}
              disabled={code.length !== 6}
              style={styles.submitBtn}
            />

            <TouchableOpacity
              style={styles.linkBtn}
              onPress={async () => {
                await sendVerificationCode();
              }}
            >
              <Text style={styles.linkText}>Resend code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.changeEmailBtn}
              onPress={() => {
                setVerificationVisible(false);
                setCode('');
                setVerificationError('');
                setDeliveryMessage('');
              }}
            >
              <Text style={styles.changeEmailText}>
                Wrong email? <Text style={styles.changeEmailLink}>Change it</Text>
              </Text>
            </TouchableOpacity>
          </StandardCard>
        </KeyboardAvoidingView>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(60, 61, 72, 0.45)',
  },
  verificationCard: {
    width: '100%',
    maxWidth: 420,
    padding: Spacing.lg,
  },
  modalTitle: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modalSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  verificationEmail: {
    ...Typography.bodyMedium,
    color: Colors.primaryText,
    fontFamily: 'Lato_700Bold',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  deliveryMessage: {
    ...Typography.caption,
    color: Colors.present,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  changeEmailBtn: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  changeEmailText: {
    ...Typography.bodyMedium,
    color: Colors.secondaryText,
    fontSize: 13,
    textAlign: 'center',
  },
  changeEmailLink: {
    color: Colors.primaryAccent,
    fontFamily: 'Lato_700Bold',
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
