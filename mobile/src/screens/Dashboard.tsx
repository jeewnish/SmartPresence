import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Types
interface Activity {
  id: string;
  type: 'check-in' | 'check-out';
  date: string;
  time: string;
  location: string;
}

// Mock Data
const MOCK_ACTIVITY: Activity[] = [
  { id: '1', type: 'check-in', date: 'Today', time: '08:50 AM', location: 'Mini Auditorium' },
  { id: '2', type: 'check-out', date: 'Yesterday', time: '05:15 PM', location: 'Old Auditorium' },
  { id: '3', type: 'check-in', date: 'Yesterday', time: '08:55 AM', location: 'Z hall' },
  { id: '4', type: 'check-out', date: 'Apr 01', time: '05:05 PM', location: 'Branch Office' },
];

export default function Dashboard() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const toggleStatus = () => {
    setIsCheckedIn(!isCheckedIn);
    // In a real app, this would trigger the camera scanning process or an API call
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIconContainer}>
        <Ionicons 
          name={item.type === 'check-in' ? 'log-in-outline' : 'log-out-outline'} 
          size={24} 
          color={item.type === 'check-in' ? '#4ade80' : '#f87171'} 
        />
      </View>
      <View style={styles.activityDetails}>
        <Text style={styles.activityTitle}>
          {item.type === 'check-in' ? 'Checked In' : 'Checked Out'}
        </Text>
        <Text style={styles.activitySubtitle}>{item.location}</Text>
      </View>
      <View style={styles.activityTimeContainer}>
        <Text style={styles.activityDate}>{item.date}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning, Chamidu</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={40} color="#e5e7eb" />
        </TouchableOpacity>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current Status</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: isCheckedIn ? '#4ade80' : '#9ca3af' }]} />
          <Text style={[styles.statusValue, { color: isCheckedIn ? '#4ade80' : '#9ca3af' }]}>
            {isCheckedIn ? 'Checked In' : 'Checked Out'}
          </Text>
        </View>
      </View>

      {/* Main Action Button */}
      <View style={styles.scanContainer}>
        <TouchableOpacity 
          style={[styles.scanButton, isCheckedIn ? styles.scanButtonOut : styles.scanButtonIn]}
          activeOpacity={0.8}
          onPress={toggleStatus}
        >
          <Ionicons 
            name="scan-outline" 
            size={64} 
            color="#ffffff" 
          />
          <Text style={styles.scanButtonText}>
            {isCheckedIn ? 'Scan to Check Out' : 'Scan for Attendance'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <FlatList
          data={MOCK_ACTIVITY}
          keyExtractor={(item) => item.id}
          renderItem={renderActivityItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827', // Dark gray background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  dateText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  statusCard: {
    backgroundColor: '#1f2937',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  statusLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  scanContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  scanButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  scanButtonIn: {
    backgroundColor: '#3b82f6', // Primary Blue for check-in
  },
  scanButtonOut: {
    backgroundColor: '#8b5cf6', // Purple for check-out
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  activityContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9fafb',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  activityTimeContainer: {
    alignItems: 'flex-end',
  },
  activityDate: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
