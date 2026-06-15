import { backendEndpoints } from '../constants/backend';

export type RegisterUserPayload = {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  studentId?: string;
};

export async function registerUserWithBackend(payload: RegisterUserPayload): Promise<void> {
  let response: Response;

  try {
    response = await fetch(backendEndpoints.register, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      'Unable to reach backend registration service. Check backend URL configuration.'
    );
  }

  if (!response.ok) {
    const raw = await response.text();
    const message = raw.trim().length > 0 ? raw : 'Registration failed.';
    throw new Error(`Backend ${response.status}: ${message}`);
  }
}
