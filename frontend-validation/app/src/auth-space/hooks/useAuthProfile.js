import { useUser } from '@clerk/expo';
import useUserStore from '../../store/userStore';
import { USER_ROLES, normalizeUserRole } from '../roles';

/**
 * The single source of truth for identity displayed across the app.
 * Backend profile fields take priority because they match UserResponse.
 * Clerk is used only for auth-owned presentation fields such as the avatar.
 */
export default function useAuthProfile() {
  const backendUser = useUserStore((state) => state.user);
  const { user: clerkUser } = useUser();
  const configuredRole = normalizeUserRole(clerkUser?.publicMetadata?.role);
  const role =
    configuredRole === USER_ROLES.LECTURER
      ? USER_ROLES.LECTURER
      : USER_ROLES.STUDENT;

  const firstName = backendUser?.firstName ?? clerkUser?.firstName ?? '';
  const lastName = backendUser?.lastName ?? clerkUser?.lastName ?? '';

  return {
    id: backendUser?.id ?? null,
    clerkUserId: backendUser?.clerkUserId ?? clerkUser?.id ?? null,
    studentId: backendUser?.universityId ?? clerkUser?.username ?? '',
    universityId: backendUser?.universityId ?? clerkUser?.username ?? '',
    department: backendUser?.department ?? null,
    email:
      backendUser?.email ??
      clerkUser?.primaryEmailAddress?.emailAddress ??
      '',
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(' '),
    role,
    createdAt: backendUser?.createdAt ?? null,
    imageUrl: clerkUser?.imageUrl ?? null,
  };
}
