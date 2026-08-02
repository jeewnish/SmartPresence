# SmartPresence End-to-End Validation Implementation Plan

## 1. Goal

Validate the complete production path:

```text
Expo app -> Clerk authentication -> Route53/ACM -> ALB -> ECS API
         -> PostgreSQL RDS -> CloudWatch logs, metrics, and alarms
```

The release is acceptable only when the backend API, frontend user journeys,
database migrations, AWS infrastructure, deployment/rollback process, security,
and observability have all been tested in an isolated staging environment.

## 2. Confirmed System Inventory

| Layer | Technology |
|---|---|
| Mobile app | Expo SDK 54 / React Native 0.81 |
| Authentication | Clerk JWT validated through JWKS |
| Backend | Spring Boot 4.1, Java 21, Maven |
| Database | PostgreSQL 16 on RDS, Flyway V1-V7 |
| Runtime | ECS Fargate behind an ALB |
| AWS services | VPC, ECR, RDS, Secrets Manager, ACM, Route53, CloudWatch |
| Infrastructure | Terraform 1.6 or later |

Eight controllers are currently present:

1. `UserController`
2. `CourseController`
3. `EnrollmentController`
4. `SessionController`
5. `AttendanceController`
6. `DeviceController`
7. `AnalyticsController`
8. `DemoApiController`

The frontend `activityApi` routes are implemented by `DemoApiController`; they
are not missing. They must be tested and either retained as supported API routes
or deliberately consolidated with the main course/session APIs.

## 3. Decisions Required Before Implementation

1. Choose the staging hostname, for example `api-staging.smartpresence.dev`.
2. Create a separate Clerk application for staging.
3. Decide whether the `/api/v1` Demo API remains a supported public surface.
4. Decide whether staging and production use separate AWS accounts. Separate
   accounts are preferred; separate state and resources in one account are the
   minimum acceptable isolation.
5. Decide how BLE is tested in CI. Use deterministic simulated scan data in CI
   and physical-device verification before release.
6. Confirm initial performance targets. Until real baselines exist, use:
   - smoke: p95 below 2 seconds and error rate below 5%;
   - load: p95 below 500 ms and error rate below 1%.

## 4. Clerk Validation Accounts and Course Data

### 4.1 Account Mapping

Use the existing Clerk validation accounts from `build/data/accounts.md`. Do not
copy their shared password, Clerk tokens, or email addresses into migrations,
test source, this plan, application logs, or GitHub Actions variables.

| Validation identity | Role | Derived department | Required Semester 2 data |
|---|---|---|---|
| `25fis0536` | Student | CIS | All CIS/`IS` Semester 2 courses |
| `23fis0444` | Student | CIS | All CIS/`IS` Semester 2 courses |
| `21fse0322` | Student | SE | All SE Semester 2 courses |
| `22foc0029` | Lecturer | Not derived for staff | Exactly one assigned subject |

There is currently no DS Clerk validation account. Keep the DS Semester 2
catalog populated and cover it with integration-test fixtures, but do not claim
that physical/app E2E testing covers DS until a DS account is created.

The committed `accounts.md` contains a plaintext shared password. Rotate that
password, remove it from committed/shared documentation, and store test account
credentials only in the selected CI secret store. Use distinct credentials for
staging and never use validation accounts in production.

### 4.2 Semester 2 Catalog Source of Truth

Treat the catalog values in `V7__semester_two_department_access.sql` as the
source of truth:

- CIS: `IS2101`-`IS2112` and `IS-EGP-1201`;
- SE: `SE2101`-`SE2109` and `SE-EGP-1201`;
- DS: `DS2101`-`DS2109` and `DS-EGP-1201`.

The default single lecturer assignment for validation is:

```text
22foc0029 -> IS2101, Object Oriented Programming
```

This subject is selected because both CIS validation students receive it, so one
lecturer session can exercise enrollment, roster, BLE check-in, attendance, and
analytics end to end. If the project owner chooses a different subject, change
the assignment in one seed/migration constant and update the expected test data.

### 4.3 Migration Safety

