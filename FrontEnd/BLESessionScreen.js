import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  StatusBar,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import StatusIndicator from './StatusIndicator';
import SessionDetailRow from './SessionDetailRow';
import RadarDisplay from './RadarDisplay';

const { width } = Dimensions.get('window');

const SESSION_DETAILS = [
  'Lec Hall No - Z9',
  'Time Period - 1400h',
  'Code - IS10201',
  'Subject - Web Development',
];

const TARGET_PROGRESS = 85;

const NAV_ITEMS = [
  { label: 'Home', icon: '⌂', active: false },
  { label: 'Schedule', icon: '▦', active: false },
  { label: 'History', icon: '◷', active: false },
  { label: 'Profile', icon: '◉', active: false },
];

/* ══════════════════════════════════════════════════════
   BLESessionScreen
══════════════════════════════════════════════════════ */
const BLESessionScreen = ({ navigation }) => {
  const screenFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-16)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const beaconOpacity = useRef(new Animated.Value(0.5)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const dividerScale = useRef(new Animated.Value(0.6)).current;
  const dividerOpacity = useRef(new Animated.Value(0)).current;

  const [progressDisplay, setProgressDisplay] = useState(0);

  useEffect(() => {
    // Screen entrance
    Animated.parallel([
      Animated.timing(screenFade, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 70, friction: 11, useNativeDriver: true }),
      Animated.timing(titleFade, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(dividerOpacity, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
        Animated.spring(dividerScale, { toValue: 1, tension: 60, friction: 10, delay: 300, useNativeDriver: true }),
      ]),
    ]).start();

    // Animate progress bar + counter
    Animated.timing(progressAnim, {
      toValue: TARGET_PROGRESS,
      duration: 1800,
      delay: 700,
      useNativeDriver: false,
    }).start();

    const listener = progressAnim.addListener(({ value }) => {
      setProgressDisplay(Math.round(value));
    });

    // Beacon breathing loop
    const breathe = () => {
      Animated.sequence([
        Animated.timing(beaconOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(beaconOpacity, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
      ]).start(() => breathe());
    };
    breathe();

    return () => progressAnim.removeListener(listener);
  }, []);

  const onBtnIn = () =>
    Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  const onBtnOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <LinearGradient
        colors={['#04030E', '#080618', '#0E0825', '#08061A']}
        locations={[0, 0.3, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient glow blobs */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowTopRight} />
      <View style={styles.glowCenter} />
      <View style={styles.glowBottom} />

      <SafeAreaView style={styles.safe}>
        <Animated.View style={{ flex: 1, opacity: screenFade }}>

          {/* ── Top bar ── */}
          <Animated.View
            style={[styles.topBar, { transform: [{ translateY: headerSlide }] }]}
          >
            <TouchableOpacity
              onPress={() => navigation?.goBack()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <Text style={styles.appTitle}>Smart Presence</Text>

            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </Animated.View>

          {/* ── Status pills ── */}
          <View style={styles.pillsRow}>
            <StatusIndicator label="Bluetooth Active" delay={0} />
            <StatusIndicator label="Device Bound" delay={400} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Main title ── */}
            <Animated.Text style={[styles.mainTitle, { opacity: titleFade }]}>
              Taking the{'\n'}Attendance
            </Animated.Text>

            {/* ── Radar display ── */}
            <View style={styles.radarWrapper}>
              <RadarDisplay />
            </View>

            {/* ── Divider ── */}
            <Animated.View
              style={[
                styles.divider,
                {
                  opacity: dividerOpacity,
                  transform: [{ scaleX: dividerScale }],
                },
              ]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(107, 63, 212, 0.6)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.dividerLine}
              />
            </Animated.View>

            {/* ── Session details ── */}
            <View style={styles.detailsBlock}>
              {SESSION_DETAILS.map((text, i) => (
                <SessionDetailRow key={i} text={text} index={i} />
              ))}
            </View>

            {/* ── Progress section ── */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>MARKING ATTENDANCES</Text>
                <Text style={styles.progressPercent}>{progressDisplay}%</Text>
              </View>

              {/* Progress bar track */}
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: progressBarWidth }]}>
                  <LinearGradient
                    colors={['#5B35CC', '#8B5FFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  {/* Shine dot at end */}
                  <View style={styles.progressDot} />
                </Animated.View>
              </View>

              {/* Beacon status */}
              <Animated.View style={[styles.beaconRow, { opacity: beaconOpacity }]}>
                <Text style={styles.beaconArrows}>»</Text>
                <Text style={styles.beaconText}>  Connected to Proximity Beacon</Text>
              </Animated.View>
            </View>
          </ScrollView>

          {/* ── Action button (sticky bottom) ── */}
          <View style={styles.btnArea}>
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                onPress={() => console.log('Proceed to Biometric')}
                onPressIn={onBtnIn}
                onPressOut={onBtnOut}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#4A2ACC', '#3318A8', '#2610A0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.proceedBtn}
                >
                  <Text style={styles.proceedIcon}>👆</Text>
                  <Text style={styles.proceedLabel}>Proceed to Biometric Verification</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* ── Bottom nav ── */}
          <BottomNav />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

/* ── Bottom navigation bar ─────────────────────────── */
const BottomNav = () => (
  <LinearGradient
    colors={['rgba(8, 6, 24, 0.0)', 'rgba(8, 6, 24, 0.99)']}
    style={navStyles.gradient}
  >
    <LinearGradient
      colors={['rgba(14, 10, 36, 0.97)', 'rgba(8, 6, 24, 0.99)']}
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
  </LinearGradient>
);

/* ── Styles ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#04030E',
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
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(90, 50, 200, 0.12)',
  },
  glowTopRight: {
    position: 'absolute',
    top: -50,
    right: -55,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(60, 30, 150, 0.09)',
  },
  glowCenter: {
    position: 'absolute',
    top: '28%',
    alignSelf: 'center',
    left: '15%',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(80, 40, 180, 0.12)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 60,
    left: '20%',
    width: 200,
    height: 180,
    borderRadius: 100,
    backgroundColor: 'rgba(70, 35, 160, 0.08)',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(107, 63, 212, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.30)',
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
  appTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(107, 63, 212, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 16,
  },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF4F6E',
    borderWidth: 1.5,
    borderColor: '#04030E',
  },

  // Status pills row
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginBottom: 4,
    gap: 8,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },

  // Title
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 34,
    marginTop: 10,
    marginBottom: 4,
    textShadowColor: 'rgba(107, 63, 212, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },

  // Radar
  radarWrapper: {
    marginVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Divider
  divider: {
    width: '90%',
    marginVertical: 6,
  },
  dividerLine: {
    height: 1,
    width: '100%',
  },

  // Session details
  detailsBlock: {
    alignItems: 'center',
    marginBottom: 18,
    gap: 2,
  },

  // Progress
  progressSection: {
    width: '100%',
    backgroundColor: 'rgba(22, 15, 55, 0.65)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.25)',
    padding: 16,
    marginBottom: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    color: 'rgba(160, 145, 210, 0.70)',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  progressPercent: {
    color: '#9B6FFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(155, 111, 255, 0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  progressTrack: {
    height: 7,
    backgroundColor: 'rgba(107, 63, 212, 0.18)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  progressDot: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#9B6FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  beaconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beaconArrows: {
    color: 'rgba(57, 255, 149, 0.75)',
    fontSize: 13,
    fontWeight: '700',
  },
  beaconText: {
    color: 'rgba(57, 255, 149, 0.75)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Proceed button area
  btnArea: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 6,
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 12,
    shadowColor: '#4A2ACC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  proceedIcon: {
    fontSize: 20,
  },
  proceedLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.25,
    flex: 1,
    textAlign: 'center',
    marginLeft: -20,
  },
});

const navStyles = StyleSheet.create({
  gradient: {
    paddingTop: 6,
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 22 : 12,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(107, 63, 212, 0.15)',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  icon: {
    fontSize: 20,
    color: 'rgba(150, 135, 200, 0.45)',
  },
  iconActive: {
    color: '#9B6FFF',
  },
  label: {
    fontSize: 10,
    color: 'rgba(150, 135, 200, 0.45)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: '#9B6FFF',
    fontWeight: '700',
  },
});

export default BLESessionScreen;
