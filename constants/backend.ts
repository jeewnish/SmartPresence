import { Platform } from 'react-native';

type PublicEnv = Record<string, string | undefined>;

const env = (globalThis as { process?: { env?: PublicEnv } }).process?.env ?? {};

const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

function getEnvValue(key: string, fallback: string): string {
  const raw = env[key]?.trim();
  return raw && raw.length > 0 ? raw : fallback;
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
  port: getEnvValue('EXPO_PUBLIC_BACKEND_PORT', '8080'),
  apiBasePath: normalizePath(getEnvValue('EXPO_PUBLIC_BACKEND_API_BASE_PATH', '/api/v1')),
  registerPath: normalizePath(getEnvValue('EXPO_PUBLIC_BACKEND_REGISTER_PATH', '/auth/register')),
};

const portSuffix = backendConfig.port ? `:${backendConfig.port}` : '';

export const backendBaseUrl = `${backendConfig.scheme}://${backendConfig.host}${portSuffix}${backendConfig.apiBasePath}`;

export const backendEndpoints = {
  register: `${backendBaseUrl}${backendConfig.registerPath}`,
};
