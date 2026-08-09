import { Animated } from 'react-native';

export type StudentSpaceScreenProps = {
  onExit: () => void;
};

export type StudentTab = 'radar' | 'progress' | 'alerts';

/** Tabs for the new home-dashboard shell */
export type HomeTab = 'home' | 'schedule' | 'alerts' | 'settings';

export type HomeSpaceScreenProps = {
  onExit: () => void;
};
export type RadarState = 'scanning' | 'verify' | 'success';

export type ModuleStatus = 'good' | 'warning' | 'danger';

export type ModuleCard = {
  id: string;
  title: string;
  attendanceRate: number;
  status: ModuleStatus;
  recentCheckIns: string[];
};

export type RadarPageProps = {
  radarState: RadarState;
  signalFound: boolean;
  isCheckingIn: boolean;
  checkinMessage: string;
  bleTokenInput: string;
  onBleTokenChange: (value: string) => void;
  lookupMessage: string;
  pulseOpacity: Animated.Value;
  pulseScale: Animated.Value;
  signalCardOpacity: Animated.Value;
  signalCardTranslateY: Animated.Value;
  onOpenVerify: () => void;
  onResetDemo: () => void;
};
