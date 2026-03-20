import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

export default function App() {
  const [status, setStatus] = useState("Ready to Scan");

  // Step A: Request Permission (Student must say "Yes" to Location/Bluetooth)
  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // Step B: The Scanning Logic (Proximity Detection)
  const startScanning = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      setStatus("Permission Denied");
      return;
    }

    setStatus("Searching for Lecturer...");

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setStatus("Scan Error: " + error.message);
        return;
      }

      if (device && device.name) {
        // If the signal is stronger than -70, the student is close!
        if (device.rssi > -70) {
          setStatus(`Lecturer Found! (RSSI: ${device.rssi})`);
          manager.stopDeviceScan(); // Stop scanning once found
        } else {
          setStatus(`Found ${device.name} (Too far away)`);
        }
      }
    });

    // Auto-stop after 10 seconds
    setTimeout(() => {
      manager.stopDeviceScan();
    }, 10000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartPresence Student</Text>
      <Text style={styles.statusText}>Status: {status}</Text>
      
      <TouchableOpacity style={styles.button} onPress={startScanning}>
        <Text style={styles.buttonText}>Check My Attendance</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  statusText: { fontSize: 16, color: 'blue', marginBottom: 40 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' }
});