// AddCoursesScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Animated, StatusBar, SafeAreaView, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import FormInput   from './FormInput';
import AddButton   from './AddButton';
import BottomNavBar from './BottomNavBar';
import colors      from './colors';
import styles      from './addCoursesStyles';

/* ══════════════════════════════════════════════════════
   AddCoursesScreen
══════════════════════════════════════════════════════ */
const AddCoursesScreen = ({ navigation, route }) => {
  const [email, setEmail]       = useState(route?.params?.email || 'name@university.edu');
  const [courseName, setCourseName] = useState('');
  const [courseNo, setCourseNo]     = useState('');

  const screenFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenFade,  { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 70, friction: 11, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleAddCourse = () => {
    if (!courseName.trim() || !courseNo.trim()) {
      console.log('Please fill in all fields');
      return;
    }
    console.log('Adding course:', { email, courseName, courseNo });
    // Reset fields after add
    setCourseName('');
    setCourseNo('');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <LinearGradient
        colors={['#05040F', '#0A0820', '#0E0A28', '#08061C']}
        locations={[0, 0.3, 0.65, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Ambient glow blobs */}
      <View style={styles.glowTL} />
      <View style={styles.glowTR} />
      <View style={styles.glowCenter} />
      <View style={styles.glowBottom} />

      <SafeAreaView style={styles.safe}>
        <Animated.View style={{ flex: 1, opacity: screenFade }}>

          {/* ── Header ── */}
          <Animated.View style={[styles.topBar, { transform: [{ translateY: headerSlide }] }]}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation?.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <Text style={styles.pageTitle}>Add Courses</Text>

            {/* Spacer to balance the title centering */}
            <View style={styles.headerSpacer} />
          </Animated.View>

          <View style={styles.headerDivider} />

          {/* ── Form ── */}
          <KeyboardAvoidingView
            style={styles.formArea}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={10}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <FormInput
                label="University Email"
                value={email}
                onChangeText={setEmail}
                placeholder="name@university.edu"
                index={0}
                keyboardType="email-address"
              />

              <FormInput
                label="New Course"
                value={courseName}
                onChangeText={setCourseName}
                placeholder="DataBase"
                index={1}
              />

              <FormInput
                label="Course no"
                value={courseNo}
                onChangeText={setCourseNo}
                placeholder="IS11111"
                index={2}
                autoCapitalize="characters"
              />
            </ScrollView>
          </KeyboardAvoidingView>

          {/* ── Add Course button ── */}
          <View style={styles.btnArea}>
            <AddButton
              label="+ Add Course"
              onPress={handleAddCourse}
            />
          </View>

          {/* ── Bottom nav ── */}
          <BottomNavBar />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default AddCoursesScreen;
