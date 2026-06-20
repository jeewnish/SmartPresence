# 1. Complete Low-Level Architecture

```
┌──────────────────────────────────────────────┐│                Mobile App                    │├──────────────────────────────────────────────┤│ Clerk SDK                                    ││ BLE Scanner                                  ││ Device Registration Manager                  ││ Biometric Authentication Manager             ││ Attendance Challenge Manager                 ││ Offline Sync Manager                         │└──────────────────────────────────────────────┘                     │                     │ JWT                     ▼┌──────────────────────────────────────────────┐│                Clerk Platform                │├──────────────────────────────────────────────┤│ Sign Up                                      ││ Sign In                                      ││ Email Verification                           ││ Session Management                           ││ JWT Issuer                                   │└──────────────────────────────────────────────┘                     │                     ▼┌──────────────────────────────────────────────┐│             Spring Boot API                  │├──────────────────────────────────────────────┤│ Security Layer                               ││   ├─ Clerk JWT Validation                    ││   ├─ Role Authorization                      ││                                              ││ User Module                                  ││ Course Module                                ││ Enrollment Module                            ││ Device Module                                ││ Session Module                               ││ Attendance Module                            ││ BLE Validation Module                        ││ Attendance Challenge Module                  ││ Analytics Module                             ││ Offline Sync Module                          ││ Audit Module                                 │└──────────────────────────────────────────────┘                     │                     ▼┌──────────────────────────────────────────────┐│                PostgreSQL                    │└──────────────────────────────────────────────┘
```

---

# 2. Clerk Authentication Flow

## Student Registration

```
Student   |   vClerk Sign Up   |   vEmail Verification   |   vJWT Generated
```

After first login:

```
POST /users/onboard
```

Backend creates:

```
UserRoleDefault Device Registration Record
```

---

## Lecturer Registration

Same flow.

During onboarding:

```
ROLE_LECTURER
```

assigned.

---

# How Clerk Is Used

Clerk handles:

```
Email/PasswordGoogle Login (Optional)Password ResetEmail VerificationJWT CreationSession Management
```

Spring Boot handles:

```
Role ManagementAuthorizationBusiness LogicAttendance Processing
```

---

# Request Example

```
Authorization: Bearer eyJ...
```

Spring Security:

```
Validate Clerk JWTExtract:    clerk_user_id    email
```

Lookup:

```
users.clerk_user_id
```

Load user.

---

# 3. Database Tables

## users

```
id PKclerk_user_id UNIQUEemailfirst_namelast_namerolecreated_atupdated_at
```

---

## device_registrations

```
id PKuser_id FKdevice_iddevice_nameplatformis_activeregistered_atlast_seen_at
```

---

## courses

```
id PKcourse_codecourse_namelecturer_id FKsemester
```

---

## enrollments

```
id PKstudent_id FKcourse_id FKenrolled_at
```

---

## attendance_sessions

```
id PKcourse_id FKsession_secretstatusstarted_atended_atcreated_by FK
```

---

## attendance_records

```
id PKstudent_id FKsession_id FKattendance_timeverification_methodstatus
```

---

## ble_checkin_events

```
id PKstudent_id FKdevice_id FKsession_id FKtokenrssidistance_estimateresultfailure_reasonbiometric_verifiedattendance_token_idcreated_at
```

---

## attendance_challenges

```
id PKstudent_id FKdevice_id FKchallengeexpires_atused
```

---

# 4. Entity Relationships

```
User (Lecturer)      |      | 1:N      |      vCourses      |      | 1:N      |      vAttendance Sessions      |      | 1:N      |      vAttendance RecordsUser (Student)      |      | N:M      |      vEnrollments      ^      |      |CoursesUser      |      | 1:N      |      vDevice RegistrationsAttendance Session      |      | 1:N      |      vBLE Checkin Events
```

---

# 5. Device Registration Flow

First login:

```
Login Success      |      vGenerate Device Identifier      |      vPOST /devices/register
```

Request:

```
{  "deviceId":"abc123",  "deviceName":"Samsung S24",  "platform":"ANDROID"}
```

Backend:

```
Validate UserCreate Device RecordMark Active
```

