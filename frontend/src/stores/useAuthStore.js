import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode'; // You'll need to install this library: `npm install jwt-decode`

const useAuthStore = create((set) => ({
  user: null,
  userType: null, // 'admin', 'farmer', 'manufacturer', 'lab'
  token: null,

  // Method to check for an existing token in localStorage
  checkAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      // Check if the token is not expired
      if (decoded.exp * 1000 > Date.now()) {
        set({ user: decoded, userType: decoded.role, token: token });
      } else {
        // Token is expired, log out the user
        set({ user: null, userType: null, token: null });
        localStorage.removeItem('token');
      }
    }
  },
  
  login: (userData, token) => {
    set({ user: userData, userType: userData.role, token });
    localStorage.setItem('token', token);
  },
  
  logout: () => {
    set({ user: null, userType: null, token: null });
    localStorage.removeItem('token');
  },
}));

export { useAuthStore };