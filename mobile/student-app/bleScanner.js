import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

export function scanDevices() {
  manager.startDeviceScan(null, null, (error, device) => {

    if (error) {
      console.log(error);
      return;
    }

    if (device && device.name === "SmartPresence") {
      console.log("Lecturer device found");
      console.log("RSSI:", device.rssi);
    }

  });
}