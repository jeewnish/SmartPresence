import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const AttendanceSuccessScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✅</Text>

      <Text style={styles.title}>
        Attendance Marked Successfully
      </Text>

      <Text style={styles.subtitle}>
        Your attendance has been recorded
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Back to Dashboard
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AttendanceSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    marginTop: 10,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
  },
});