# SmartPresence — Correct Setup Guide

## What was wrong (fixes applied)

| Problem | Fix |
|---|---|
| `Dockerfile` used `./mvnw` — Maven Wrapper was missing | New `Dockerfile` installs `mvn` directly via Alpine apk |
| `keycloak/realm-export.json` missing — Keycloak couldn't auto-import the realm | Created `keycloak/realm-export.json` with all clients, roles, and test users |
| README described a JJWT system — the actual code uses Keycloak OAuth2 | See corrected flow below |

---

## Architecture — How Auth Actually Works

```
Mobile App  ──POST /realms/smartpresence/protocol/openid-connect/token──▶  Keycloak :8180
Mobile App  ◀── access token (JWT signed by Keycloak) ────────────────────

Mobile App  ──Bearer <token>──▶  Spring Boot :8080
Spring Boot validates token signature via Keycloak JWKS endpoint (automatically)
Spring Boot reads realm_access.roles → maps SMARTPRESENCE_ADMIN → ROLE_ADMIN
```

**There is NO `/auth/login` endpoint on the Spring Boot side.**
Login is 100% Keycloak. The only auth endpoint in Spring Boot is `GET /auth/me` (profile fetch after login).

---

## Quick Start (Docker Compose — recommended)

### 1. Apply the fixes

Copy the three fixed files into your project root:

```
your-project/
├── Dockerfile              ← replace with fixes/Dockerfile
├── keycloak/
│   └── realm-export.json   ← new file from fixes/keycloak/
└── .env                    ← copy from fixes/.env.example and rename
```

### 2. Create your .env file

```bash
cp .env.example .env
# Edit .env if you want different passwords
```

### 3. Start everything

```bash
docker compose up -d
```

Services that start:
- **PostgreSQL** on port `5432`
- **Keycloak** on port `8180` (takes ~60 s to be ready — wait for health check)
- **Spring Boot** on port `8080` (starts after Keycloak is healthy)

### 4. Watch logs

```bash
docker compose logs -f app       # Spring Boot app logs
docker compose logs -f keycloak  # Keycloak startup logs
```

### 5. Get a token and test

```bash
# Get an access token (replace password if you changed it)
curl -s -X POST \
  http://localhost:8180/realms/smartpresence/protocol/openid-connect/token \
  -d "grant_type=password" \
  -d "client_id=smartpresence-app" \
  -d "username=admin@smartpresence.lk" \
  -d "password=Pass@1234" | jq .access_token

# Use the token
TOKEN="<paste token here>"
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/auth/me
```

### 6. Swagger UI

Open: http://localhost:8080/api/v1/swagger-ui.html

Click **Authorize** → use client `smartpresence-app`, enter username + password.

---

## Running Locally (without Docker)

You still need Keycloak and PostgreSQL running. Easiest way:

```bash
# Start only the infrastructure (not the app)
docker compose up -d postgres keycloak

# Wait for Keycloak to be ready (~60s), then run the app locally
./mvnw spring-boot:run
# OR if you don't have mvnw:
mvn spring-boot:run
```

---

## Test Accounts

All passwords: **`Pass@1234`**

| Role | Email |
|---|---|
| Admin | `admin@smartpresence.lk` |
| Admin | `saranga@susl.lk` |
| Lecturer | `nirubikaa@susl.lk` |
| Lecturer | `harshani@susl.lk` |
| Student | `sandeepa@student.susl.lk` |
| Student (flagged) | `flagged@student.susl.lk` |
| Student (low attendance) | `absent@student.susl.lk` |
| Student (suspended) | `suspended@student.susl.lk` |
| Student (no device) | `newstudent@student.susl.lk` |

---

## Keycloak Admin Console

URL: http://localhost:8180  
Username: `admin`  
Password: value of `KEYCLOAK_ADMIN_PASSWORD` in your `.env` (default: `admin`)

Go to **Realm: smartpresence** to manage users, roles, and clients.
