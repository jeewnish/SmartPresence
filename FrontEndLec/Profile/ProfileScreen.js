import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DetailRow from './DetailRow';
import ActionButton from './ActionButton';

/* ── Data ───────────────────────────────────────────── */
const USER = {
  name: 'Kaveesha Lakshan',
  id: '24LEC0300',
  initials: 'KL',
  device: 'iPhone 15 Pro Max',
};

const DETAILS = [
  {
    id: 'dept',
    label: 'DEPARTMENT',
    value: 'Computer Science &\nEngineering',
    icon: '🎓',
  },
  {
    id: 'email',
    label: 'INSTITUTIONAL EMAIL',
    value: 'a.jeew@university.edu',
    icon: '✉',
  },
  {
    id: 'phone',
    label: 'MOBILE NUMBER',
    value: '+1 (555) 012-3456',
    icon: '📞',
  },
];

/* ── Bottom nav items ───────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Home', icon: '⌂', active: false },
  { label: 'Schedule', icon: '▦', active: false },
  { label: 'History', icon: '◷', active: false },
  { label: 'Profile', icon: '◉', active: true },
];

/* ══════════════════════════════════════════════════════
   ProfileScreen
══════════════════════════════════════════════════════ */
const ProfileScreen = ({ navigation }) => {
  const screenFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-18)).current;
  const avatarScale = useRef(new Animated.Value(0.82)).current;
  const avatarPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Screen entrance
    Animated.parallel([
      Animated.timing(screenFade, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        tension: 70,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.spring(avatarScale, {
        toValue: 1,
        tension: 55,
        friction: 9,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle looping pulse on avatar glow
    const pulse = () => {
      Animated.sequence([
        Animated.timing(avatarPulse, {
          toValue: 1.08,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(avatarPulse, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    const timer = setTimeout(pulse, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <LinearGradient
        colors={['#05040F', '#0C0720', '#120A2E', '#09061E']}
        locations={[0, 0.3, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient glow blobs */}
      <View style={styles.glowTopLeft} />
      <View style={styles.glowTopRight} />
      <View style={styles.glowAvatarHalo} />
      <View style={styles.glowBottomRight} />

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

            <Text style={styles.pageTitle}>Profile Settings</Text>

            <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
              <Text style={styles.settingsIcon}>⚙</Text>
            </TouchableOpacity>
          </Animated.View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Avatar + device status ── */}
            <View style={styles.avatarSection}>
              {/* Pulse glow ring */}
              <Animated.View
                style={[
                  styles.avatarGlowRing,
                  { transform: [{ scale: avatarPulse }] },
                ]}
              />

              {/* Avatar circle */}
              <Animated.View
                style={[
                  styles.avatarWrapper,
                  { transform: [{ scale: avatarScale }] },
                ]}
              >
                <LinearGradient
                  colors={['#F5CBA7', '#E8A87C', '#C87941']}
                  style={styles.avatarCircle}
                >
                  {/* Stylised face placeholder matching design */}
                  <View style={styles.faceContainer}>
                    <View style={styles.faceHead} />
                    <View style={styles.faceBody} />
                  </View>
                </LinearGradient>

                {/* Edit badge */}
                <View style={styles.editBadge}>
                  <Text style={styles.editBadgeIcon}>✏</Text>
                </View>
              </Animated.View>

              {/* Device status card */}
              <View style={styles.deviceCard}>
                <Text style={styles.deviceIcon}>📱</Text>
                <View>
                  <Text style={styles.deviceLabel}>Device Status</Text>
                  <Text style={styles.deviceName}>{USER.device}</Text>
                </View>
              </View>

              {/* Authorized badge */}
              <View style={styles.authorizedBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.authorizedText}>DEVICE AUTHORIZED</Text>
              </View>

              {/* Name + ID */}
              <Text style={styles.userName}>{USER.name}</Text>
              <Text style={styles.userId}>ID: {USER.id}</Text>
            </View>

            {/* ── Academic details ── */}
            <Text style={styles.sectionLabel}>ACADEMIC DETAILS</Text>

            {DETAILS.map((item, index) => (
              <DetailRow
                key={item.id}
                label={item.label}
                value={item.value}
                icon={item.icon}
                index={index}
                onEdit={() => console.log('Edit', item.id)}
              />
            ))}

            {/* ── Action buttons ── */}
            <View style={styles.actionsArea}>
              <ActionButton
                label="Change Password"
                icon="🔑"
                variant="primary"
                onPress={() => console.log('Change Password')}
              />

              <ActionButton
                label="Sign Out"
                icon="→"
                variant="danger"
                onPress={() => console.log('Sign Out')}
              />
            </View>
          </ScrollView>

          {/* ── Bottom nav ── */}
          <BottomNav />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

/* ── Bottom nav bar ─────────────────────────────────── */
const BottomNav = () => (
  <LinearGradient
    colors={['rgba(10, 7, 30, 0.0)', 'rgba(10, 7, 30, 0.99)']}
    style={navStyles.gradient}
  >
    <LinearGradient
      colors={['rgba(16, 11, 40, 0.97)', 'rgba(9, 6, 28, 0.99)']}
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
          {item.active && <View style={navStyles.activeDot} />}
        </TouchableOpacity>
      ))}
    </LinearGradient>
  </LinearGradient>
);

/* ── Styles ─────────────────────────────────────────── */
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
    backgroundColor: 'rgba(107, 63, 212, 0.13)',
  },
  glowTopRight: {
    position: 'absolute',
    top: -50,
    right: -55,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(79, 195, 247, 0.07)',
  },
  glowAvatarHalo: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    left: '25%',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(107, 63, 212, 0.16)',
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: 80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(107, 63, 212, 0.08)',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
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
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(107, 63, 212, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    color: 'rgba(180, 160, 255, 0.85)',
    fontSize: 17,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
  },

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 8,
  },
  avatarGlowRing: {
    position: 'absolute',
    top: -4,
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(107, 63, 212, 0.28)',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    borderColor: 'rgba(155, 111, 255, 0.55)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  faceContainer: {
    alignItems: 'center',
    width: '100%',
  },
  faceHead: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4956A',
    marginBottom: -8,
  },
  faceBody: {
    width: 72,
    height: 38,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: '#3D3060',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#5B35CC',
    borderWidth: 2,
    borderColor: '#0A0720',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadgeIcon: {
    fontSize: 11,
    color: '#FFFFFF',
  },

  // Device card
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(30, 20, 65, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.22)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  deviceIcon: {
    fontSize: 20,
  },
  deviceLabel: {
    color: 'rgba(180, 165, 220, 0.70)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  deviceName: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  // Authorized badge
  authorizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(57, 255, 149, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 149, 0.30)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#39FF95',
  },
  authorizedText: {
    color: '#39FF95',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.4,
  },

  // Name / ID
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 4,
    textAlign: 'center',
  },
  userId: {
    color: 'rgba(175, 160, 225, 0.70)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Section label
  sectionLabel: {
    color: 'rgba(160, 140, 220, 0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 14,
    marginTop: 2,
  },

  // Actions
  actionsArea: {
    marginTop: 20,
    gap: 4,
  },
});

const navStyles = StyleSheet.create({
  gradient: {
    paddingTop: 10,
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
    position: 'relative',
  },
  icon: {
    fontSize: 20,
    color: 'rgba(160, 145, 210, 0.45)',
  },
  iconActive: {
    color: '#9B6FFF',
  },
  label: {
    fontSize: 10,
    color: 'rgba(160, 145, 210, 0.45)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: '#9B6FFF',
    fontWeight: '700',
  },
  activeDot: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9B6FFF',
  },
});

export default ProfileScreen;
