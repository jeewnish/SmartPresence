import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'smartpresence_device_id';

function createDeviceId() {
  const random = Math.random().toString(36).slice(2, 12);
  return `sp_${Platform.OS}_${Date.now().toString(36)}_${random}`;
}

export async function getDeviceIdentity() {
  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = createDeviceId();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  }

  return {
    deviceId,
    deviceName: `${Platform.OS === 'ios' ? 'iOS' : 'Android'} device`,
    platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
  };
}