Before changing course data, inspect `flyway_schema_history` in every persistent
environment:

- If V7 has never run outside disposable development databases, V7 may be
  corrected before its first shared deployment.
- If V7 has run in staging, production, or any shared database, do not edit it.
  Add `V8__validation_account_course_assignments.sql` as a forward-only
  corrective migration.

The corrective migration must be idempotent at the data-operation level and use
stable keys such as `university_id` and `course_code`, never numeric user/course
IDs. It must fail with a clear error if the expected lecturer or `IS2101` course
does not exist rather than silently producing incomplete test data.

### 4.4 Required Data Result

After V7/V8 and after Clerk onboarding has claimed the email-matched seeded rows:

1. Both CIS students are enrolled in every CIS Semester 2 catalog course.
2. The SE student is enrolled in every SE Semester 2 catalog course.
3. No student is enrolled in another department's Semester 2 courses.
4. Re-running onboarding or the enrollment helper creates no duplicates.
5. Historical enrollments are preserved unless a separately approved cleanup
   migration explicitly removes them.
6. `22foc0029` has exactly one row in `lecturer_courses`, for `IS2101`.
7. The lecturer's “My Subjects” and `/api/v1/lecturers/me/courses` responses show
   exactly `IS2101`, not every catalog course whose legacy `courses.lecturer_id`
   points to the same seeded lecturer.

### 4.5 Align the Application With `lecturer_courses`

`courses.lecturer_id` is currently non-null and represents the legacy/default
course owner. It cannot also represent the lecturer's selected subjects.
`lecturer_courses`, introduced in V6, must become the source of truth for “My
Subjects” and session authorization.

Implement a `LecturerCourse` entity/repository or an equivalent explicit join
query, then:

- change `CourseService.getMyCourses` to query `lecturer_courses`;
- change `DemoApiService.lecturerCourses` to query `lecturer_courses`;
- require a matching `lecturer_courses` row before a lecturer starts a session;
- keep the unique `(lecturer_id, course_id)` constraint;
- test that assigning/removing a subject changes the lecturer dashboard without
  changing the complete student catalog.

Also remove the hardcoded Semester 4 behavior in `CourseService`. Introduce one
configuration value such as `app.academic.active-semester=Semester 2` and use it
consistently in course listing, student enrollment, activity APIs, tests, and
seed verification.

## 5. Phase 0: Repair the Local Verification Baseline

### 5.1 Repair Maven Wrapper

The Windows Maven wrapper currently fails before Maven starts. Regenerate or
repair the wrapper, then verify both commands:

```powershell
.\mvnw.cmd --version
.\mvnw.cmd test
```

CI should use `./mvnw` on Linux. Do not proceed until the wrapper works on a
clean checkout.

### 5.2 Record the Baseline

Run and record:

```powershell
.\mvnw.cmd test
docker compose config
```

Document existing failures separately from failures introduced by the test
implementation.

## 6. Phase 1: Backend Unit Tests

Extend the current unit suite without requiring Spring or a database.

| Test class | Coverage |
|---|---|
| `AttendanceServiceTest` | challenge, token, check-in, offline sync |
| `AttendanceTokenServiceTest` | signing, claims, expiry, replay handling |
| `SessionServiceTest` | start, end, ownership, roster access |
| `CourseServiceTest` | create, list, lecturer ownership |
| `LecturerCourseServiceTest` | exactly-one assignment, duplicate rejection, removal |
| `DeviceServiceTest` | registration and device ownership |
| `AnalyticsServiceTest` | progress and lecturer history calculations |
| `ValidationPipelineTest` | validation order and every `CheckinResult` |
| `ClerkJwtConverterTest` | subject and role conversion |

Required cases include happy paths, boundary values, null/invalid input,
ownership violations, duplicate operations, expired challenges/tokens, weak RSSI,
wrong device, inactive sessions, and replay attempts.

## 7. Phase 2: Backend Integration Tests

### 7.1 Maven Configuration

Add Testcontainers PostgreSQL and JUnit dependencies. If using Spring Boot
`@ServiceConnection`, also add `spring-boot-testcontainers`; otherwise configure
the datasource through `@DynamicPropertySource`.

