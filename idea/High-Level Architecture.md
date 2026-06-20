Since you already have the PostgreSQL entities, the next step is to design the Spring Boot backend around **services, validation pipelines, session management, attendance processing, and BLE token verification**.

Based on your flow, I would structure the backend like this.

# High-Level Architecture

```text
Mobile Apps
    |
    v
Spring Boot API
    |
    +--------------------+
    | Attendance Module  |
    +--------------------+
    |
    +--------------------+
    | BLE Validation     |
    +--------------------+
    |
    +--------------------+
    | Session Module     |
    +--------------------+
    |
    +--------------------+
    | Student Module     |
    +--------------------+
    |
    +--------------------+
    | Lecturer Module    |
    +--------------------+
    |
    +--------------------+
    | Offline Sync       |
    +--------------------+
    |
 PostgreSQL
```

---

# Main Business Flow

## Lecturer Starts Attendance

```text
Lecturer App
    |
    | Start Session
    v
POST /sessions/start
```

Server:

1. Creates attendance session

2. Generates session secret

3. Stores start time

4. Marks session ACTIVE

5. Returns

```json
{
  "sessionId": 123,
  "secret": "server-generated-secret"
}
```

---

## BLE Broadcast

Lecturer phone generates:

```text
session_id
timestamp
hash
```

Where:

```text
hash = CRC16(session_secret + timestamp)
```

Payload remains under 31 bytes.

Example:

```text
123|1718212000|A3F2
```

---

## Student Receives BLE

Student app scans:

```text
session_id
timestamp
hash
RSSI
```

Then sends:

```json
{
  "studentId": 456,
  "sessionId": 123,
  "timestamp": 1718212000,
  "token": "A3F2",
  "rssi": -62
}
```

to

```http
POST /attendance/check-in
```

---

# Attendance Check-In Pipeline

Do not place all validation in the controller.

Use a dedicated pipeline.

```text
AttendanceController
       |
       v
AttendanceService
       |
       v
BleCheckValidator
       |
       +--> TokenValidator
       +--> ExpiryValidator
       +--> RSSIValidator
       +--> DistanceValidator
```

This keeps every validation independent.

---

# BLE Validation Flow

Exactly matching your validator description:

```text
1. Session Exists?
2. Session Active?
3. Token Match?
4. Token Expired?
5. RSSI Threshold?
6. Distance Estimation?
7. Already Marked?
8. Save Attendance
```

---

# Validation #1 Token Match

Lookup:

```text
session_secret
```

from database.

Recompute:

```text
CRC16(secret + timestamp)
```

Compare with:

```text
received_token
```

If mismatch:

```text
INVALID_TOKEN
```

---

# Validation #2 Expiry

Prevent replay attacks.

Example:

```text
Allowed Window = 30 seconds
```

Check:

```text
CurrentTime - Timestamp
```

If exceeded:

```text
TOKEN_EXPIRED
```

---

# Validation #3 RSSI Threshold

Example:

```text
Minimum RSSI = -75 dBm
```

```text
RSSI > -75
```

Pass

Otherwise:

```text
TOO_FAR
```

---

# Important Logging Requirement

You mentioned:

> All raw signal data is written regardless of outcome.

This is extremely important.

Create:

```text
ble_checkin_events
```

Every scan attempt inserts a record.

Even failed ones.

Example:

```text
id
student_id
session_id
token
rssi
distance_estimate
result
reason
created_at
```

Examples:

```text
SUCCESS
INVALID_TOKEN
TOKEN_EXPIRED
LOW_RSSI
DISTANCE_REJECTED
```

This becomes your audit trail.

---

# Attendance Service

Only after all validations pass:

```text
attendance_record
```

inserted.

Flow:

```text
if already present
    return ALREADY_MARKED

else
    mark attendance
```

---

# Duplicate Protection

Students will often scan multiple times.

Before inserting:

```text
Find attendance by:

student_id
session_id
```

If exists:

```text
return PRESENT_ALREADY
```

---

# Offline Student Flow

Student stores locally:

```text
student_id
session_id
timestamp
token
received_at
```

When internet returns:

```http
POST /attendance/offline-sync
```

---

# Offline Validation

Different validator.

```text
OfflineAttendanceValidator
```

Checks:

### 1 Active Session Existed

```text
Was session running
at received_at?
```

---

### 2 Token Correct

Recompute:

```text
CRC16(secret + timestamp)
```

---

### 3 Not Duplicate

```text
student_id
session_id
```

must not already exist.

---

### 4 Within Grace Period

Example:

```text
24 hours
```

after lecture.

After that:

```text
reject
```

---

# Session States

Use explicit states.

```text
CREATED
ACTIVE
ENDED
CANCELLED
```

Avoid booleans.

---

# Recommended Services

```text
SessionService
AttendanceService
BleValidationService
OfflineSyncService
TokenGenerationService
DistanceCalculationService
AuditEventService
```

Each should have a single responsibility.

---

# API Endpoints

## Lecturer

```http
POST   /sessions/start
POST   /sessions/end
GET    /sessions/{id}
GET    /sessions/{id}/roster
```

---

## Student

```http
POST   /attendance/check-in
POST   /attendance/offline-sync
GET    /attendance/me
```

---

## Dashboard

```http
GET /students/{id}/progress
GET /lecturers/{id}/history
```

---

# One Security Improvement

Your current design uses:

```text
CRC16(secret + timestamp)
```

CRC16 is good for compact BLE packets but is **not cryptographically secure**.

For production I would keep:

```text
BLE Broadcast:
session_id
timestamp
crc16
```

because of the 31-byte limit.

But on the server generate the CRC from a long random:

```text
session_secret (128-bit random)
```

stored only in the database.

That makes token guessing much harder while still fitting inside BLE advertising constraints.

Overall, your backend naturally separates into:

```text
Session Management
        +
BLE Validation Pipeline
        +
Attendance Processing
        +
Offline Synchronization
        +
Audit/Event Logging
```

and the most critical component is the **BleValidationService pipeline**, because every attendance request should pass through it before attendance is recorded.
