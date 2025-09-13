import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  userType: null, // 'admin', 'ngo', 'public'
  login: (userData, type) => set({ user: userData, userType: type }),
  logout: () => set({ user: null, userType: null }),
}));

export { useAuthStore };