Configure Maven Failsafe to run `*IT.java` during `integration-test` and
`verify`. Set `failIfNoTests` so CI cannot pass with zero integration tests.

Use:

```powershell
.\mvnw.cmd test
.\mvnw.cmd verify
```

The first command runs unit tests. The second also runs Failsafe integration
tests. A Maven profile is unnecessary unless it provides a real configuration
difference.

### 7.2 Test Architecture

- Use `@SpringBootTest` and `MockMvc` for HTTP integration tests.
- Use one reusable PostgreSQL Testcontainer configuration.
- Let Flyway create the schema; never let Hibernate create it.
- Use `@MockitoBean` for Spring bean replacement when necessary.
- Prefer synthetic test JWTs with Spring Security test support.
- Add a small separate test that validates a real JWT against a controlled JWKS
  server so JWKS configuration is not entirely mocked.
- Reset data between tests using transactions or explicit SQL cleanup.
- Use deterministic clocks for token/challenge expiry cases.

### 7.3 Controller Coverage

Create:

| Test class | API surface |
|---|---|
| `UserApiIT` | onboard and current user |
| `CourseApiIT` | create, list, get by ID, lecturer courses |
| `CourseAssignmentIT` | `lecturer_courses` assignment and session authorization |
| `EnrollmentApiIT` | enroll and student enrollments |
| `SessionApiIT` | start, end, get, roster |
| `AttendanceApiIT` | challenge, token, check-in, offline sync |
| `DeviceApiIT` | register and current devices |
| `AnalyticsApiIT` | student progress and lecturer history |
| `DemoApiIT` | all `/api/v1` activity routes used by the app |
| `AuthorizationIT` | unauthenticated, wrong role, wrong owner |
| `ErrorFormatIT` | consistent `ApiError` responses |

For every applicable endpoint, cover:

- valid request and expected response contract;
- missing/invalid body fields;
- malformed JSON and unsupported content type;
- missing and invalid authentication;
- wrong role and wrong resource owner;
- missing resource;
- duplicate request and replay;
- boundary values, pagination, filtering, and sorting where supported;
- database state and downstream side effects.

Generate the OpenAPI document during CI and compare its route inventory with the
test inventory so newly added endpoints cannot silently remain untested.

### 7.4 Validation Account Data Assertions

Add database assertions for the account-derived data without storing account
passwords in the test suite:

- `25fis0536` and `23fis0444` resolve to CIS and have the full CIS Semester 2
  course set;
- `21fse0322` resolves to SE and has the full SE Semester 2 course set;
- each student has zero cross-department Semester 2 enrollments;
- `22foc0029` has exactly one `lecturer_courses` row for `IS2101`;
- lecturer course endpoints return exactly one subject;
- the lecturer can start an `IS2101` session but cannot start a session for an
  unassigned course;
- repeated onboarding preserves the same user, enrollments, and assignment.

## 8. Phase 3: Flyway Migration Verification

Create `FlywayMigrationIT` using disposable PostgreSQL containers.

Verify:

1. V1 through the latest migration migrate successfully on an empty database.
2. A database targeted at V6 upgrades successfully through V7/V8.
3. `flyway_schema_history` contains exactly the expected successful migrations.
4. Important tables, types, indexes, foreign keys, unique constraints, functions,
   and triggers exist.
5. JPA validation succeeds after migration.
6. Representative V6 data remains valid and is transformed correctly by V7.
7. The Semester 2 catalog contains the exact expected course-code sets.
8. Account-derived student enrollments and the single lecturer assignment match
   Section 4.4.
9. Existing V6 `lecturer_courses` backfill data is reduced to the explicitly
   selected validation assignment by V8 without breaking foreign keys.

Use the real table names, including `attendance_sessions`, not `sessions`.

Do not describe `flyway clean` followed by `migrate` as rollback. It is only a
test-environment rebuild. Production rollback must use backward-compatible
forward migrations or RDS snapshot restoration. Never run Flyway clean against
staging or production.

## 9. Phase 4: Terraform Environment Safety

