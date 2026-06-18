package com.smartpresence.backend.ble;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/**
 * Validates BLE tokens using CRC16/CCITT.
 *
 * The lecturer's phone generates: CRC16(session_secret + timestamp)
 * and broadcasts it as a 4-character hex string (e.g. "A3F2").
 *
 * This validator recomputes the hash server-side and compares (case-insensitive).
 */
@Component
public class BleTokenValidator {

    /**
     * @param sessionSecret  The session secret stored in the DB.
     * @param timestamp      Unix epoch seconds from the BLE packet.
     * @param submittedToken Hex string received from the student's app.
     * @return true if the token is valid.
     */
    public boolean validate(String sessionSecret, long timestamp, String submittedToken) {
        String input = sessionSecret + timestamp;
        int computed = crc16(input.getBytes(StandardCharsets.UTF_8));
        String computedHex = String.format("%04X", computed);
        return computedHex.equalsIgnoreCase(submittedToken);
    }

    /**
     * Estimates physical distance from RSSI using the log-distance path-loss model.
     * txPower = -59 dBm at 1 metre; n = 2.0 (free-space path-loss exponent).
     *
     * @param rssi Measured RSSI in dBm (negative integer).
     * @return Distance estimate in metres.
     */
    public double estimateDistance(int rssi) {
        final int txPower = -59;
        final double n = 2.0;
        return Math.pow(10.0, (txPower - rssi) / (10.0 * n));
    }

    // CRC16/CCITT (polynomial 0x1021, initial value 0xFFFF)
    private static int crc16(byte[] data) {
        int crc = 0xFFFF;
        for (byte b : data) {
            crc ^= (b & 0xFF) << 8;
            for (int i = 0; i < 8; i++) {
                if ((crc & 0x8000) != 0) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc <<= 1;
                }
                crc &= 0xFFFF;
            }
        }
        return crc;
    }
}
