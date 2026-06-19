import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const BiometricScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Biometric Verification
      </Text>

      <Text>
        Place your finger on the sensor
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          Scan Fingerprint
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BiometricScreen;

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
    marginTop: 30,
    backgroundColor: '#16A34A',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
  },
});