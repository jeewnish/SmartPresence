# ============================================================
#  SmartPresence — Multi-stage Dockerfile (FIXED)
#  Fix: uses `mvn` directly — mvnw was missing from the project
# ============================================================

# ── Stage 1: Build ──────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

# Install Maven
RUN apk add --no-cache maven

WORKDIR /build

# Cache dependencies first (faster rebuilds on code-only changes)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src/ src/
RUN mvn clean package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Non-root user for security
RUN addgroup -S smartpresence && adduser -S smartpresence -G smartpresence

# Copy JAR from builder stage
COPY --from=builder /build/target/smartpresence-1.0.0.jar app.jar
RUN chown smartpresence:smartpresence app.jar

# Log directory
RUN mkdir -p /var/log/smartpresence \
    && chown smartpresence:smartpresence /var/log/smartpresence

USER smartpresence

EXPOSE 8080

ENTRYPOINT ["java", \
  "-Xmx400m", "-Xms200m", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
