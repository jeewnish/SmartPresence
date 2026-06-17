// styles/AttendanceSuccessStyles.js
import { StyleSheet, Platform, StatusBar } from 'react-native';
import Colors from '../constants/Colors';

const AttendanceSuccessStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 28 : 0,
  },

  /* Glow blobs */
  glowTL: {
    position: 'absolute', top: -80, left: -70,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(91, 53, 204, 0.10)',
  },
  glowTR: {
    position: 'absolute', top: -50, right: -55,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(74, 108, 247, 0.07)',
  },
  glowCenter: {
    position: 'absolute', top: '18%', left: '18%',
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(91, 53, 204, 0.09)',
  },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
  },
  topBarTitle: {
    color: Colors.textWhite,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(107, 63, 212, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnText: { color: '#FFF', fontSize: 17, fontWeight: '600', lineHeight: 22, marginTop: -1 },
  bellText: { fontSize: 16 },
  bellDot: {
    position: 'absolute', top: 6, right: 7,
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: '#FF4F6E',
    borderWidth: 1.5, borderColor: Colors.bgDeep,
  },
  headerDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginBottom: 4,
  },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    alignItems: 'center',
  },

  /* Badge area */
  badgeArea: {
    marginTop: 24,
    marginBottom: 10,
    alignItems: 'center',
  },

  /* Success text */
  successTitle: {
    color: Colors.textWhite,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: 0.2,
    marginBottom: 10,
    textShadowColor: 'rgba(91, 53, 204, 0.40)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  successSubtitle: {
    color: Colors.textLight,
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.1,
    marginBottom: 24,
    paddingHorizontal: 10,
  },

  /* Card */
  cardArea: {
    width: '100%',
    marginBottom: 28,
  },

  /* Primary button */
  primaryBtnWrap: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadowPurple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
    marginBottom: 14,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryBtnText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryBtnIcon: {
    fontSize: 18,
    color: Colors.textWhite,
  },

  /* Secondary button */
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: 'rgba(160, 155, 210, 0.65)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default AttendanceSuccessStyles;
