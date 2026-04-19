package com.smartpresence.ble.beacon;

import com.smartpresence.dto.request.BeaconHeartbeatRequest;
import com.smartpresence.entity.*;
import com.smartpresence.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Processes incoming heartbeat pings from physical BLE beacons
 * and maintains the beacon_status_log (current health view).
 *
 * Flow:
 *  1. Beacon hardware POSTs a heartbeat every ~30 seconds.
 *  2. We write a row to beacon_heartbeats (rolling log).
 *  3. We upsert beacon_status_log (single current-state row per venue).
 *  4. If battery < 20% or consecutive failures detected → raise notification.
 *
 * Offline detection is handled separately by BeaconHealthScheduler.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BeaconMonitorService {

    private static final int  LOW_BATTERY_THRESHOLD   = 20;   // %
    private static final int  DEGRADED_RSSI_THRESHOLD = -80;  // dBm self-check

    private final BeaconHeartbeatRepository  heartbeatRepo;
    private final BeaconStatusLogRepository  statusLogRepo;
    private final VenueRepository            venueRepo;
    private final NotificationRepository     notificationRepo;
    private final UserRepository             userRepository;

    // ── Heartbeat ingestion ───────────────────────────────────────────────────

    @Transactional
    public BeaconHeartbeat receiveHeartbeat(BeaconHeartbeatRequest req) {

        Venue venue = venueRepo.findByBeaconMac(req.getBeaconMac())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unknown beacon MAC: " + req.getBeaconMac()));

        // Determine beacon health from the reported metrics
        BeaconHeartbeat.BeaconStatus status = determineStatus(req);

        // 1. Write to rolling heartbeat log
        BeaconHeartbeat heartbeat = BeaconHeartbeat.builder()
                .venue(venue)
                .beaconMac(req.getBeaconMac())
                .status(status)
                .firmwareVersion(req.getFirmwareVersion())
                .batteryPct(req.getBatteryPct())
                .txPowerDbm(req.getTxPowerDbm())
                .rssiSelfCheck(req.getRssiSelfCheck())
                .uptimeSeconds(req.getUptimeSeconds())
                .build();
        heartbeatRepo.save(heartbeat);

        // 2. Upsert current status row
        BeaconStatusLog statusLog = statusLogRepo.findByVenueVenueId(venue.getVenueId())
                .orElseGet(() -> BeaconStatusLog.builder().venue(venue)
                        .beaconMac(req.getBeaconMac()).build());

        boolean wasOffline = statusLog.getCurrentStatus() == BeaconHeartbeat.BeaconStatus.OFFLINE;

        statusLog.setCurrentStatus(status);
        statusLog.setLastHeartbeatAt(OffsetDateTime.now());
        statusLog.setFirmwareVersion(req.getFirmwareVersion());
        statusLog.setBatteryPct(req.getBatteryPct());
        statusLog.setTxPowerDbm(req.getTxPowerDbm());
        statusLog.setConsecutiveFailures((short) 0);
        statusLog.setUpdatedAt(OffsetDateTime.now());

        if (status == BeaconHeartbeat.BeaconStatus.ONLINE) {
            statusLog.setLastOnlineAt(OffsetDateTime.now());
            statusLog.setOfflineSince(null);
        }
        statusLogRepo.save(statusLog);

        // 3. Alerts
        if (wasOffline && status == BeaconHeartbeat.BeaconStatus.ONLINE) {
            notifyAdmins("✅ Beacon Back Online — " + venue.getVenueCode(),
                    "Beacon at " + venue.getVenueName() + " (MAC: " + req.getBeaconMac() +
                    ") is back online after being offline.", venue);
        }

        if (req.getBatteryPct() != null && req.getBatteryPct() <= LOW_BATTERY_THRESHOLD) {
            log.warn("🔋 Low battery on beacon {} at venue {}: {}%",
                    req.getBeaconMac(), venue.getVenueCode(), req.getBatteryPct());
            notifyAdmins("🔋 Low Battery — Beacon at " + venue.getVenueCode(),
                    "Beacon battery at " + venue.getVenueName() + " is " +
                    req.getBatteryPct() + "%. Please replace the battery.", venue);
        }

        log.debug("Heartbeat received — venue={} status={} battery={}%",
                venue.getVenueCode(), status, req.getBatteryPct());
        return heartbeat;
    }

    // ── Offline marking (called by scheduler) ─────────────────────────────────

    @Transactional
    public void markOfflineIfStale(int staleAfterSeconds) {
        OffsetDateTime cutoff = OffsetDateTime.now().minusSeconds(staleAfterSeconds);

        List<BeaconStatusLog> staleLogs = statusLogRepo.findAll().stream()
                .filter(s -> s.getLastHeartbeatAt() != null
                          && s.getLastHeartbeatAt().isBefore(cutoff)
                          && s.getCurrentStatus() != BeaconHeartbeat.BeaconStatus.OFFLINE)
                .toList();

        for (BeaconStatusLog s : staleLogs) {
            s.setCurrentStatus(BeaconHeartbeat.BeaconStatus.OFFLINE);
            s.setOfflineSince(cutoff);
            s.setConsecutiveFailures((short) (s.getConsecutiveFailures() + 1));
            s.setUpdatedAt(OffsetDateTime.now());
            statusLogRepo.save(s);

            log.warn("📡 Beacon OFFLINE — venue={} mac={} last-seen={}",
                    s.getVenue().getVenueCode(), s.getBeaconMac(), s.getLastHeartbeatAt());

            notifyAdmins("📡 Beacon Offline — " + s.getVenue().getVenueCode(),
                    "Beacon at " + s.getVenue().getVenueName() + " (MAC: " + s.getBeaconMac() +
                    ") has not sent a heartbeat since " + s.getLastHeartbeatAt() + ". " +
                    "Active sessions in this room may be affected.",
                    s.getVenue());
        }
    }

    // ── Status queries ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BeaconStatusLog> getAllBeaconStatuses() {
        return statusLogRepo.findAllByOrderByVenueVenueIdAsc();
    }

    @Transactional(readOnly = true)
    public boolean isVenueBeaconOnline(Integer venueId) {
        return statusLogRepo.findByVenueVenueId(venueId)
                .map(BeaconStatusLog::isOnline)
                .orElse(false);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private BeaconHeartbeat.BeaconStatus determineStatus(BeaconHeartbeatRequest req) {
        if (req.getRssiSelfCheck() != null && req.getRssiSelfCheck() < DEGRADED_RSSI_THRESHOLD) {
            return BeaconHeartbeat.BeaconStatus.DEGRADED;
        }
        return BeaconHeartbeat.BeaconStatus.ONLINE;
    }

    private void notifyAdmins(String title, String body, Venue venue) {
        // BUG FIX: findAll() loaded every user in the DB and filtered in memory.
        // On any real dataset this is unacceptable; use a targeted query instead.
        userRepository.findByRoleAndIsActive(com.smartpresence.entity.UserRole.ADMIN, true)
                .forEach(admin -> notificationRepo.save(
                        Notification.builder()
                                .recipient(admin)
                                .notificationType(Notification.NotificationType.SYSTEM_HEALTH)
                                .title(title)
                                .body(body)
                                .relatedEntityType("venue")
                                .relatedEntityId(venue.getVenueId())
                                .isRead(false)
                                .build()));
    }
}
