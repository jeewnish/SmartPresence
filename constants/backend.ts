import { Platform } from 'react-native';

type PublicEnv = Record<string, string | undefined>;

const env = (globalThis as { process?: { env?: PublicEnv } }).process?.env ?? {};

const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

function getEnvValue(key: string, fallback: string): string {
  const raw = env[key]?.trim();
  return raw && raw.length > 0 ? raw : fallback;
}

function getOptionalEnvValue(key: string): string | undefined {
  const raw = env[key];
  return raw === undefined ? undefined : raw.trim();
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export const backendConfig = {
  scheme: getEnvValue('EXPO_PUBLIC_BACKEND_SCHEME', 'http'),
  host: getEnvValue('EXPO_PUBLIC_BACKEND_HOST', defaultHost),
  port: getOptionalEnvValue('EXPO_PUBLIC_BACKEND_PORT') ?? '8080',
  apiBasePath: normalizePath(getEnvValue('EXPO_PUBLIC_BACKEND_API_BASE_PATH', '/api/v1')),
  registerPath: normalizePath(getEnvValue('EXPO_PUBLIC_BACKEND_REGISTER_PATH', '/auth/register')),
  mePath: normalizePath(getEnvValue('EXPO_PUBLIC_BACKEND_ME_PATH', '/auth/me')),
  bleSessionLookupPath: normalizePath(
    getEnvValue('EXPO_PUBLIC_BACKEND_BLE_LOOKUP_PATH', '/ble/session/lookup')
  ),
  checkinPath: normalizePath(getEnvValue('EXPO_PUBLIC_BACKEND_CHECKIN_PATH', '/checkin')),
  registerDevicePath: normalizePath(
    getEnvValue('EXPO_PUBLIC_BACKEND_REGISTER_DEVICE_PATH', '/checkin/register-device')
  ),
};

const portSuffix = backendConfig.port ? `:${backendConfig.port}` : '';

export const backendBaseUrl = `${backendConfig.scheme}://${backendConfig.host}${portSuffix}${backendConfig.apiBasePath}`;

export const backendEndpoints = {
  register: `${backendBaseUrl}${backendConfig.registerPath}`,
  me: `${backendBaseUrl}${backendConfig.mePath}`,
  bleSessionLookup: `${backendBaseUrl}${backendConfig.bleSessionLookupPath}`,
  checkin: `${backendBaseUrl}${backendConfig.checkinPath}`,
  registerDevice: `${backendBaseUrl}${backendConfig.registerDevicePath}`,
};
