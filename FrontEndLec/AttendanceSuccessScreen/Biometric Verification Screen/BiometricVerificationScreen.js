import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Animated, StatusBar, SafeAreaView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import StatusIndicator from './StatusIndicator';
import BiometricIcon   from './BiometricIcon';
import InfoCard        from './InfoCard';
import BottomNavBar    from './BottomNavBar';

/* ── Static data ─────────────────────────────────────── */
const INFO_CARDS = [
  {
    label: 'CURRENT LOCATION',
    value: 'Building 4, Lecture Hall B',
    icon: '📍',
  },
  {
    label: 'COURSE',
    value: 'CS301: Advanced Data Structures',
    icon: '🎓',
  },
];

/* ══════════════════════════════════════════════════════
   BiometricVerificationScreen
══════════════════════════════════════════════════════ */
const BiometricVerificationScreen = ({ navigation }) => {
  /* Entrance animations */
  const screenFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-18)).current;
  const titleFade   = useRef(new Animated.Value(0)).current;
  const dividerScaleX   = useRef(new Animated.Value(0.5)).current;
  const dividerOpacity  = useRef(new Animated.Value(0)).current;
  const btnScale    = useRef(new Animated.Value(1)).current;

  /* Fingerprint tip breath */
  const tipBreath   = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenFade,  { toValue: 1, duration: 430, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 70, friction: 11, useNativeDriver: true }),
      Animated.timing(titleFade,   { toValue: 1, duration: 550, delay: 180, useNativeDriver: true }),
      Animated.timing(dividerOpacity,  { toValue: 1, duration: 600, delay: 280, useNativeDriver: true }),
      Animated.spring(dividerScaleX,   { toValue: 1, tension: 58, friction: 10, delay: 280, useNativeDriver: true }),
    ]).start();

    /* Tip text breathing */
    const breathe = () => {
      Animated.sequence([
        Animated.timing(tipBreath, { toValue: 1,    duration: 1100, useNativeDriver: true }),
        Animated.timing(tipBreath, { toValue: 0.45, duration: 1100, useNativeDriver: true }),
      ]).start(() => breathe());
    };
    breathe();
  }, []);

  const onBtnIn  = () => Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  const onBtnOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <LinearGradient
        colors={['#04030E', '#080618', '#0F0925', '#09071C']}
        locations={[0, 0.28, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient glow blobs */}
      <View style={styles.glowTL} />
      <View style={styles.glowTR} />
      <View style={styles.glowCenter} />
      <View style={styles.glowBL} />

      <SafeAreaView style={styles.safe}>
        <Animated.View style={{ flex: 1, opacity: screenFade }}>

          {/* ── Top bar ── */}
          <Animated.View style={[styles.topBar, { transform: [{ translateY: headerSlide }] }]}>
            {/* Back */}
            <TouchableOpacity
              onPress={() => navigation?.goBack()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.pageTitle}>Attendance</Text>

            {/* Bell */}
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
              <Text style={styles.bellIcon}>🔔</Text>
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </Animated.View>

          {/* ── Status pills ── */}
          <View style={styles.pillsRow}>
            <StatusIndicator label="Bluetooth Active" delay={0} />
            <StatusIndicator label="Device Bound"     delay={350} />
          </View>

          {/* ── Scrollable body ── */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Main heading */}
            <Animated.View style={[styles.headingBlock, { opacity: titleFade }]}>
              <Text style={styles.mainTitle}>Biometric Verification</Text>
              <Text style={styles.subtitle}>Verify your identity to mark attendance</Text>
            </Animated.View>

            {/* Fingerprint radar */}
            <View style={styles.biometricArea}>
              <BiometricIcon />

              {/* Breathing tip text under scanner */}
              <Animated.Text style={[styles.scanTip, { opacity: tipBreath }]}>
                Place finger on sensor
              </Animated.Text>
            </View>

            {/* Divider */}
            <Animated.View
              style={[
                styles.dividerWrap,
                { opacity: dividerOpacity, transform: [{ scaleX: dividerScaleX }] },
              ]}
            >
              <LinearGradient
                colors={['transparent', 'rgba(107, 63, 212, 0.55)', 'transparent']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.dividerLine}
              />
            </Animated.View>

            {/* Info cards */}
            <View style={styles.cardsBlock}>
              {INFO_CARDS.map((card, i) => (
                <InfoCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  icon={card.icon}
                  index={i}
                />
              ))}
            </View>
          </ScrollView>

          {/* ── Finished count button ── */}
          <View style={styles.btnArea}>
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                onPress={() => console.log('Finished count')}
                onPressIn={onBtnIn}
                onPressOut={onBtnOut}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#4A28D4', '#3318B0', '#2610A2']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.finishBtn}
                >
                  <Text style={styles.finishLabel}>Finished count</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* ── Bottom nav ── */}
          <BottomNavBar />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

/* ── Styles ─────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#04030E' },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 28 : 0,
  },

  /* Glow blobs */
  glowTL: {
    position: 'absolute', top: -80, left: -70,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(90, 50, 200, 0.11)',
  },
  glowTR: {
    position: 'absolute', top: -50, right: -55,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(60, 30, 150, 0.08)',
  },
  glowCenter: {
    position: 'absolute', top: '22%', left: '12%',
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(80, 40, 185, 0.12)',
  },
  glowBL: {
    position: 'absolute', bottom: 60, left: -50,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(70, 35, 160, 0.07)',
  },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(107, 63, 212, 0.18)',
    borderWidth: 1, borderColor: 'rgba(107, 63, 212, 0.30)',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { color: '#FFF', fontSize: 18, fontWeight: '600', lineHeight: 22, marginTop: -1 },
  pageTitle: { color: '#FFF', fontSize: 19, fontWeight: '700', letterSpacing: 0.2 },
  bellBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(107, 63, 212, 0.18)',
    borderWidth: 1, borderColor: 'rgba(107, 63, 212, 0.30)',
    justifyContent: 'center', alignItems: 'center',
  },
  bellIcon: { fontSize: 16 },
  bellDot: {
    position: 'absolute', top: 6, right: 7,
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: '#FF4F6E',
    borderWidth: 1.5, borderColor: '#04030E',
  },

  /* Status pills */
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginBottom: 2,
    gap: 8,
  },

  /* Scroll */
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },

  /* Heading */
  headingBlock: { alignItems: 'center', marginTop: 10, marginBottom: 6 },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
    textShadowColor: 'rgba(107, 63, 212, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  subtitle: {
    color: 'rgba(185, 175, 230, 0.65)',
    fontSize: 13,
    fontWeight: '400',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  /* Biometric area */
  biometricArea: {
    alignItems: 'center',
    marginVertical: 4,
  },
  scanTip: {
    color: 'rgba(155, 111, 255, 0.80)',
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: 0.4,
    marginTop: 6,
  },

  /* Divider */
  dividerWrap: { width: '88%', marginVertical: 8 },
  dividerLine: { height: 1, width: '100%' },

  /* Cards */
  cardsBlock: { width: '100%', gap: 0 },

  /* Button */
  btnArea: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 6,
  },
  finishBtn: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A28D4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.50,
    shadowRadius: 18,
    elevation: 10,
  },
  finishLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default BiometricVerificationScreen;
