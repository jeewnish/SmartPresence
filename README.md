# SmartPresence — Attendance & Analytics Ecosystem
## IS 4110 Capstone Project — Group 08
### Sabaragamuwa University of Sri Lanka

---

## Overview

SmartPresence replaces manual attendance with a **three-layer secure check-in**:

| Layer | Technology | Prevents |
|---|---|---|
| **1 — Physical proximity** | BLE RSSI + distance estimation | Remote check-in from outside the room |
| **2 — Identity** | OS native biometric (FaceID / Fingerprint) | Buddy punching |
| **3 — Device binding** | Hardware fingerprint (IMEI / Android ID / IDFV) | Account sharing |

---

## Tech Stack

| Component | Technology |
|---|---|
| Backend | Java 21 · Spring Boot 3.2 |
| Database | PostgreSQL 15+ |
| Migrations | Flyway (V1–V5) |
| Auth | JWT (JJWT 0.12) + Spring Security |
| Real-time | STOMP over WebSocket (SockJS fallback) |
| Build | Maven |
| Docs | SpringDoc OpenAPI (Swagger UI) |

---

## Quick Start

### 1. Prerequisites

```bash
java --version      # must be 21+
psql --version      # must be 15+
mvn --version       # must be 3.8+
```

### 2. Create the Database

```sql
CREATE DATABASE smartpresence;
CREATE USER smartpresence_user WITH PASSWORD 'changeme';
GRANT ALL PRIVILEGES ON DATABASE smartpresence TO smartpresence_user;
```

### 3. Configure Environment

```bash
export DB_USERNAME=smartpresence_user
export DB_PASSWORD=changeme
export JWT_SECRET=SmartPresenceSecretKeyChangeInProductionMin64CharsLong!!
export BEACON_API_KEY=sp-beacon-key-change-in-prod
```

Or edit `src/main/resources/application.yml` directly for local dev.

### 4. Run

```bash
./mvnw spring-boot:run
```

Flyway automatically runs all 5 migrations on startup:

| Migration | What it does |
|---|---|
| `V1__initial_schema.sql` | All 18 tables, ENUMs, indexes, 5 views, triggers, default settings |
| `V2__seed_data.sql` | Minimal seed (departments, courses, venues, 1 admin) |
| `V3__sandbox_data.sql` | Full sandbox: 51 users, 60+ sessions, 500+ records |
| `V4__ble_system.sql` | BLE-specific tables: heartbeats, broadcast events, checkin events |
| `V5__ble_sandbox_data.sql` | BLE sandbox data: beacon states, heartbeat history, RSSI events |

### 5. Open Swagger UI

```
http://localhost:8080/api/v1/swagger-ui.html
```

---

## Test Accounts

All sandbox accounts use password: **`Pass@1234`**

| Role | Email | Notes |
|---|---|---|
| Admin | `admin@smartpresence.lk` | Full access |
| Admin | `saranga@susl.lk` | Secondary admin |
| Lecturer | `nirubikaa@susl.lk` | Assigned IS4110, IS3210 |
| Lecturer | `harshani@susl.lk` | Assigned SE3110, SE4210 |
| Student | `sandeepa@student.susl.lk` | Normal student (22CIS0272) |
| Student | `flagged@student.susl.lk` | Has open security flags + revoked device |
| Student | `absent@student.susl.lk` | ~30% attendance (triggers low-attendance alert) |
| Student | `suspended@student.susl.lk` | Account suspended (`is_active = false`) |
| Student | `newstudent@student.susl.lk` | No device registered yet |

---

## API Reference

### Authentication

```http
POST /auth/login
Content-Type: application/json
{ "email": "admin@smartpresence.lk", "password": "Pass@1234" }

→ { "token": "eyJ...", "role": "ADMIN", "fullName": "System Admin" }
```

All subsequent requests: `Authorization: Bearer <token>`

---

### Session Lifecycle (Lecturer App)

```
POST   /sessions/start                   Start session, issues BLE token
POST   /sessions/{id}/end                End session normally
POST   /sessions/{id}/force-end?reason=  Admin force-end
POST   /sessions/{id}/override           Manually mark student present/absent
GET    /sessions/{id}/attendance         Live attendance list for a session
GET    /sessions/my-active               Lecturer's own active sessions
```