### 9.1 Bootstrap Remote State

Create a small, separate Terraform bootstrap configuration that provisions:

- a dedicated S3 state bucket;
- bucket versioning;
- server-side encryption, preferably using KMS;
- blocked public access;
- lifecycle protection/retention appropriate for state;
- IAM policies for CI and maintainers.

Configure the application stack with a partial S3 backend and native S3 locking:

```hcl
terraform {
  backend "s3" {
    use_lockfile = true
    encrypt      = true
  }
}
```

Supply bucket, region, and environment-specific key during `terraform init`.
Do not combine a hardcoded `staging/terraform.tfstate` key with Terraform
workspaces. Prefer explicit staging and production backend configuration files.

### 9.2 Separate Environment Values

Create non-secret `staging.tfvars` and `prod.tfvars`. Pass secrets through CI
environment variables or a secure bootstrap workflow; do not commit secret
values in `.tfvars`.

Make the following RDS properties variables:

| Setting | Staging | Production |
|---|---:|---:|
| Multi-AZ | false | true |
| Deletion protection | false | true |
| Skip final snapshot | true | false |
| Backup retention | 7 days | agreed production retention |
| Instance size | small/test | capacity-based |

Add a production final-snapshot identifier and verify a snapshot can actually be
restored.

### 9.3 Terraform CI Checks

Run on pull requests:

```powershell
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
tflint
checkov --directory .
```

Generate a saved plan for staging/production only from protected CI environments.
Apply the exact reviewed saved plan rather than generating a different plan in
the apply job.

## 10. Phase 5: Deterministic ECS Deployment

Do not use `latest` as the release identity.

1. Build the container once.
2. Scan it.
3. Push it with the Git commit SHA.
4. Resolve and record the ECR image digest.
5. Put the immutable tag or digest into a new ECS task-definition revision.
6. Update the ECS service to that revision.
7. Wait for ECS service stability and healthy ALB targets.
8. Run staging smoke tests against the deployed version.
9. Promote the same tested image digest to production; do not rebuild it.

Remove the conflict between Terraform-managed task definitions and
`ignore_changes = [task_definition]`. Choose a single owner:

- Terraform manages every task-definition revision; or
- the deployment workflow registers and updates task definitions while
  Terraform manages only stable service infrastructure.

Record the previous task-definition ARN/digest for rollback. Keep the ECS
deployment circuit breaker with rollback enabled.

## 11. Phase 6: CloudWatch and Alerting

Extend the CloudWatch module and pass it the required identifiers:

- ALB ARN suffix;
- target-group ARN suffix;
- ECS cluster and service names;
- RDS database identifier;
- SNS topic ARN.

Add alarms for:

- ALB target 5xx rate;
- ALB p95 target response time;
- unhealthy ALB hosts;
- ECS running task count, CPU, and memory;
- ECS deployment failure;
- RDS CPU, storage, connections, and freeable memory;
- application error count where structured metrics are available.

Add an SNS notification destination and confirm delivery. An alarm without a
working notification route is not complete.

Add a request/correlation ID filter and structured JSON logging. Do not log
passwords, Clerk secrets, bearer JWTs, attendance tokens, database connection
secrets, or sensitive personal data.

Test a 5xx alarm using a controlled staging-only fault mechanism or temporary
alarm threshold. Invalid JSON should produce 400 and is not a valid 5xx test.

## 12. Phase 7: CI/CD Pipeline

Use GitHub Actions OIDC to assume narrowly scoped AWS IAM roles. Do not store
long-lived AWS access keys in GitHub secrets.

### Pull Request Pipeline

```text
format/static checks
-> backend unit tests
-> backend integration and migration tests
-> OpenAPI route/test inventory check
-> Terraform validation and security scan
-> container build
-> dependency, image, and secret scans
```

Pull requests must not push release images or deploy shared staging by default.

### Main Branch Staging Pipeline

```text
build once with commit SHA
-> scan image
-> push immutable image
-> generate and review staging plan
-> apply staging plan
-> deploy exact image digest
-> wait for ECS/ALB health
-> staging API smoke tests
-> frontend E2E journeys
-> performance smoke
-> publish test evidence
```

