// AttendanceSuccessScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Animated, StatusBar, SafeAreaView, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import SuccessBadge  from './components/SuccessBadge';
import InfoCard      from './components/InfoCard';
import BottomTabBar  from './components/BottomTabBar';
import Colors        from './constants/Colors';
import S             from './styles/AttendanceSuccessStyles';

const AttendanceSuccessScreen = ({ navigation }) => {
  /* ── Entrance animations ── */
  const screenFade    = useRef(new Animated.Value(0)).current;
  const headerSlide   = useRef(new Animated.Value(-16)).current;
  const contentFade   = useRef(new Animated.Value(0)).current;
  const contentSlide  = useRef(new Animated.Value(20)).current;
  const btnScale      = useRef(new Animated.Value(1)).current;
  const secBtnOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenFade,  { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 70, friction: 11, useNativeDriver: true }),
      Animated.timing(contentFade, { toValue: 1, duration: 550, delay: 200, useNativeDriver: true }),
      Animated.spring(contentSlide,{ toValue: 0, tension: 60, friction: 11, delay: 200, useNativeDriver: true }),
      Animated.timing(secBtnOpacity,{ toValue: 1, duration: 500, delay: 750, useNativeDriver: true }),
    ]).start();
  }, []);

  const onBtnIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onBtnOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background */}
      <LinearGradient
        colors={['#080920', '#0D0B22', '#111328', '#090A1E']}
        locations={[0, 0.3, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Glow blobs */}
      <View style={S.glowTL} />
      <View style={S.glowTR} />
      <View style={S.glowCenter} />

      <SafeAreaView style={S.safe}>
        <Animated.View style={{ flex: 1, opacity: screenFade }}>

          {/* ── Header ── */}
          <Animated.View style={[S.topBar, { transform: [{ translateY: headerSlide }] }]}>
            <TouchableOpacity
              style={S.iconBtn}
              onPress={() => navigation?.goBack()}
              activeOpacity={0.7}
            >
              <Text style={S.iconBtnText}>←</Text>
            </TouchableOpacity>

            <Text style={S.topBarTitle}>Attendance Status</Text>

            <TouchableOpacity style={S.iconBtn} activeOpacity={0.7}>
              <Text style={S.bellText}>🔔</Text>
              <View style={S.bellDot} />
            </TouchableOpacity>
          </Animated.View>

          {/* Thin divider below header */}
          <View style={S.headerDivider} />

          {/* ── Scrollable body ── */}
          <ScrollView
            style={S.scroll}
            contentContainerStyle={S.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Success badge */}
            <View style={S.badgeArea}>
              <SuccessBadge />
            </View>

            {/* Success text */}
            <Animated.View
              style={{
                opacity: contentFade,
                transform: [{ translateY: contentSlide }],
                alignItems: 'center',
              }}
            >
              <Text style={S.successTitle}>
                Attendance Marking{'\n'}Finished
              </Text>
              <Text style={S.successSubtitle}>
                Your presence has been recorded for{'\n'}today's session.
              </Text>
            </Animated.View>

            {/* Course info card */}
            <View style={S.cardArea}>
              <InfoCard />
            </View>

            {/* Primary button */}
            <Animated.View style={[S.primaryBtnWrap, { transform: [{ scale: btnScale }] }]}>
              <TouchableOpacity
                onPress={() => navigation?.navigate('Home')}
                onPressIn={onBtnIn}
                onPressOut={onBtnOut}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#5440CC', '#3D28B8', '#2E1FAA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={S.primaryBtn}
                >
                  <Text style={S.primaryBtnText}>Back to Dashboard</Text>
                  <Text style={S.primaryBtnIcon}>⊞</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Secondary button */}
            <Animated.View style={{ opacity: secBtnOpacity }}>
              <TouchableOpacity
                style={S.secondaryBtn}
                onPress={() => navigation?.navigate('History')}
                activeOpacity={0.65}
              >
                <Text style={S.secondaryBtnText}>View History</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>

          {/* ── Bottom tab bar ── */}
          <BottomTabBar />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};


export default AttendanceSuccessScreen;