### BLE Token Management (Lecturer App)

```
GET    /ble/session/{id}/token           Get current BLE token
POST   /ble/session/{id}/rotate-token    Manually rotate token
GET    /ble/session/{id}/token-status    Is token near expiry?
GET    /ble/session/{id}/events          Full token audit log
GET    /ble/session/lookup?bleToken=     Student app pre-check
```

### Student Check-in

```
POST   /checkin/register-device          One-time device binding
POST   /checkin                          Submit check-in (3-layer)
```

**Check-in request body:**
```json
{
  "bleToken": "1a2b3c.XXXXXXXX",
  "deviceFingerprint": "FP-ABCDEF123456",
  "rssiDbm": -61,
  "rssiSamples": 4,
  "txPowerDbm": -4,
  "detectedBeaconMac": "AA:BB:CC:DD:EE:01",
  "biometricPassed": true,
  "biometricMethod": "FaceID"
}
```

### Beacon Heartbeat (Physical Hardware)

```
POST   /beacons/heartbeat                Hardware beacon ping (API-key auth)
GET    /beacons                          All beacon statuses (Admin)
GET    /beacons/health                   GREEN | YELLOW | RED (Admin/Lecturer)
GET    /beacons/venue/{id}               Single venue beacon status
```

**Heartbeat request body:**
```json
{
  "beaconMac": "AA:BB:CC:DD:EE:01",
  "firmwareVersion": "2.4.1",
  "batteryPct": 87,
  "txPowerDbm": -4,
  "rssiSelfCheck": -58,
  "uptimeSeconds": 604800
}
```
Header: `Authorization: Beacon sp-beacon-key-change-in-prod`

### Admin Dashboard

```
GET    /dashboard/kpis                   4 KPI card values
GET    /dashboard/active-sessions        Live sessions board
GET    /dashboard/alerts                 Unresolved security flags feed
GET    /users?role=STUDENT&search=       User directory with filters
GET    /users/{id}                       Quick-view drawer profile
PATCH  /users/{id}/status?active=false   Suspend / activate account
GET    /courses                          Course roster grid
POST   /courses/{id}/assign-lecturer     Quick assign modal
GET    /reports/course-attendance        Course attendance report
GET    /reports/student-summary          Student summary report
GET    /reports/security-anomalies       Security anomalies report
GET    /settings/group/BLE               Settings by group tab
PUT    /settings/{key}?value=            Update setting (BLE slider etc.)
GET    /audit-logs                       Read-only audit trail
PATCH  /security-flags/{id}/resolve      Resolve a security flag
```

---

## WebSocket Topics

Connect: `ws://localhost:8080/api/v1/ws`  
STOMP header: `Authorization: Bearer <token>`

| Topic | Who subscribes | What arrives |
|---|---|---|
| `/topic/session/{id}` | Lecturer App + Student App | `BleSessionPayload` — new token on every rotation |
| `/topic/live-checkins/{id}` | Admin Dashboard + Lecturer App | `LiveCheckinEvent` — each student as they check in |
| `/topic/beacons` | Admin Dashboard | `BeaconStatusPayload` — beacon health changes |
| `/user/queue/ble-token` | Lecturer App (private) | Same `BleSessionPayload` — private channel |
| `/user/queue/notifications` | Any authenticated user | `Notification` — alerts and announcements |

**Ping to confirm subscription:**
```
SEND /app/session/{id}/ping
→ {"status":"ACTIVE","bleToken":"...","expiresAt":"..."}
```

---

## BLE System Architecture