### Production Pipeline

```text
manual approval through protected GitHub environment
-> generate/review saved production plan
-> apply exact plan
-> promote the staging-tested image digest
-> wait for service health
-> non-destructive production smoke tests
-> monitor alarms and dashboards
-> rollback automatically or manually if gates fail
```

If the backend, frontend, and Terraform are separate repositories, explicitly
define which repository owns deployment and how it checks out version-matched
sources. A workflow cannot assume sibling directories exist on a GitHub runner.

## 13. Phase 8: Staging API Smoke Suite

Use either RestAssured or Newman, but nominate one as the maintained source of
truth. Avoid maintaining two equivalent suites.

The suite must use CI-injected URLs and credentials. Do not commit Clerk tokens
or secret environment files.

Minimum staging smoke tests:

1. `GET /actuator/health` returns UP.
2. Real Clerk JWT authenticates successfully.
3. Lecturer can read their courses.
4. Student can read their profile/enrollments.
5. One unauthorized role operation returns 403.
6. One Demo API/activity route works for each role.
7. Deployed version/digest matches the pipeline artifact.

For the known validation dataset, assert that the lecturer reads exactly one
subject (`IS2101`) and each student receives only their department's complete
Semester 2 catalog.

Use unique run IDs for test data and always perform cleanup in a final step.

## 14. Phase 9: Frontend Validation

### 14.1 Frontend Test Foundation

The Expo app currently has no automated test framework. Add:

- Jest and React Native Testing Library for components/hooks;
- mocked Axios tests for loading, empty, success, 401, 403, 422, 500, timeout,
  and offline states;
- a device-level framework selected after a small proof of concept. Maestro may
  be simpler for black-box critical journeys; use Detox only if its native build
  requirements fit the project.

### 14.2 API Contract Checks

For every function in `src/config/api.js`, verify:

- method and path;
- request body and query parameters;
- response shape used by the UI;
- authentication requirement;
- timeout and error handling.

Keep `EXPO_PUBLIC_API_BASE_URL` at the host root unless all controllers are
standardized under `/api/v1`. Avoid creating an accidental double `/api/v1`
prefix for `activityApi`.

### 14.3 Critical Journeys

#### Journey A: Lecturer Session

1. Sign in through staging Clerk.
2. Complete onboarding if needed.
3. Load lecturer courses.
4. Confirm exactly `IS2101` is assigned.
5. Start an attendance session for `IS2101`.
6. Confirm ACTIVE status.
7. Observe the two enrolled CIS students in the roster before/after check-in.
8. End the session.
9. Confirm it appears in lecturer history.

#### Journey B: Student Attendance

1. Sign in through staging Clerk.
2. Complete onboarding if needed.
3. Register device.
4. Confirm courses/enrollments.
5. Receive session/BLE data.
6. Complete challenge and attendance-token exchange.
7. Check in once successfully.
8. Confirm replay is rejected.
9. Confirm progress and activity screens show the record.

#### Journey C: Authorization

1. Student cannot create courses or manage lecturer sessions.
2. Lecturer cannot use student-only enrollment/attendance operations.
3. Missing, invalid, and expired tokens return 401.
4. A user cannot access another lecturer's or student's protected resources.

#### Journey D: Failure and Offline Behaviour

1. API timeout shows a recoverable state.
2. Token expiry during app use triggers the expected sign-in/refresh behavior.
3. Offline records sync once and cannot create duplicates.
4. App restart does not lose required secure state.
5. Slow and disconnected networks do not leave infinite loading indicators.

Use simulated BLE values in CI. Perform at least one release-candidate run using
real supported phones and BLE hardware.

## 15. Phase 10: Security and Performance

### Automated Security

- Checkov for Terraform;
- Trivy for images and dependencies;
- Gitleaks for repository secrets;
- Maven dependency vulnerability scan;
- dependency update reporting.

Fail releases on exploitable critical findings. Document time-bounded exceptions
with an owner and expiry date.

### Manual/Integration Security Cases

