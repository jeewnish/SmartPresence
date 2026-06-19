import React from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';

const LoginScreen = ({ navigation }) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Text style={{ fontSize: 24 }}>
        Login Screen
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={{
          marginTop: 20,
          backgroundColor: 'blue',
          padding: 15
        }}
      >
        <Text style={{ color: 'white' }}>
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;