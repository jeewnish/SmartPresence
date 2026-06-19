import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

const BLEDetectionScreen = () => {
  const [status, setStatus] = useState('Ready to Scan');

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startScanning = async () => {
    const permission = await requestPermission();

    if (!permission) {
      setStatus('Permission Denied');
      return;
    }

    setStatus('Scanning...');

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setStatus(error.message);
        return;
      }

      if (device && device.rssi > -70) {
        setStatus(`Lecturer Found (${device.rssi})`);
        manager.stopDeviceScan();
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Detection</Text>

      <Text>{status}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={startScanning}
      >
        <Text style={styles.buttonText}>
          Start Scan
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BLEDetectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
  },
});