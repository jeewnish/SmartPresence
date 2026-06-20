Docker is a very good choice for this project because it gives you:

- Consistent development environment

- Easy deployment

- Simple database setup

- Reproducible demos for your final presentation

For your architecture, I would containerize:

```text
Spring Boot API
PostgreSQL
(Optional) PgAdmin
```

**Clerk should NOT run inside Docker.**

Clerk is a SaaS platform and remains external.

---

# Final Deployment Architecture

```text
┌─────────────────────┐
│   Mobile App        │
└──────────┬──────────┘
           │
           │ HTTPS
           ▼

┌─────────────────────┐
│      Clerk          │
│ Authentication      │
└──────────┬──────────┘
           │ JWT
           ▼

┌─────────────────────┐
│ Spring Boot API     │
│ Docker Container    │
└──────────┬──────────┘
           │
           ▼

┌─────────────────────┐
│ PostgreSQL          │
│ Docker Container    │
└─────────────────────┘
```

---

# Development Environment

Use:

```text
Docker Compose
```

to manage containers.

Structure:

```text
smartpresence-backend/

├── Dockerfile
├── docker-compose.yml
├── .env
├── src/
├── pom.xml
└── README.md
```

---

# Docker Containers

## 1. Backend Container

Contains:

```text
Java 21 Runtime

Spring Boot Application

Flyway Migration Scripts
```

Responsibilities:

```text
REST APIs

JWT Validation

Attendance Processing

BLE Validation

Database Access
```

---

## 2. PostgreSQL Container

Contains:

```text
PostgreSQL 16
```

Stores:

```text
users

courses

enrollments

attendance_sessions

attendance_records

device_registrations

ble_checkin_events

attendance_challenges
```

---

## 3. Optional PgAdmin

Useful during development.

Provides:

```text
Database UI

Query Tool

Table Viewer
```

Remove in production.

---

# Environment Variables

Never hardcode secrets.

Create:

```text
.env
```

Example:

```text
POSTGRES_DB=smartpresence

POSTGRES_USER=postgres

POSTGRES_PASSWORD=password

SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/smartpresence

SPRING_DATASOURCE_USERNAME=postgres

SPRING_DATASOURCE_PASSWORD=password

CLERK_SECRET_KEY=xxxxx

CLERK_PUBLISHABLE_KEY=xxxxx
```

---

# Spring Configuration

Use environment variables.

```text
application.yml
```

reads:

```text
Database Settings

Clerk Keys

JWT Settings

BLE Settings

Attendance Settings
```

---

# Flyway in Docker

When Spring Boot starts:

```text
Container Starts
        |
        v
Database Connects
        |
        v
Flyway Executes
        |
        v
Tables Created
        |
        v
Application Starts
```

This means:

```text
docker compose up
```

can create an empty database automatically.

---

# Docker Build Flow

```text
Maven Build
      |
      v
JAR Created
      |
      v
Docker Image Built
      |
      v
Container Started
```

Use a multi-stage build:

```text
Stage 1
Build with Maven

Stage 2
Run with Java 21 Runtime
```

This produces a much smaller image.

---

# Networking

Docker Compose creates an internal network.

```text
spring-app
      |
      |
postgres
```

Backend connects using:

```text
postgres:5432
```

instead of:

```text
localhost
```

---

# Production Architecture

For deployment:

```text
Internet
    |
    v
Reverse Proxy
(Nginx)
    |
    v
Spring Boot Container
    |
    v
PostgreSQL Container
```

Clerk remains external.

---

# CI/CD Pipeline (Recommended)

When pushing to GitHub:

```text
GitHub
    |
    v
GitHub Actions
    |
    v
Build Project
    |
    v
Run Tests
    |
    v
Build Docker Image
    |
    v
Deploy
```

This looks very good in a final-year project report.

You can use [GitHub Actions Documentation](https://docs.github.com/actions?utm_source=chatgpt.com) for the CI/CD workflow.

---

# What Runs in Docker?

### Inside Docker

```text
Spring Boot API

PostgreSQL

PgAdmin (optional)
```

### Outside Docker

```text
Clerk

Mobile Application

Email Verification Pages

Password Reset Pages
```

---

# Recommended Docker Setup for SmartPresence

```text
docker-compose.yml

Services:
├── smartpresence-api
├── postgres
└── pgadmin (optional)
```

Database migrations:

```text
Flyway
```

Authentication:

```text
Clerk SaaS
```

Secrets:

```text
.env
```

Networking:

```text
Docker Compose Network
```

This setup is more than sufficient for a Spring Boot 3.2 + Java 21 BLE attendance system and is exactly the level of infrastructure complexity expected in a strong university capstone project.
