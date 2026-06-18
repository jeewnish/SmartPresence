import React, { useEffect, useMemo, useState } from 'react';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import './global.css';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen }         from './screens/HomeScreen';
import { LecturerSpaceScreen }  from './screens/LecturerSpaceScreen';
import { OnboardingScreen }     from './screens/OnboardingScreen';
import { SignInScreen }         from './screens/SignInScreen';
import { SignUpScreen }         from './screens/SignUpScreen';
import { StudentSpaceScreen, HomeSpaceScreen } from './screens/StudentSpaceScreen';

type AppRoute = '/' | '/onboarding' | '/sign-up' | '/sign-in' | '/student' | '/lecturer' | '/home';

function getStartRoute(): AppRoute {
  if (Platform.OS !== 'web') {
    return '/';
  }

  const currentPath = (globalThis as { location?: { pathname?: string } }).location?.pathname;

  if (currentPath === '/onboarding') {
    return '/onboarding';
  }

  if (currentPath === '/sign-up') {
    return '/sign-up';
  }

  if (currentPath === '/sign-in') {
    return '/sign-in';
  }

  if (currentPath === '/student') {
    return '/student';
  }

  if (currentPath === '/home') {
    return '/home';
  }

  if (currentPath === '/lecturer') {
    return '/lecturer';
  }

  return '/';
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.otf'),
    'Inter-Medium': require('./assets/fonts/Inter-Medium.otf'),
    'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.otf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.otf'),
  });

  const [route, setRoute] = useState<AppRoute>(getStartRoute);

  const navigate = useMemo(() => {
    return (nextRoute: AppRoute) => {
      setRoute(nextRoute);

      if (Platform.OS !== 'web') {
        return;
      }

      const webWindow = globalThis as {
        history?: { pushState: (data: unknown, unused: string, url?: string) => void };
      };
      webWindow.history?.pushState({}, '', nextRoute);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const onPop = () => {
      setRoute(getStartRoute());
    };

    globalThis.addEventListener?.('popstate', onPop);
    return () => {
      globalThis.removeEventListener?.('popstate', onPop);
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      {route === '/' && (
        <HomeScreen
          onOpenStudentSpace={() => navigate('/sign-in')}
          onOpenLecturerSpace={() => navigate('/lecturer')}
        />
      )}
      {route === '/onboarding' && (
        <OnboardingScreen
          onGoBack={() => navigate('/')}
          onGetStarted={() => navigate('/sign-up')}
        />
      )}
      {route === '/sign-up' && (
        <SignUpScreen onBack={() => navigate('/')} onGoSignIn={() => navigate('/sign-in')} />
      )}
      {route === '/sign-in' && (
        <SignInScreen
          onBack={() => navigate('/sign-up')}
          onGoSignUp={() => navigate('/sign-up')}
          onVerified={() => navigate('/home')}
        />
      )}
      {route === '/student'  && <StudentSpaceScreen onExit={() => navigate('/')} />}
      {route === '/home'     && <HomeSpaceScreen    onExit={() => navigate('/')} />}
      {route === '/lecturer' && <LecturerSpaceScreen onExit={() => navigate('/')} />}
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
