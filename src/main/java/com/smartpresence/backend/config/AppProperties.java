package com.smartpresence.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Application-level configuration properties for attendance business rules.
 * Bound from the "attendance.*" prefix in application.properties.
 */
@Component
@ConfigurationProperties(prefix = "attendance")
@Data
public class AppProperties {

    private Token token = new Token();
    private Rssi rssi = new Rssi();
    private Ble ble = new Ble();
    private Offline offline = new Offline();

    @Data
    public static class Token {
        /** HMAC-SHA256 signing secret — must be ≥ 32 characters. */
        private String secret;
        /** Short-lived attendance JWT TTL in seconds. */
        private int ttlSeconds = 60;
    }

    @Data
    public static class Rssi {
        /** Minimum acceptable RSSI (dBm). Signals weaker than this are rejected. */
        private int threshold = -80;
    }

    @Data
    public static class Ble {
        /** Maximum age of a BLE timestamp for live check-in (seconds, ±). */
        private int expiryWindowSeconds = 300;
    }

    @Data
    public static class Offline {
        /** For offline-sync, max hours before session end that a timestamp is still valid. */
        private int sessionWindowHours = 24;
    }
}
