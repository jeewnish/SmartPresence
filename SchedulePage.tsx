import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ─── Static mock data ─────────────────────────────────────────────────────────

type ScheduleItem = {
  id: string;
  day: string;
  code: string;
  name: string;
  time: string;
  venue: string;
};

const WEEKLY_SCHEDULE: ScheduleItem[] = [
  { id: '1',  day: 'Monday',    code: 'IS31000', name: 'Web Application',       time: '08:00 – 10:00 A.M.', venue: 'Lab A' },
  { id: '2',  day: 'Monday',    code: 'IS31002', name: 'Operation System',       time: '11:00 – 01:00 P.M.', venue: 'Room 204' },
  { id: '3',  day: 'Tuesday',   code: 'IS31008', name: 'System Administration',  time: '09:00 – 11:00 A.M.', venue: 'Lab B' },
  { id: '4',  day: 'Wednesday', code: 'IS31001', name: 'IS Strategies',          time: '01:00 – 03:00 P.M.', venue: 'Room 101' },
  { id: '5',  day: 'Thursday',  code: 'IS31000', name: 'Web Application',        time: '08:00 – 10:00 A.M.', venue: 'Lab A' },
  { id: '6',  day: 'Thursday',  code: 'IS31002', name: 'Operation System',       time: '02:00 – 04:00 P.M.', venue: 'Room 204' },
  { id: '7',  day: 'Friday',    code: 'IS31008', name: 'System Administration',  time: '10:00 – 12:00 P.M.', venue: 'Lab B' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// ─── Component ────────────────────────────────────────────────────────────────

export function SchedulePage() {
  return (
    <View style={styles.root}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Weekly Schedule</Text>
        <Text style={styles.pageSubtitle}>Semester 4 – 2025</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {DAYS.map(day => {
          const items = WEEKLY_SCHEDULE.filter(s => s.day === day);
          if (items.length === 0) return null;
          return (
            <View key={day} style={styles.daySection}>
              {/* Day label */}
              <View style={styles.dayLabelRow}>
                <View style={styles.dayDot} />
                <Text style={styles.dayLabel}>{day}</Text>
              </View>

              {/* Sessions */}
              {items.map((item, idx) => (
                <View
                  key={item.id}
                  style={[styles.sessionCard, idx === 0 && styles.sessionCardFirst]}
                >
                  <View style={styles.sessionAccent} />
                  <View style={styles.sessionBody}>
                    <Text style={styles.sessionCode}>{item.code}</Text>
                    <Text style={styles.sessionName}>{item.name}</Text>
                    <View style={styles.sessionMeta}>
                      <Ionicons name="time-outline" size={12} color="#AAAAAA" />
                      <Text style={styles.sessionMetaText}>{item.time}</Text>
                      <Ionicons name="location-outline" size={12} color="#AAAAAA" style={{ marginLeft: 10 }} />
                      <Text style={styles.sessionMetaText}>{item.venue}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {/* Bottom spacing */}
        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const ORANGE = '#E8871A';
const BG     = '#FAF9F6';
const WHITE  = '#FFFFFF';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  pageHeader: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: BG,
  },
  pageTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: '#1A1A1A',
  },
  pageSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  daySection: {
    marginBottom: 18,
  },
  dayLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ORANGE,
    marginRight: 8,
  },
  dayLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sessionCardFirst: {},
  sessionAccent: {
    width: 4,
    backgroundColor: ORANGE,
  },
  sessionBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sessionCode: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: ORANGE,
    marginBottom: 2,
  },
  sessionName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#2D2D2D',
    marginBottom: 6,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionMetaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#AAAAAA',
    marginLeft: 3,
  },
});
