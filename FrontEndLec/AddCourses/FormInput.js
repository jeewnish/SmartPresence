// FormInput.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Animated, StyleSheet,
} from 'react-native';
import colors from './colors';

const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  index = 0,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(18)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 480,
        delay: 200 + index * 130,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, tension: 65, friction: 11,
        delay: 200 + index * 130,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(borderAnim, { toValue: 1, duration: 220, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1.015, tension: 120, friction: 9, useNativeDriver: true }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.parallel([
      Animated.timing(borderAnim, { toValue: 0, duration: 220, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 9, useNativeDriver: true }),
    ]).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderPurple, colors.borderFocused],
  });

  const shadowOpacity = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.55],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.label}>{label}</Text>

      <Animated.View
        style={[
          styles.inputBox,
          {
            borderColor,
            transform: [{ scale: scaleAnim }],
            shadowOpacity,
          },
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textPlaceholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  label: {
    color: colors.purpleLabel,
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: colors.bgInput,
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: colors.borderFocused,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 2,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 14.5,
    color: colors.textInputValue,
    fontWeight: '500',
  },
});

export default FormInput;
