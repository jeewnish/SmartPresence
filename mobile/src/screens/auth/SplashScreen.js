import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

const SplashScreen = ({ navigation }) => {

  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login');
    }, 3000);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: 'bold' }}>
        SmartPresence
      </Text>

      <Text>
        AI Powered Attendance System
      </Text>
    </View>
  );
};

export default SplashScreen;