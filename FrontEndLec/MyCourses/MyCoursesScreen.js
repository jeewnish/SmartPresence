import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CourseCard from './CourseCard';
import colors from './colors';

const { width, height } = Dimensions.get('window');

const COURSES = [
  {
    id: '1',
    name: 'IS31011: Data\nStructures',
    schedule: 'Today • 09:30 AM - 11:00 AM',
    icon: '</>',
  },
  {
    id: '2',
    name: 'IS32110: Calculus III',
    schedule: 'Tomorrow • 01:00 PM - 02:30 PM',
    icon: '∫',
  },
];

const MyCoursesScreen = ({ navigation }) => {
  const screenFade = useRef(new Animated.Value(0)).current;
  const addBtnScale = useRef(new Animated.Value(1)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenFade, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAddPressIn = () => {
    Animated.spring(addBtnScale, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();
  };

  const handleAddPressOut = () => {
    Animated.spring(addBtnScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <LinearGradient
        colors={['#05040F', '#0C0720', '#120A2E', '#0A0620']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient glow blobs */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomCenter} />

      <SafeAreaView style={styles.safe}>
        <Animated.View style={{ flex: 1, opacity: screenFade }}>
          {/* ── Header ── */}
          <Animated.View
            style={[
              styles.header,
              { transform: [{ translateY: headerSlide }] },
            ]}
          >
            <TouchableOpacity
              onPress={() => navigation?.goBack()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Courses</Text>
          </Animated.View>

          {/* ── Body ── */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section label */}
            <Text style={styles.sectionLabel}>Recent Sessions</Text>

            {/* Course cards */}
            <View style={styles.cardsContainer}>
              {COURSES.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                  onExplore={(c) => console.log('Explore:', c.name)}
                />
              ))}
            </View>

            {/* Add more button */}
            <Animated.View
              style={[
                styles.addBtnWrapper,
                { transform: [{ scale: addBtnScale }] },
              ]}
            >
              <TouchableOpacity
                onPress={() => console.log('Add more pressed')}
                onPressIn={handleAddPressIn}
                onPressOut={handleAddPressOut}
                activeOpacity={0.75}
              >
                <LinearGradient
                  colors={['rgba(107, 63, 212, 0.18)', 'rgba(75, 35, 160, 0.28)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addBtn}
                >
                  <Text style={styles.addBtnText}>+ Add more</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>

          {/* ── Bottom nav bar ── */}
          <BottomNav />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

/* ─── Bottom navigation bar ─────────────────────────── */
const NAV_ITEMS = [
  { label: 'Home', icon: '⌂', active: false },
  { label: 'Schedule', icon: '▦', active: false },
  { label: 'History', icon: '◷', active: false },
  { label: 'Profile', icon: '◉', active: false },
];

const BottomNav = () => (
  <View style={navStyles.wrapper}>
    <LinearGradient
      colors={['rgba(10, 7, 30, 0.0)', 'rgba(10, 7, 30, 0.98)']}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    />
    <LinearGradient
      colors={['rgba(18, 12, 45, 0.97)', 'rgba(10, 7, 30, 0.99)']}
      style={navStyles.bar}
    >
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity key={item.label} style={navStyles.item} activeOpacity={0.7}>
          <Text style={[navStyles.icon, item.active && navStyles.iconActive]}>
            {item.icon}
          </Text>
          <Text style={[navStyles.label, item.active && navStyles.labelActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </LinearGradient>
  </View>
);

/* ─── Styles ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05040F',
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 28 : 0,
  },

  // Glow blobs
  glowTopLeft: {
    position: 'absolute',
    top: -80,
    left: -70,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(107, 63, 212, 0.14)',
  },
  glowTopRight: {
    position: 'absolute',
    top: -50,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(79, 195, 247, 0.07)',
  },
  glowBottomCenter: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    width: 280,
    height: 180,
    borderRadius: 140,
    backgroundColor: 'rgba(107, 63, 212, 0.08)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(107, 63, 212, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
    marginTop: -1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  // Section label
  sectionLabel: {
    color: 'rgba(180, 160, 255, 0.85)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 14,
    marginTop: 4,
  },

  // Cards
  cardsContainer: {
    gap: 0,
  },

  // Add more
  addBtnWrapper: {
    marginTop: 24,
    alignSelf: 'center',
    width: '80%',
  },
  addBtn: {
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.45)',
  },
  addBtnText: {
    color: '#9B6FFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

const navStyles = StyleSheet.create({
  wrapper: {
    paddingBottom: Platform.OS === 'ios' ? 0 : 0,
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(107, 63, 212, 0.18)',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 20,
    color: 'rgba(160, 145, 210, 0.55)',
  },
  iconActive: {
    color: '#9B6FFF',
  },
  label: {
    fontSize: 10,
    color: 'rgba(160, 145, 210, 0.55)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: '#9B6FFF',
  },
});

export default MyCoursesScreen;
