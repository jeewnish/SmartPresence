import { StyleSheet, Dimensions } from 'react-native';
import COLORS from './colors';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const scale = (size) => (width / 375) * size;
export const vs = (size) => (height / 812) * size;
export const ms = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const loginStyles = StyleSheet.create({
  // ─── Root ─────────────────────────────────────────────────────
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },

  // ─── Corner glows ─────────────────────────────────────────────
  glowTL: {
    position: 'absolute',
    top: -vs(40),
    left: -scale(40),
    width: scale(240),
    height: scale(240),
    borderRadius: scale(120),
    backgroundColor: COLORS.glowCornerTL,
  },
  glowBR: {
    position: 'absolute',
    bottom: vs(80),
    right: -scale(50),
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    backgroundColor: COLORS.glowCornerBR,
  },

  // ─── Header (hero image area) ──────────────────────────────────
  heroArea: {
    height: vs(210),
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingHorizontal: scale(24),
    paddingBottom: vs(20),
  },
  logoIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(10),
  },
  appName: {
    fontSize: ms(26),
    fontWeight: '800',
    color: COLORS.textWhite,
    letterSpacing: 0.3,
  },
  appSubtitle: {
    fontSize: ms(13),
    color: COLORS.purpleSubtitle,
    marginTop: vs(3),
    letterSpacing: 0.2,
  },

  // ─── Card Sheet ────────────────────────────────────────────────
  sheet: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: scale(28),
    borderTopRightRadius: scale(28),
    paddingHorizontal: scale(24),
    paddingTop: vs(28),
    paddingBottom: vs(24),
  },

  // ─── Welcome block ─────────────────────────────────────────────
  welcomeBlock: {
    marginBottom: vs(24),
  },
  welcomeTitle: {
    fontSize: ms(24),
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.2,
  },
  welcomeSub: {
    fontSize: ms(13),
    color: COLORS.purpleAccent,
    marginTop: vs(4),
  },

  // ─── Form ──────────────────────────────────────────────────────
  fieldWrapper: {
    marginBottom: vs(16),
  },
  fieldLabel: {
    fontSize: ms(12),
    fontWeight: '600',
    color: COLORS.textLabel,
    marginBottom: vs(7),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.2,
    borderColor: COLORS.inputBorder,
    borderRadius: scale(12),
    paddingHorizontal: scale(14),
    height: vs(50),
  },
  inputRowFocused: {
    borderColor: COLORS.inputBorderFocus,
    shadowColor: COLORS.purplePrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  inputIcon: {
    marginRight: scale(10),
  },
  textInput: {
    flex: 1,
    fontSize: ms(14),
    color: COLORS.inputText,
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: scale(4),
  },

  // Forgot row
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(4),
  },
  forgotText: {
    fontSize: ms(12),
    color: COLORS.purpleAccent,
    fontWeight: '600',
  },

  // ─── Sign In button ────────────────────────────────────────────
  btnWrapper: {
    flexDirection: 'row',
    gap: scale(10),
    marginTop: vs(6),
    marginBottom: vs(20),
  },
  signInBtn: {
    flex: 1,
    height: vs(52),
    borderRadius: scale(14),
    overflow: 'hidden',
  },
  signInGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  signInText: {
    fontSize: ms(16),
    fontWeight: '700',
    color: COLORS.textWhite,
    letterSpacing: 0.3,
  },

  // Biometric button
  bioBtn: {
    width: vs(52),
    height: vs(52),
    borderRadius: scale(14),
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.2,
    borderColor: COLORS.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Footer ────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginBottom: vs(10),
  },
  footerText: {
    fontSize: ms(13),
    color: COLORS.textGray,
  },
  footerLink: {
    color: COLORS.purpleAccent,
    fontWeight: '700',
  },

  // Bottom tab bar
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: vs(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    backgroundColor: COLORS.cardBg,
  },
  tabIcon: {
    opacity: 0.5,
    padding: scale(6),
  },
});

export default loginStyles;
