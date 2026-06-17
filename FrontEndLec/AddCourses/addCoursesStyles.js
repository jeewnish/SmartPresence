// addCoursesStyles.js
import { StyleSheet, Platform, StatusBar } from 'react-native';
import colors from './colors';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 28 : 0,
  },

  /* Glow blobs */
  glowTL: {
    position: 'absolute', top: -80, left: -70,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(58, 43, 255, 0.12)',
  },
  glowTR: {
    position: 'absolute', top: -50, right: -55,
    width: 190, height: 190, borderRadius: 95,
    backgroundColor: 'rgba(91, 63, 220, 0.08)',
  },
  glowCenter: {
    position: 'absolute', top: '18%', left: '15%',
    width: 250, height: 220, borderRadius: 125,
    backgroundColor: 'rgba(58, 43, 255, 0.07)',
  },
  glowBottom: {
    position: 'absolute', bottom: 90, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(58, 43, 255, 0.08)',
  },

  /* Header */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(107, 63, 212, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(107, 63, 212, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: colors.textWhite,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
    marginTop: -1,
  },
  pageTitle: {
    color: colors.textWhite,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSpacer: { width: 36 },

  headerDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: 8,
  },

  /* Scroll / form */
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
    flexGrow: 1,
  },

  formArea: {
    flex: 1,
  },

  /* Button area */
  btnArea: {
    paddingHorizontal: 22,
    paddingBottom: 10,
    paddingTop: 8,
  },
});

export default styles;
