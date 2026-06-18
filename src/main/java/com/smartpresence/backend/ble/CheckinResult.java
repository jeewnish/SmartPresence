package com.smartpresence.backend.ble;

public enum CheckinResult {
    SUCCESS,
    INVALID_TOKEN,
    TOKEN_EXPIRED,
    LOW_RSSI,
    INVALID_DEVICE,
    ALREADY_PRESENT,
    INVALID_SESSION,
    BIOMETRIC_FAILED
}