- role and ownership bypass;
- SQL and JSON injection attempts;
- mass assignment;
- ID enumeration;
- JWT issuer, audience, expiry, and signature failures;
- attendance-token/challenge replay;
- cross-device check-in;
- unsafe error details;
- rate-limit/abuse behavior.

### Performance

Do not create sessions repeatedly in a read-heavy load loop. Prepare test data,
then separate scenarios into:

- authenticated reads;
- lecturer session creation/end;
- burst student attendance check-in;
- offline-sync batches;
- soak test for connection/resource leaks.

Record p50, p95, p99, throughput, error rate, ECS CPU/memory, RDS connections,
slow queries, scaling behavior, and estimated AWS cost. Tighten thresholds after
the first accepted baseline.

## 16. Production Smoke and Rollback

Production smoke tests must be non-destructive but prove more than authorization:

1. TLS, DNS, and `/actuator/health` work.
2. The expected application image digest is running.
3. A dedicated smoke user can authenticate.
4. One safe authenticated student read works.
5. One safe authenticated lecturer read works.
6. One wrong-role request returns 403.
7. Logs and metrics appear without leaking secrets.

Rollback procedure:

1. Stop promotion if any gate fails.
2. Repoint ECS to the previous known-good task definition/image digest.
3. Wait for ALB targets and ECS stability.
4. Repeat production smoke tests.
5. For incompatible database failures, follow the documented snapshot restoration
   or forward-fix procedure. Do not use Flyway clean or edit applied migrations.

## 17. Release Acceptance Checklist

- [ ] Maven wrapper works on a clean Windows and Linux checkout.
- [ ] Unit tests pass.
- [ ] All eight controllers and all frontend-used routes have integration tests.
- [ ] Failsafe proves integration tests actually ran.
- [ ] V1-latest empty migration and V6-to-latest data upgrade pass.
- [ ] Semester 2 catalog matches the exact V7 CIS, SE, and DS course lists.
- [ ] Known CIS/SE student accounts receive only their department courses.
- [ ] Known lecturer account has exactly one selected subject, `IS2101`.
- [ ] Lecturer subject APIs and session authorization use `lecturer_courses`.
- [ ] No test account password or token exists in migrations, source, or logs.
- [ ] API error responses are consistent for application and security failures.
- [ ] Demo API routes are retained/tested or deliberately consolidated.
- [ ] Remote state is versioned, encrypted, locked, and protected.
- [ ] Staging and production use isolated state, secrets, databases, and Clerk apps.
- [ ] Production RDS has deletion protection, final snapshots, and agreed backups.
- [ ] The deployed ECS image is identified by immutable tag/digest.
- [ ] Staging deploy uses the exact image later promoted to production.
- [ ] CloudWatch alarms have verified SNS delivery.
- [ ] Critical frontend journeys pass against AWS staging.
- [ ] At least one physical BLE/device release test passes.
- [ ] Security scans have no unapproved critical findings.
- [ ] Performance smoke thresholds pass.
- [ ] Production smoke tests prove health, auth, database-backed reads, and roles.
- [ ] ECS rollback and database recovery procedures are documented and tested.

## 18. Final Execution Order

```text
1. Repair Maven wrapper and establish baseline
2. Check Flyway history and choose safe V7 correction or forward-only V8
3. Populate/verify the exact Semester 2 catalog and account enrollments
4. Make lecturer_courses the source of truth and assign only IS2101
5. Standardize the active semester as Semester 2
6. Confirm/consolidate API contract, including Demo API routes
7. Add unit tests
8. Configure Failsafe and Testcontainers
9. Add HTTP integration, account-data, authorization, and migration tests
10. Bootstrap secure remote Terraform state
11. Separate staging/production infrastructure safety settings
12. Implement immutable ECS image deployment
13. Add CloudWatch metrics, alarms, SNS, and correlation IDs
14. Add PR CI checks and AWS OIDC
15. Deploy isolated staging
16. Run API smoke and frontend journeys with the mapped accounts
17. Run security and performance validation
18. Approve and promote the same image digest to production
19. Run production smoke, monitor, and roll back if required
```
