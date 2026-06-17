// components/InfoCard.js
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

const Row = ({ icon, label, value, half }) => (
  <View style={[styles.row, half && styles.halfRow]}>
    <View style={styles.rowLeft}>
      {icon ? <Text style={styles.rowIcon}>{icon}</Text> : null}
      <View style={styles.rowTexts}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  </View>
);

const InfoCard = () => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 550, delay: 500, useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, tension: 60, friction: 11, delay: 500, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Blue accent top bar */}
      <View style={styles.accentBar} />

      <View style={styles.body}>
        {/* Course details header */}
        <Text style={styles.sectionLabel}>COURSE DETAILS</Text>

        {/* Course name */}
        <View style={styles.courseRow}>
          <View style={styles.courseIconBox}>
            <Text style={styles.courseIcon}>📖</Text>
          </View>
          <Text style={styles.courseName}>IS3100 - Advanced{'\n'}Algorithms</Text>
        </View>

        <View style={styles.divider} />

        {/* Attendance count */}
        <Row icon="👤" label="Attendance count" value="12" />

        <View style={styles.divider} />

        {/* Time + Hall No side by side */}
        <View style={styles.twoColRow}>
          <View style={styles.colItem}>
            <Text style={styles.rowIcon}>🕐</Text>
            <View style={styles.rowTexts}>
              <Text style={styles.rowLabel}>Time</Text>
              <Text style={styles.rowValue}>10:15 AM</Text>
            </View>
          </View>
          <View style={styles.colDivider} />
          <View style={styles.colItem}>
            <Text style={styles.rowIcon}>🏫</Text>
            <View style={styles.rowTexts}>
              <Text style={styles.rowLabel}>Hall No</Text>
              <Text style={styles.rowValue}>Hall 4B</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#C8CAE0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 7,
  },
  accentBar: {
    height: 4,
    backgroundColor: '#5B35CC',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  body: {
    padding: 18,
  },
  sectionLabel: {
    color: '#5B35CC',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  courseIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(91, 53, 204, 0.14)',
    justifyContent: 'center', alignItems: 'center',
  },
  courseIcon: { fontSize: 18 },
  courseName: {
    color: '#1A1A3E',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.1,
    lineHeight: 22,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(91, 53, 204, 0.14)',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowIcon: { fontSize: 17, color: '#5B35CC' },
  rowTexts: { gap: 2 },
  rowLabel: {
    color: '#5B35CC',
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  rowValue: {
    color: '#1A1A3E',
    fontSize: 14.5,
    fontWeight: '700',
  },
  halfRow: { flex: 1 },

  // Two-column bottom row
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(91, 53, 204, 0.18)',
    marginHorizontal: 12,
  },
});

export default InfoCard;
