#!/bin/bash
# ============================================================
#  SmartPresence — EC2 Bootstrap Script
#  Installs Docker, creates project structure, and writes
#  the docker-compose and .env files for Spring Boot + Keycloak
# ============================================================
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

echo ">>> [1/5] System update & essentials"
apt-get update -y
apt-get upgrade -y
apt-get install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  unattended-upgrades \
  ufw \
  postgresql-client

echo ">>> [2/5] Install Docker"
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable docker
usermod -aG docker ubuntu

echo ">>> [3/5] Configure firewall"
ufw allow OpenSSH
ufw allow 8080/tcp
ufw allow 8180/tcp
ufw --force enable

echo ">>> [4/5] Create project directory & configs"
mkdir -p /home/ubuntu/${project_name}
cd /home/ubuntu/${project_name}

# ── .env file ──────────────────────────────────────────────
cat > .env <<'ENVEOF'
# ── Database ──
DB_URL=jdbc:postgresql://${db_endpoint}/smartpresence
DB_USERNAME=${db_username}
DB_PASSWORD=${db_password}

# ── JWT ──
JWT_SECRET=${jwt_secret}

# ── Beacon ──
BEACON_API_KEY=${beacon_api_key}

# ── Keycloak ──
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=${keycloak_admin_password}
KC_DB_URL=jdbc:postgresql://${db_endpoint}/keycloak
KC_DB_USERNAME=${db_username}
KC_DB_PASSWORD=${db_password}
ENVEOF

# ── docker-compose.yml (no local postgres — uses RDS) ─────
cat > docker-compose.yml <<'COMPOSEEOF'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:24.0.1
    container_name: smartpresence-keycloak
    command: start --import-realm
    environment:
      KC_DB: postgres
      KC_DB_URL: $${KC_DB_URL}
      KC_DB_USERNAME: $${KC_DB_USERNAME}
      KC_DB_PASSWORD: $${KC_DB_PASSWORD}
      KEYCLOAK_ADMIN: $${KEYCLOAK_ADMIN}
      KEYCLOAK_ADMIN_PASSWORD: $${KEYCLOAK_ADMIN_PASSWORD}
      KC_HOSTNAME: auth.${domain_name}
      KC_PROXY: edge
      KC_HTTP_ENABLED: "true"
      KC_HOSTNAME_STRICT: "false"
    volumes:
      - ./keycloak:/opt/keycloak/data/import
      - keycloak_data:/opt/keycloak/data
    ports:
      - "8180:8080"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/realms/master || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  app:
    image: smartpresence-app:latest
    container_name: smartpresence-app
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      SPRING_DATASOURCE_URL: $${DB_URL}
      SPRING_DATASOURCE_USERNAME: $${DB_USERNAME}
      SPRING_DATASOURCE_PASSWORD: $${DB_PASSWORD}
      JWT_SECRET: $${JWT_SECRET}
      BEACON_API_KEY: $${BEACON_API_KEY}
      KEYCLOAK_ISSUER_URI: https://auth.${domain_name}/realms/smartpresence
      KEYCLOAK_JWKS_URI: https://auth.${domain_name}/realms/smartpresence/protocol/openid-connect/certs
      KEYCLOAK_ADMIN_URL: http://keycloak:8080
      KEYCLOAK_ADMIN_CLIENT_ID: smartpresence-admin-cli
      KEYCLOAK_REALM: smartpresence
      SERVER_SERVLET_CONTEXT_PATH: /api/v1
      SPRING_PROFILES_ACTIVE: prod
    ports:
      - "8080:8080"
    depends_on:
      keycloak:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - app_logs:/var/log/smartpresence

volumes:
  keycloak_data:
  app_logs:
COMPOSEEOF

chown -R ubuntu:ubuntu /home/ubuntu/${project_name}

echo ">>> [5/5] Create keycloak database on RDS"
# Extract host and port from endpoint (format: host:port)
DB_HOST=$(echo "${db_endpoint}" | cut -d: -f1)
DB_PORT=$(echo "${db_endpoint}" | cut -d: -f2)

PGPASSWORD="${db_password}" psql -h "$DB_HOST" -p "$DB_PORT" -U "${db_username}" -d smartpresence -c "SELECT 1;" 2>/dev/null || true
PGPASSWORD="${db_password}" psql -h "$DB_HOST" -p "$DB_PORT" -U "${db_username}" -d postgres -c "CREATE DATABASE keycloak;" 2>/dev/null || true

echo ">>> Bootstrap complete! SSH in and run: cd ${project_name} && docker compose up -d"
