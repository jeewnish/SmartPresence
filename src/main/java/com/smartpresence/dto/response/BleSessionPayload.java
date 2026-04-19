package com.smartpresence.dto.response;

import lombok.*;
import java.time.OffsetDateTime;

/**
 * Sent to WebSocket topic /topic/session/{id} on every token issuance,
 * rotation, and session end.
 *
 * The Lecturer App reads bleToken and begins/updates its BLE advertisement.
 * The Student App reads bleToken to know what token the beacon should be
 * broadcasting — used to verify the captured BLE signal.
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BleSessionPayload {

    private Integer        sessionId;
    private String         courseCode;
    private String         courseName;
    private String         venueCode;
    private String         beaconMac;

    /** The current valid BLE token — null means the session has ended */
    private String         bleToken;

    /** Hard expiry of this token — client must not accept after this time */
    private OffsetDateTime tokenExpiresAt;

    /** False = session ended, clients should stop scanning */
    private boolean        sessionActive;

    /** How many times the token has been rotated in this session */
    private Short          rotationCount;

    /** Recommended TX power for the lecturer app's BLE advertisement (dBm) */
    private Short          recommendedTxPower;
}
