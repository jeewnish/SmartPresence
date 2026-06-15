import { StyleSheet, Dimensions } from 'react-native';
import COLORS from './colors';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Responsive scale helpers
export const scale = (size) => (width / 375) * size;
export const verticalScale = (size) => (height / 812) * size;
export const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const splashStyles = StyleSheet.create({
  // ─── Root ────────────────────────────────────────────────────
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(60),
  },

  // ─── Corner glow overlays ────────────────────────────────────
  cornerGlowTopLeft: {
    position: 'absolute',
    top: -verticalScale(60),
    left: -scale(60),
    width: scale(260),
    height: scale(260),
    borderRadius: scale(130),
    backgroundColor: COLORS.glowCorner,
    opacity: 0.55,
  },
  cornerGlowBottomRight: {
    position: 'absolute',
    bottom: -verticalScale(60),
    right: -scale(60),
    width: scale(220),
    height: scale(220),
    borderRadius: scale(110),
    backgroundColor: COLORS.glowBlue,
    opacity: 0.45,
  },
  cornerGlowTopRight: {
    position: 'absolute',
    top: verticalScale(20),
    right: -scale(40),
    width: scale(160),
    height: scale(160),
    borderRadius: scale(80),
    backgroundColor: COLORS.glowPurple,
    opacity: 0.25,
  },

  // ─── Logo section ─────────────────────────────────────────────
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Title section ────────────────────────────────────────────
  titleSection: {
    alignItems: 'center',
    marginTop: verticalScale(28),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleSmart: {
    fontSize: moderateScale(32),
    fontWeight: '900',
    color: COLORS.textWhite,
    letterSpacing: 1.5,
  },
  titlePresence: {
    fontSize: moderateScale(32),
    fontWeight: '900',
    color: COLORS.purpleBright,
    letterSpacing: 1.5,
  },
  subtitle: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: COLORS.blueCyan,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },

  // ─── Bottom section ───────────────────────────────────────────
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: scale(40),
    gap: verticalScale(14),
  },
  secureText: {
    fontSize: moderateScale(13),
    color: COLORS.textLightGray,
    textAlign: 'center',
    letterSpacing: 0.5,
    opacity: 0.85,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(7),
    marginTop: verticalScale(2),
  },
  dot: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(4),
  },
  dotActive: {
    backgroundColor: COLORS.dotActive,
    width: scale(18),
    borderRadius: scale(4),
  },
  dotInactive: {
    backgroundColor: COLORS.dotInactive,
    opacity: 0.55,
  },

  // Loading
  loadingText: {
    fontSize: moderateScale(10),
    color: COLORS.textDimGray,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: verticalScale(4),
  },
  loadingBarContainer: {
    width: scale(130),
    height: scale(3),
    backgroundColor: COLORS.barTrack,
    borderRadius: scale(3),
    overflow: 'hidden',
    marginTop: verticalScale(6),
  },
  loadingBarFill: {
    height: '100%',
    borderRadius: scale(3),
  },
});

export default splashStyles;
