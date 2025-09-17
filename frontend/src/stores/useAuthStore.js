import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: null,
  userType: null, // 'admin', 'farmer', 'manufacturer', 'lab'
  token: null,
  isLoading: false,

  // Method to check for an existing token in localStorage
  checkAuth: () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        // Check if the token is not expired
        if (decoded.exp * 1000 > Date.now()) {
          set({ user: decoded, userType: decoded.role, token: token });
          toast.success('Welcome back! Session restored.', {
            duration: 2000,
            position: 'top-right',
            style: {
              background: '#10b981',
              color: '#fff',
            },
          });
        } else {
          // Token is expired, log out the user
          set({ user: null, userType: null, token: null });
          localStorage.removeItem('token');
          toast.error('Your session has expired. Please login again.', {
            duration: 4000,
            position: 'top-right',
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          });
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // Invalid token, clear everything
      set({ user: null, userType: null, token: null });
      localStorage.removeItem('token');
      toast.error('Authentication error. Please login again.', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    }
  },
  
  login: (userData, token) => {
    try {
      set({ user: userData, userType: userData.role, token, isLoading: false });
      localStorage.setItem('token', token);
      
      // Show success toast based on role
      const roleDisplayName = {
        'fpo': 'Farmer',
        'manufacturer': 'Manufacturer',
        'laboratory': 'Laboratory',
        'admin': 'Admin',
        'farmer': 'Farmer',
        'lab': 'Laboratory'
      }[userData.role.toLowerCase()] || 'User';
      
      toast.success(`🎉 Welcome, ${userData.fullName || userData.name}! Logged in as ${roleDisplayName}.`, {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Login failed. Please try again.', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    }
  },
  
  logout: () => {
    try {
      const currentUser = get().user;
      set({ user: null, userType: null, token: null, isLoading: false });
      localStorage.removeItem('token');
      
      toast.success(
        currentUser 
          ? `👋 Goodbye, ${currentUser.fullName || currentUser.name}! You've been logged out.`
          : '✅ You\'ve been logged out successfully.',
        {
          duration: 2000,
          position: 'top-right',
          style: {
            background: '#10b981',
            color: '#fff',
          },
        }
      );
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error logging out. Please try again.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    }
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // Helper method for API error handling
  handleApiError: (error, defaultMessage = 'An error occurred') => {
    const message = error.response?.data?.message || error.message || defaultMessage;
    toast.error(`❌ ${message}`, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
      },
    });
  },

  // Helper method for success messages
  showSuccess: (message) => {
    toast.success(`✅ ${message}`, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
      },
    });
  },

  // Helper method for warning messages
  showWarning: (message) => {
    toast(`⚠️ ${message}`, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#f59e0b',
        color: '#1f2937',
      },
    });
  },

  // Helper method for info messages
  showInfo: (message) => {
    toast(`ℹ️ ${message}`, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#3b82f6',
        color: '#ffffff',
      },
    });
  },

  // Helper method for loading messages
  showLoading: (message) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#1e293b',
        color: '#fff',
      },
    });
  },
}));

export { useAuthStore };
