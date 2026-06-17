import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from './colors';

const CourseCard = ({ course, index, onExplore }) => {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 200 + index * 150,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        delay: 200 + index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.93,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(38, 26, 80, 0.75)', 'rgba(16, 10, 40, 0.92)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Left icon */}
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>{course.icon}</Text>
        </View>

        {/* Course info */}
        <View style={styles.info}>
          <Text style={styles.courseName} numberOfLines={2}>
            {course.name}
          </Text>
          <Text style={styles.schedule}>{course.schedule}</Text>
        </View>

        {/* Explore button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            onPress={() => onExplore && onExplore(course)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(107, 63, 212, 0.35)', 'rgba(75, 35, 160, 0.45)']}
              style={styles.exploreBtn}
            >
              <Text style={styles.exploreBtnText}>Explore</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.28)',
    overflow: 'hidden',
    shadowColor: '#6B3FD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(107, 63, 212, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 17,
  },
  info: {
    flex: 1,
  },
  courseName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.1,
    lineHeight: 19,
  },
  schedule: {
    color: 'rgba(180, 170, 220, 0.75)',
    fontSize: 11.5,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  exploreBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.55)',
  },
  exploreBtnText: {
    color: '#A87FFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default CourseCard;
