import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import COLORS from './colors';
import loginStyles, { scale, vs, ms } from './styles';

export default function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  LeftIcon,
  showToggle = false,
  forgotLabel = null,
  onForgot,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    borderAnim.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
    scaleAnim.value = withTiming(1.015, { duration: 180, easing: Easing.out(Easing.quad) });
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    borderAnim.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) });
    scaleAnim.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
  }, []);

  const animWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const animBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderAnim.value === 1
      ? COLORS.inputBorderFocus
      : COLORS.inputBorder,
    shadowOpacity: borderAnim.value * 0.22,
  }));

  const isSecure = secureTextEntry && !showPassword;

  return (
    <View style={loginStyles.fieldWrapper}>
      {/* Label row */}
      <View style={localStyles.labelRow}>
        <Text style={loginStyles.fieldLabel}>{label}</Text>
        {forgotLabel && (
          <TouchableOpacity onPress={onForgot} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={localStyles.forgotText}>{forgotLabel}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Input row */}
      <Animated.View style={animWrapStyle}>
        <Animated.View
          style={[
            loginStyles.inputRow,
            animBorderStyle,
            {
              shadowColor: COLORS.purplePrimary,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 8,
              elevation: isFocused ? 4 : 0,
            },
          ]}
        >
          {LeftIcon && (
            <View style={loginStyles.inputIcon}>
              <LeftIcon focused={isFocused} />
            </View>
          )}
          <TextInput
            style={loginStyles.textInput}
            placeholder={placeholder}
            placeholderTextColor={COLORS.inputPlaceholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={isSecure}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onFocus={handleFocus}
            onBlur={handleBlur}
            selectionColor={COLORS.purpleAccent}
          />
          {showToggle && (
            <TouchableOpacity
              style={loginStyles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <EyeIcon visible={showPassword} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ── Inline SVG-free icons ─────────────────────────────────────────────────────

export function EnvelopeIcon({ focused }) {
  const color = focused ? COLORS.purpleAccent : COLORS.inputIcon;
  return (
    <View style={[iconStyles.envelope, { borderColor: color }]}>
      <View style={[iconStyles.envFlap, { borderColor: color }]} />
    </View>
  );
}

export function LockIcon({ focused }) {
  const color = focused ? COLORS.purpleAccent : COLORS.inputIcon;
  return (
    <View style={iconStyles.lockWrap}>
      <View style={[iconStyles.lockArch, { borderColor: color }]} />
      <View style={[iconStyles.lockBody, { borderColor: color, backgroundColor: 'transparent' }]}>
        <View style={[iconStyles.lockHole, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function EyeIcon({ visible }) {
  const color = COLORS.inputIcon;
  return (
    <View style={iconStyles.eyeWrap}>
      <View style={[iconStyles.eyeOuter, { borderColor: color }]} />
      <View style={[iconStyles.eyePupil, { backgroundColor: color }]} />
      {!visible && <View style={[iconStyles.eyeSlash, { backgroundColor: color }]} />}
    </View>
  );
}

const ICON = scale(16);
const localStyles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(7),
  },
  forgotText: {
    fontSize: ms(12),
    color: COLORS.purpleAccent,
    fontWeight: '600',
  },
});

const iconStyles = StyleSheet.create({
  // Envelope
  envelope: {
    width: ICON + 2,
    height: ICON - 2,
    borderWidth: 1.4,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  envFlap: {
    width: ICON + 2,
    height: (ICON - 2) * 0.55,
    borderBottomWidth: 1.4,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    transform: [{ rotate: '0deg' }],
  },

  // Lock
  lockWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ICON,
    height: ICON + 2,
  },
  lockArch: {
    width: ICON * 0.6,
    height: ICON * 0.45,
    borderTopLeftRadius: ICON * 0.3,
    borderTopRightRadius: ICON * 0.3,
    borderWidth: 1.4,
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  lockBody: {
    width: ICON * 0.85,
    height: ICON * 0.55,
    borderWidth: 1.4,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockHole: {
    width: scale(3.5),
    height: scale(3.5),
    borderRadius: scale(2),
  },

  // Eye
  eyeWrap: {
    width: ICON + 4,
    height: ICON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeOuter: {
    position: 'absolute',
    width: ICON + 4,
    height: ICON,
    borderRadius: ICON * 0.7,
    borderWidth: 1.4,
  },
  eyePupil: {
    width: scale(5),
    height: scale(5),
    borderRadius: scale(3),
  },
  eyeSlash: {
    position: 'absolute',
    width: 1.4,
    height: ICON + 4,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
});
