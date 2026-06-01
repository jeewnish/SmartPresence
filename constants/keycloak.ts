import { Platform } from 'react-native';

const defaultHost = Platform.select({
  android: '10.0.2.2',
  default: 'localhost',
});

const webOrigin = (globalThis as { location?: { origin?: string } }).location?.origin;

export const keycloakConfig = {
  scheme: process.env.EXPO_PUBLIC_KEYCLOAK_SCHEME ?? 'http',
  host: process.env.EXPO_PUBLIC_KEYCLOAK_HOST ?? defaultHost ?? 'localhost',
  port: process.env.EXPO_PUBLIC_KEYCLOAK_PORT ?? '8180',
  realm: process.env.EXPO_PUBLIC_KEYCLOAK_REALM ?? 'smartpresence',
  clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'smartpresence-app',
  redirectUri:
    process.env.EXPO_PUBLIC_KEYCLOAK_REDIRECT_URI ??
    (Platform.OS === 'web'
      ? `${webOrigin ?? 'http://localhost:8081'}/auth/callback`
      : 'smartpresence://auth/callback'),
};

const portSuffix = keycloakConfig.port ? `:${keycloakConfig.port}` : '';
const baseUrl = `${keycloakConfig.scheme}://${keycloakConfig.host}${portSuffix}`;
const realmBaseUrl = `${baseUrl}/realms/${keycloakConfig.realm}`;

export const keycloakEndpoints = {
  baseUrl,
  realmBaseUrl,
  token: `${realmBaseUrl}/protocol/openid-connect/token`,
  userinfo: `${realmBaseUrl}/protocol/openid-connect/userinfo`,
  registration: `${realmBaseUrl}/protocol/openid-connect/registrations`,
};
