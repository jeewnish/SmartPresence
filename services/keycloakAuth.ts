import { keycloakConfig, keycloakEndpoints } from '../constants/keycloak';

export type KeycloakTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type?: string;
  scope?: string;
};

export type KeycloakUserInfo = {
  sub: string;
  email?: string;
  preferred_username?: string;
  email_verified?: boolean;
  name?: string;
};

export class KeycloakAuthError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'invalid_credentials'
      | 'email_not_verified'
      | 'client_not_allowed'
      | 'network_error'
      | 'unknown_error'
  ) {
    super(message);
    this.name = 'KeycloakAuthError';
  }
}

function toFormBody(values: Record<string, string>): string {
  return Object.entries(values)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

function parseTokenError(payload: unknown): KeycloakAuthError {
  if (typeof payload !== 'object' || payload === null) {
    return new KeycloakAuthError(
      'Login failed. Please check your credentials and try again.',
      'unknown_error'
    );
  }

  const tokenError = payload as { error?: string; error_description?: string };
  const description = tokenError.error_description?.trim() || tokenError.error?.trim() || '';

  if (description.toLowerCase().includes('account is not fully set up')) {
    return new KeycloakAuthError(
      'Your account exists, but email verification is still pending. Please verify your email and try again.',
      'email_not_verified'
    );
  }

  if (tokenError.error === 'invalid_grant') {
    return new KeycloakAuthError('Invalid email or password.', 'invalid_credentials');
  }

  if (tokenError.error === 'unauthorized_client' || tokenError.error === 'invalid_client') {
    return new KeycloakAuthError(
      'Keycloak client is not configured for direct access grants. Enable Direct access grants for the mobile client.',
      'client_not_allowed'
    );
  }

  return new KeycloakAuthError(description || 'Login failed. Please try again.', 'unknown_error');
}

export async function loginWithKeycloak(
  email: string,
  password: string
): Promise<KeycloakTokenResponse> {
  let response: Response;

  try {
    response = await fetch(keycloakEndpoints.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: toFormBody({
        grant_type: 'password',
        client_id: keycloakConfig.clientId,
        username: email,
        password,
      }),
    });
  } catch {
    throw new KeycloakAuthError(
      'Unable to reach Keycloak. Make sure Docker is running and the Keycloak container is healthy.',
      'network_error'
    );
  }

  if (!response.ok) {
    const raw = await response.text();
    let parsed: unknown = null;

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }

    if (typeof parsed === 'string') {
      throw new KeycloakAuthError(parsed || 'Login failed. Please try again.', 'unknown_error');
    }

    throw parseTokenError(parsed);
  }

  return (await response.json()) as KeycloakTokenResponse;
}

export async function fetchKeycloakUserInfo(accessToken: string): Promise<KeycloakUserInfo> {
  const response = await fetch(keycloakEndpoints.userinfo, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new KeycloakAuthError(
      'Login succeeded, but user profile lookup failed.',
      'unknown_error'
    );
  }

  return (await response.json()) as KeycloakUserInfo;
}

export function buildRegistrationUrl(): string {
  const query = toFormBody({
    client_id: keycloakConfig.clientId,
    response_type: 'code',
    scope: 'openid profile email',
    redirect_uri: keycloakConfig.redirectUri,
  });

  return `${keycloakEndpoints.registration}?${query}`;
}
