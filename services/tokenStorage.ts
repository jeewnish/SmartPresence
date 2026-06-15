import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import type { KeycloakTokenResponse } from './keycloakAuth';

const SESSION_KEY = 'smartpresence.auth.session';

export type StoredAuthSession = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt: number;
};

function serialize(session: StoredAuthSession): string {
  return JSON.stringify(session);
}

function deserialize(value: string | null): StoredAuthSession | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredAuthSession;
  } catch {
    return null;
  }
}

export async function saveAuthSession(token: KeycloakTokenResponse): Promise<void> {
  const session: StoredAuthSession = {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    tokenType: token.token_type,
    expiresAt: Date.now() + token.expires_in * 1000,
  };

  const value = serialize(session);

  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(SESSION_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, value);
}

export async function readAuthSession(): Promise<StoredAuthSession | null> {
  if (Platform.OS === 'web') {
    return deserialize(globalThis.localStorage?.getItem(SESSION_KEY) ?? null);
  }

  return deserialize(await SecureStore.getItemAsync(SESSION_KEY));
}

export async function clearAuthSession(): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_KEY);
}
