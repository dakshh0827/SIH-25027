import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  userType: null, // 'admin', 'farmer', 'manufacturer', 'lab'
  login: (userData, type) => set({ user: userData, userType: type }),
  logout: () => set({ user: null, userType: null }),
  setUser: (userData) => set({ user: userData, userType: userData.userType }), // Add this method
}));

export { useAuthStore };