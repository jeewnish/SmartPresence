import { create } from 'zustand';

/**
 * Global user store.
 *
 * user: UserResponse | null
 *   { id, clerkUserId, email, firstName, lastName, role, createdAt }
 *
 * role: 'ROLE_STUDENT' | 'ROLE_LECTURER' | null
 */
const useUserStore = create((set) => ({
  user: null,
  role: null,
  isLoading: false,

  setUser: (user) =>
    set({
      user,
      role: user?.role ?? null,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  clear: () =>
    set({
      user: null,
      role: null,
      isLoading: false,
    }),
}));

export default useUserStore;