---

# 6. Lecturer Session Flow

## Start Attendance

```
POST /sessions/start
```

Request:

```
{  "courseId": 1}
```

Backend:

```
Generate Session SecretCreate Attendance SessionStatus = ACTIVE
```

Response:

```
{  "sessionId": 123,  "sessionSecret":"..."}
```

---

# 7. BLE Broadcast Flow

Lecturer Phone:

Generates:

```
session_idtimestamphash
```

Formula:

```
hash = CRC16(session_secret + timestamp)
```

Example:

```
123|1718212000|A3F2
```

Broadcast continuously.

---

# 8. Student Attendance Flow

## Step 1

BLE Scanner detects:

```
session_idtimestamphashRSSI
```

Example:

```
1231718212000A3F2-62
```

---

## Step 2

Request biometric authentication.

---

# Biometric Request

Android:

```
BiometricPrompt API
```

Supports:

```
FingerprintFace UnlockDevice Credentials
```

iOS:

```
LocalAuthentication
```

Supports:

```
Face IDTouch ID
```

Important:

```
No biometric datais ever exposed to the app.
```

The operating system only returns:

```
SUCCESSorFAILED
```

---

## Step 3

Biometric Success

```
Request Attendance Challenge
```

```
POST /attendance/challenge
```

---

Request:

```
{  "deviceId":"abc123",  "sessionId":123}
```

---

Backend validates:

```
UserRegistered DeviceSession Active
```

Creates:

```
Random ChallengeValid 60 Seconds
```

Response:

```
{  "challenge":"f9ad8834..."}
```

---

# Step 4

Attendance Token Generation

Mobile signs challenge locally.

Request:

```
POST /attendance/token
```

```
{  "challenge":"f9ad8834..."}
```

Backend issues:

```
Attendance TokenTTL = 60 Seconds
```

Response:

```
{  "attendanceToken":"eyJ..."}
```

---

# Step 5

Attendance Submission

```
POST /attendance/check-in
```

```
{  "sessionId":123,  "timestamp":1718212000,  "token":"A3F2",  "rssi":-62,  "deviceId":"abc123",  "attendanceToken":"eyJ..."}
```

---

# 9. Validation Pipeline

```
Attendance Request       |       vDevice Validator       |       vAttendance Token Validator       |       vSession Validator       |       vBLE Token Validator       |       vExpiry Validator       |       vRSSI Validator       |       vDuplicate Validator       |       vAttendance Record Creation
```

---

# 10. BLE Token Validation

Retrieve:

```
session_secret
```

Recalculate:

```
CRC16(secret + timestamp)
```

Compare:

```
A3F2 == A3F2
```

Pass.

Else:

```
INVALID_TOKEN
```

---

# 11. Audit Logging

Every attempt:

```
SUCCESSINVALID_TOKENTOKEN_EXPIREDLOW_RSSIINVALID_DEVICEALREADY_PRESENT
```

stored in:

```
ble_checkin_events
```

even when validation fails.

---

# 12. Security Layers

Attendance is accepted only if all four factors pass:

### Factor 1

```
Identity
```

Verified by Clerk.

---

### Factor 2

```
Trusted Device
```

Verified by Device Module.

---

### Factor 3

```
Physical Presence
```

Verified through BLE signal.

---

### Factor 4

```
User Ownership
```

Verified through Face ID / Fingerprint.

---

# API Summary

### Authentication

```
POST /users/onboardGET  /users/me
```

### Device

```
POST /devices/registerGET  /devices/me
```

### Sessions

```
POST /sessions/startPOST /sessions/endGET  /sessions/{id}GET  /sessions/{id}/roster
```

### Attendance

```
POST /attendance/challengePOST /attendance/tokenPOST /attendance/check-inPOST /attendance/offline-sync
```

### Analytics

```
GET /students/me/progressGET /lecturers/history
```

This gives you a complete low-level design for Spring Boot 3.2 + Java 21 + PostgreSQL + Clerk + BLE attendance + device trust + biometric verification, with clear modules, entities, relationships, API contracts, and validation flow suitable for implementation and for inclusion in your project report.
