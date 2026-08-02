# SmartPresence app2 / backend3 compatibility audit

Audit date: 2026-06-22

## Verdict

**Do not deploy to production yet.**

The REST contracts used by app2 match the deployed backend, and the app now handles
onboarding, backend roles, trusted-device registration, course enrollment, attendance
analytics, and attendance history correctly. Production attendance still cannot work
end-to-end because neither the lecturer nor student app has a real BLE transport.

## Fixed in app2

- Student onboarding now sends the backend-required `universityId`.
- The backend database role is the navigation source of truth.
- Only a 404 profile response triggers onboarding; network and authentication failures
  show a retry screen.
- A stable device ID is stored in SecureStore and registered with `/devices/register`.
- Attendance check-in uses the registered device ID instead of a platform placeholder.
- Students can browse the department course catalog and enroll.
- Student Notifications displays real attendance history.
- API wrappers now cover device registration, offline sync, and `/api/v1` activity APIs.
- App configuration now declares only iOS and Android because web dependencies and API
  CORS support are not configured.

## Production blockers

### P0 - Backend onboarding permits role escalation

`OnboardRequest` accepts `ROLE_STUDENT`, `ROLE_LECTURER`, and `ROLE_ADMIN`, and
`UserService.onboard` trusts the requested role for new users. Any authenticated new
user can call `/users/onboard` directly and request an elevated role.

Required fix: ignore client-provided roles for new accounts. Default to
`ROLE_STUDENT`; assign lecturer/admin roles only through trusted server-side
administration or pre-provisioned records.

### P0 - BLE attendance is not implemented in app2

- `RadarScreen` always starts with `INITIAL_DETECTED_SESSION = null`.
- No BLE scanner dependency is installed.
- Lecturer "Broadcast" starts a backend session but does not advertise
  `sessionSecret`.
- Student check-in requires the backend BLE token and RSSI, so it cannot be completed
  without real BLE discovery/advertising.

Required fix: implement and device-test BLE advertising/scanning in an Expo development
build, including Android Bluetooth permissions and iOS Bluetooth usage descriptions.

### P0 - Existing database fails Flyway validation

Backend tests connect to the local PostgreSQL database but application startup fails
because applied checksums for migrations V1 through V6 differ from the ZIP.

Required fix: never edit applied migrations. Reconcile the authoritative migration
files and database history, then use a reviewed Flyway repair or rebuild a disposable
database. Back up production before any repair.

### P0 - Production profile uses Clerk test credentials

`eas.json` currently puts a `pk_test_...` Clerk key in the production build, and the
backend defaults to a Clerk development JWKS URL.

Required fix: create/use a Clerk production instance and configure matching production
publishable key and JWKS URI in EAS and the backend environment.

### P1 - Secrets are included in backend3.zip

The ZIP contains `.env` and `.env.local` with database and Clerk credentials.

Required fix: rotate exposed credentials, exclude environment files from release
archives, and use AWS/ECS/GitHub secret storage.

### P1 - Backend CI skips tests

The Dockerfile and GitHub deployment workflow package with tests skipped.

Required fix: run unit/integration tests before image build and deploy only after they
pass against an isolated test database.

### P1 - No schedule model

The backend has courses and attendance sessions but no lecture timetable, venue, or
scheduled start/end fields. "Today's lectures" cannot be implemented accurately.

Required fix: add a schedule/timetable resource or change the UI wording to avoid
claiming that course lists are today's scheduled lectures.

### P1 - Dependency audit findings

`npm audit --omit=dev` reports transitive vulnerabilities, including a high-severity
`ws` advisory through Clerk dependencies. The automatic fixes propose breaking Expo or
Clerk version changes and should not be forced.

Required fix: review compatible patched Clerk/Expo releases and upgrade using Expo
SDK 54-compatible versions, then rerun Expo Doctor and production exports.

## Verification performed

- Expo SDK 54 versioned documentation checked.
- `npx expo-doctor`: 18/18 checks passed.
- Android production export: passed.
- `git diff --check`: passed.
- Live `https://api.smartpresence.dev/actuator/health`: HTTP 200, status UP.
- Protected live endpoints without JWT: HTTP 401 as expected.
- Live OpenAPI endpoint list matches backend3.zip controllers.
- Backend Java 21 package with tests skipped: passed.
- Backend unit tests: 3 passed.
- Backend application context test: failed due to Flyway V1-V6 checksum mismatches.

## Backend endpoint coverage

Used by the UI or startup:

- Users: `/users/me`, `/users/onboard`
- Devices: `/devices/register`
- Courses: `/courses`, `/courses/my`
- Enrollments: `/enrollments`, `/enrollments/me`
- Sessions: `/sessions/start`, `/sessions/{id}/end`, `/sessions/{id}/roster`
- Attendance: `/attendance/challenge`, `/attendance/token`, `/attendance/check-in`
- Analytics: `/students/me/progress`, `/lecturers/history`
- Activity history: `/api/v1/students/me/attendance`

Client wrappers exist but full UX is not implemented:

- `/devices/me`
- `/attendance/offline-sync`
- `/api/v1/students/me/courses`
- `/api/v1/lecturers/me/courses`
- `/api/v1/sessions/active`
- `/api/v1/sessions/{id}/attendance`
- `/api/v1/sessions/{id}/checkin-events/me`
- Course creation and session detail APIs

