package com.smartpresence.dto.response;

import lombok.*;
import java.time.OffsetDateTime;

/**
 * Pushed to /topic/beacons whenever a beacon status changes.
 * Powers the System Health Indicator on the Admin Dashboard.
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BeaconStatusPayload {

    private Integer        venueId;
    private String         venueCode;
    private String         venueName;
    private String         beaconMac;
    private String         status;          // ONLINE | OFFLINE | DEGRADED | UNKNOWN
    private Short          batteryPct;
    private Short          txPowerDbm;
    private Short          rssiSelfCheck;
    private OffsetDateTime lastHeartbeatAt;
    private OffsetDateTime offlineSince;
    private Short          consecutiveFailures;
    private boolean        batteryLow;
    private boolean        hasActiveSession;

    /** Overall system health: GREEN / YELLOW / RED */
    private String         systemHealth;
}
