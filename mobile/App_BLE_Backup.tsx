import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

export default function App() {
  const [status, setStatus] = useState("Ready to Scan");

  // ✅ Request Permissions (Android 12+ supported)
  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      return Object.values(granted).every(
        (result) => result === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
  };

  // ✅ Start BLE Scanning
  const startScanning = async () => {
    const hasPermission = await requestPermission();

    if (!hasPermission) {
      setStatus("Permission Denied ❌");
      return;
    }

    setStatus("Searching for Lecturer... 🔍");

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setStatus("Scan Error: " + error.message);
        return;
      }

      if (device) {
        const name = device.name || "Unknown Device";

        // ✅ RSSI logic (proximity detection)
        if (device.rssi && device.rssi > -70) {
          setStatus(`Lecturer Found! 📡 (RSSI: ${device.rssi})`);
          manager.stopDeviceScan();
        } else {
          setStatus(`Found ${name} (Too far away)`);
        }
      }
    });

    // ✅ Stop scan after 10 seconds
    setTimeout(() => {
      manager.stopDeviceScan();
      setStatus("Scan Stopped ⏹️");
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  statusText: {
    fontSize: 16,
    color: 'blue',
    marginBottom: 40
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
