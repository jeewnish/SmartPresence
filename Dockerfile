# ============================================================
# SmartPresence Backend - Dockerfile
# Multi-stage build: Maven build -> Java 21 runtime
# ============================================================

# ── Stage 1: Build ──────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper and pom first (layer-cache friendly)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies without building the source
RUN ./mvnw dependency:go-offline -B

# Copy source and build the fat JAR (skip tests during image build)
COPY src/ src/
RUN ./mvnw package -DskipTests -B


# ── Stage 2: Runtime ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

# Non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

WORKDIR /app

# Pull only the built JAR from the builder stage
COPY --from=builder /build/target/*.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Use exec form so the JVM receives OS signals (SIGTERM) correctly
ENTRYPOINT ["java", "-jar", "app.jar"]
