package com.smartpresence.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CheckinRequest {

    /** BLE session token captured by student app from the lecturer's broadcast */
    @NotBlank
    private String bleToken;

    /** Raw device fingerprint (IMEI / Android ID / iOS IDFV) */
    @NotBlank
    private String deviceFingerprint;

    /**
     * Averaged RSSI value in dBm from rssiSamples readings.
     * App should collect ≥3 readings over 1–2 s and send the average.
     */
    private Short rssiDbm;

    /** Number of RSSI samples averaged to produce rssiDbm */
    private Short rssiSamples;

    /** TX power from the BLE advertisement packet (dBm) */
    private Short txPowerDbm;

    /** MAC address of the beacon the student's device detected */
    private String detectedBeaconMac;

    /**
     * Result of the OS-level biometric prompt (FaceID / fingerprint).
     * Only true after the native secure enclave prompt succeeds.
     */
    @NotNull
    private boolean biometricPassed;

    /** "FaceID" | "Fingerprint" | "PIN" — for the live activity stream */
    private String biometricMethod;

    // Backwards-compat alias
    public Short getRssiValue() { return rssiDbm; }
}
