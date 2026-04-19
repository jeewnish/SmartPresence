package com.smartpresence.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

/**
 * POSTed by the physical BLE beacon hardware every ~30 seconds.
 * The beacon MAC address is the lookup key — it maps to a venue in the DB.
 *
 * Beacon firmware sends this to:
 *   POST /api/v1/beacons/heartbeat
 *
 * Authentication: static bearer token configured in beacon firmware
 * (stored in system_settings as "beacon_api_key").
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BeaconHeartbeatRequest {

    /** MAC address in format AA:BB:CC:DD:EE:FF */
    @NotBlank
    @Pattern(regexp = "^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$",
             message = "Invalid MAC address format")
    private String beaconMac;

    /** Beacon firmware version string e.g. "2.4.1" */
    private String firmwareVersion;

    /** Battery percentage 0–100 */
    private Short batteryPct;

    /** Configured TX power in dBm (e.g. -12, -8, -4, 0, +4) */
    private Short txPowerDbm;

    /** Beacon's own RSSI self-check reading — detects hardware degradation */
    private Short rssiSelfCheck;

    /** Seconds since last reboot */
    private Long uptimeSeconds;

    /** Number of BLE advertisement packets sent since last heartbeat */
    private Long advertisementCount;

    /** Ambient temperature in Celsius (if sensor available) */
    private Double temperatureCelsius;
}
