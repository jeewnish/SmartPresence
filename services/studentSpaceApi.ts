import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { backendEndpoints } from '../constants/backend';

const DEVICE_FINGERPRINT_KEY = 'smartpresence.device.fingerprint';

type BackendEnvelope<T> = {
  success: boolean;
  message: string | null;
  data: T;
};

type DeviceOsType = 'ANDROID' | 'IOS';

export type StudentProfile = {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  indexNumber?: string | null;
  enrollmentYear?: number | null;
  isActive: boolean;
  keycloakSubject?: string | null;
  tokenExpiresAt?: string | null;
};

export type BleSessionLookup = {
  sessionId: number;
  courseCode?: string | null;
  courseName?: string | null;
  venueCode?: string | null;
  beaconMac?: string | null;
  bleToken: string;
  tokenExpiresAt?: string | null;
  sessionActive: boolean;
  rotationCount?: number | null;
  recommendedTxPower?: number | null;
};

export type StudentCheckinResult = {
  success: boolean;
  status?: string | null;
  courseName?: string | null;
  venueName?: string | null;
  message?: string | null;
};

type CheckinRequestPayload = {
  bleToken: string;
  deviceFingerprint: string;
  rssiDbm?: number;
  rssiSamples?: number;
  txPowerDbm?: number;
  detectedBeaconMac?: string;
  biometricPassed: boolean;
  biometricMethod?: string;
};

function getAuthHeader(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function parseBackendResponse<T>(response: Response): Promise<T> {
  const rawText = await response.text();
  const hasBody = rawText.trim().length > 0;

  if (!response.ok) {
    if (!hasBody) {
      throw new Error(`Backend ${response.status}: Request failed.`);
    }

    try {
      const parsed = JSON.parse(rawText) as { message?: string };
      const message = parsed.message?.trim();
      throw new Error(`Backend ${response.status}: ${message || 'Request failed.'}`);
    } catch {
      throw new Error(`Backend ${response.status}: ${rawText}`);
    }
  }

  if (!hasBody) {
    return undefined as T;
  }

  const parsed = JSON.parse(rawText) as BackendEnvelope<T> | T;
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'success' in parsed &&
    typeof parsed.success === 'boolean'
  ) {
    const envelope = parsed as BackendEnvelope<T>;
    if (!envelope.success) {
      throw new Error(envelope.message || 'Backend request was rejected.');
    }
    return envelope.data;
  }

  return parsed as T;
}

async function safeFetch<T>(url: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new Error('Unable to reach backend service. Check backend host and port settings.');
  }

  return parseBackendResponse<T>(response);
}

function getDeviceOsType(): DeviceOsType {
  return Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
}

function createDeviceFingerprint(): string {
  const randomPart = Math.random().toString(36).slice(2, 12);
  const timePart = Date.now().toString(36);
  return `sp-${Platform.OS}-${randomPart}-${timePart}`;
}

async function readDeviceFingerprint(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(DEVICE_FINGERPRINT_KEY) ?? null;
  }
  return await SecureStore.getItemAsync(DEVICE_FINGERPRINT_KEY);
}

async function saveDeviceFingerprint(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(DEVICE_FINGERPRINT_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(DEVICE_FINGERPRINT_KEY, value);
}

export async function getOrCreateDeviceFingerprint(): Promise<string> {
  const existing = await readDeviceFingerprint();
  if (existing && existing.trim().length > 0) {
    return existing;
  }

  const generated = createDeviceFingerprint();
  await saveDeviceFingerprint(generated);
  return generated;
}

export async function fetchStudentProfile(accessToken: string): Promise<StudentProfile> {
  return safeFetch<StudentProfile>(backendEndpoints.me, {
    method: 'GET',
    headers: {
      ...getAuthHeader(accessToken),
    },
  });
}

export async function lookupBleSession(
  accessToken: string,
  bleToken: string
): Promise<BleSessionLookup> {
  const query = new URLSearchParams({ bleToken }).toString();
  return safeFetch<BleSessionLookup>(`${backendEndpoints.bleSessionLookup}?${query}`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(accessToken),
    },
  });
}

export async function registerStudentDevice(accessToken: string): Promise<void> {
  const deviceFingerprint = await getOrCreateDeviceFingerprint();
  const params = new URLSearchParams({
    deviceFingerprint,
    deviceModel: `SmartPresence ${Platform.OS}`,
    osType: getDeviceOsType(),
    osVersion: 'unknown',
    appVersion: '1.0.0',
  });

  await safeFetch<void>(`${backendEndpoints.registerDevice}?${params.toString()}`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(accessToken),
    },
  });
}

export async function submitStudentCheckin(
  accessToken: string,
  request: Omit<CheckinRequestPayload, 'deviceFingerprint'> & { deviceFingerprint?: string }
): Promise<StudentCheckinResult> {
  const fingerprint = request.deviceFingerprint ?? (await getOrCreateDeviceFingerprint());
  const payload: CheckinRequestPayload = {
    ...request,
    deviceFingerprint: fingerprint,
  };

  return safeFetch<StudentCheckinResult>(backendEndpoints.checkin, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(accessToken),
    },
    body: JSON.stringify(payload),
  });
}
