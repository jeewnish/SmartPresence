// SmartPresence Design System — all tokens derived from DESIGN.md

export const Colors = {
  // Core Palette
  primaryBackground: '#FDFDFD',
  elevatedSurface: '#FFFFFF',
  secondarySurface: '#E8E8E7',
  border: '#BAC0BE',
  primaryText: '#3C3D48',
  secondaryText: '#BAC0BE',
  primaryAccent: '#F6A242',
  secondaryAccent: '#E6C18B',

  // Attendance Status System
  present: '#4E8D63',
  presentLight: 'rgba(78, 141, 99, 0.12)',
  absent: '#C05A5A',
  absentLight: 'rgba(192, 90, 90, 0.12)',
  late: '#D89A3C',
  lateLight: 'rgba(216, 154, 60, 0.12)',
  excused: '#6B84A6',
  excusedLight: 'rgba(107, 132, 166, 0.12)',

  // Header variants
  headerGreen: '#4E8D63',
  highlightCardBg: 'rgba(230, 193, 139, 0.18)',
};

export const Typography = {
  // Playfair Display — titles and metrics
  h1: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 36,
    color: Colors.primaryText,
  },
  h2: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 24,
    color: Colors.primaryText,
  },
  pageTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: Colors.primaryText,
  },
  metricValue: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: Colors.primaryAccent,
  },

  // Lato — all functional content
  h3: {
    fontFamily: 'Lato_700Bold',
    fontSize: 18,
    color: Colors.primaryText,
  },
  bodyLarge: {
    fontFamily: 'Lato_400Regular',
    fontSize: 16,
    color: Colors.primaryText,
  },
  bodyMedium: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.primaryText,
  },
  label: {
    fontFamily: 'Lato_700Bold',
    fontSize: 14,
    color: Colors.primaryText,
  },
  labelMedium: {
    fontFamily: 'Lato_400Regular',
    fontSize: 14,
    color: Colors.primaryText,
  },
  caption: {
    fontFamily: 'Lato_400Regular',
    fontSize: 12,
    color: Colors.secondaryText,
  },
  captionBold: {
    fontFamily: 'Lato_700Bold',
    fontSize: 12,
    color: Colors.secondaryText,
  },
  buttonLabel: {
    fontFamily: 'Lato_700Bold',
    fontSize: 15,
  },
  navLabel: {
    fontFamily: 'Lato_400Regular',
    fontSize: 11,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radii = {
  standard: 8,
  card: 12,
  large: 16,
  full: 9999,
};

export const Shadows = {
  card: {
    boxShadow: '0 4px 12px rgba(60, 61, 72, 0.05)',
  },
  nav: {
    boxShadow: '0 -4px 12px rgba(60, 61, 72, 0.05)',
  },
};