```
Physical Beacon (ESP32 / Nordic nRF52)
    │
    │  POST /beacons/heartbeat every 30 s
    ▼
BeaconMonitorService
    ├── writes beacon_heartbeats (rolling log)
    ├── upserts beacon_status_log (current state)
    ├── raises Notification if OFFLINE or low battery
    └── pushes BeaconStatusPayload → /topic/beacons

Lecturer starts session
    │
    ▼
SessionService.startSession()
    └── BleBroadcastService.issueInitialToken()
            ├── BleTokenService.generateInitialToken()  → "1a2b3c.RANDOM..."
            ├── saves ble_broadcast_events (TOKEN_ISSUED)
            └── pushes BleSessionPayload → /topic/session/{id}
                                         → /user/queue/ble-token (lecturer only)

BleTokenRefreshScheduler (every 60 s)
    ├── rotates tokens within 60 s of expiry → TOKEN_ROTATED event + WebSocket push
    ├── marks beacons OFFLINE if no heartbeat in 120 s
    └── auto-ends sessions overdue by > 30 min

Student detects BLE advertisement (token in payload)
    │
    │  POST /checkin  {bleToken, rssiDbm, rssiSamples, txPowerDbm, biometricPassed, ...}
    ▼
AttendanceService.processCheckin()
    ├── Layer 1: BleCheckinValidator.validate()
    │       ├── token match + expiry check
    │       ├── RSSI >= venue rssi_threshold
    │       ├── distance estimate via log-distance path-loss model
    │       └── writes ble_checkin_events (always, pass or fail)
    ├── Layer 2: biometricPassed check
    ├── Layer 3: device fingerprint vs device_registrations
    ├── writes AttendanceRecord (present/late)
    └── wsController.pushLiveCheckinEvent() → /topic/live-checkins/{id}
```

---

## Beacon Demo States (Sandbox)

| Venue | Status | Notes |
|---|---|---|
| LH-A, LH-B, LH-C | 🟢 ONLINE | Normal — 2 live sessions here |
| LAB-401, LAB-402 | 🟢 ONLINE | Normal |
| SEM-201 | 🟢 ONLINE | Normal |
| **LAB-403** | 🔴 **OFFLINE** | No heartbeat for 5 min — triggers alert |
| **SEM-202** | 🟡 **DEGRADED** | Battery 15% — triggers low-battery notification |

---

## Project Structure

```
src/main/java/com/smartpresence/
├── SmartPresenceApplication.java      @SpringBootApplication + @EnableScheduling
├── ble/
│   ├── BleTokenService.java           Token generation, validation, rotation
│   ├── beacon/
│   │   └── BeaconMonitorService.java  Heartbeat processing, offline detection
│   ├── broadcast/
│   │   └── BleBroadcastService.java   Token lifecycle, event log, WebSocket push
│   ├── scheduler/
│   │   └── BleTokenRefreshScheduler.java  3 @Scheduled tasks
│   └── validator/
│       └── BleCheckinValidator.java   RSSI + distance + ble_checkin_events
├── config/
│   ├── AsyncConfig.java               Thread pool for @Async and @Scheduled
│   ├── GlobalExceptionHandler.java    Unified error responses
│   ├── OpenApiConfig.java             Swagger UI + JWT bearer auth
│   └── SecurityConfig.java           Route guards, JWT filter, WebSocket allowances
├── controller/                        12 REST controllers
├── dto/
│   ├── request/                       6 request DTOs
│   └── response/                      9 response DTOs
├── entity/                            20 JPA entities
├── repository/                        20 Spring Data repositories
├── security/
│   ├── JwtAuthenticationFilter.java
│   └── JwtTokenProvider.java
├── service/                           7 services
└── websocket/
    ├── LiveCheckinWebSocketController.java
    └── WebSocketConfig.java           STOMP + JWT handshake interceptor
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DB_USERNAME` | `smartpresence_user` | PostgreSQL username |
| `DB_PASSWORD` | `changeme` | PostgreSQL password |
| `JWT_SECRET` | *(dev default)* | Min 64-char secret for HMAC-SHA |
| `BEACON_API_KEY` | `sp-beacon-key-change-in-prod` | Static key for beacon heartbeat endpoint |

---

## Scheduled Tasks

| Task | Interval | What it does |
|---|---|---|
| Token rotation | 60 s | Rotates BLE tokens within 60 s of expiry |
| Beacon health | 60 s | Marks beacons OFFLINE if silent for 120 s |
| Stale session cleanup | 5 min | Auto-ends sessions 30+ min past their duration |
