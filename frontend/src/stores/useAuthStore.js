import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

// Configure your API base URL here
const API_BASE_URL = 'http://localhost:5000';

// Debug: Log the API base URL
console.log('API_BASE_URL:', API_BASE_URL);

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  userType: null, // 'admin', 'farmer', 'manufacturer', 'lab'
  token: null,
  isLoading: false,
  profile: null, // Add profile to state

  // Methods

  // Check for an existing token in localStorage and validate it
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
          set({ user: null, userType: null, token: null, profile: null });
          localStorage.removeItem('token');
          toast.error('Your session has expired. Please log in again.', {
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
      set({ user: null, userType: null, token: null, profile: null });
      localStorage.removeItem('token');
      toast.error('Authentication error. Please log in again.', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    }
  },

  // Log in the user and save the token
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

      toast.success(`Welcome, ${userData.fullName || userData.name}! Logged in as ${roleDisplayName}.`, {
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

  // Log out the user and clear state
  logout: async () => {
    try {
      const currentUser = get().user;
      const { authenticatedFetch } = get();
      
      // Call the logout API
      try {
        await authenticatedFetch('/api/auth/logout', {
          method: 'POST',
        });
      } catch (error) {
        // Continue with logout even if API call fails
        console.warn('Logout API call failed:', error);
      }

      // Clear state and localStorage
      set({ user: null, userType: null, token: null, isLoading: false, profile: null });
      localStorage.removeItem('token');

      toast.success(
        currentUser
          ? `Goodbye, ${currentUser.fullName || currentUser.name}! You've been logged out.`
          : 'You\'ve been logged out successfully.',
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
      // Still clear local state even if there's an error
      set({ user: null, userType: null, token: null, isLoading: false, profile: null });
      localStorage.removeItem('token');
      
      toast.error('Error logging out. You have been logged out locally.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const { authenticatedFetch } = get();
      set({ isLoading: true });

      const data = await authenticatedFetch('/api/auth/profile', {
        method: 'GET',
      });

      set({ profile: data.profile, user: data.user, isLoading: false });
      
      toast.success('Profile loaded successfully', {
        duration: 2000,
        position: 'top-right',
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });

      return data;
    } catch (error) {
      console.error('Error getting profile:', error);
      set({ isLoading: false });
      
      // Better error message based on error type
      let errorMessage = 'Failed to load profile';
      if (error.message.includes('HTML')) {
        errorMessage = 'Server error - please check if the backend is running';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error - please check your connection';
      }
      
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      
      throw error;
    }
  },

  // Enhanced authenticatedFetch method with better error handling
  authenticatedFetch: async (url, options = {}) => {
    const { token } = get();
    
    // If no token exists, the user is not authenticated.
    if (!token) {
      get().logout(); 
      return Promise.reject(new Error('Authentication token not found. Please log in.'));
    }

    // Construct full URL
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log(`Making request to: ${fullUrl}`); // Debug log
      console.log(`Request config:`, config); // Debug log
      const response = await fetch(fullUrl, config);
      
      console.log(`Response status: ${response.status}`); // Debug log
      console.log(`Response URL: ${response.url}`); // Debug log
      
      // Log response headers
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log(`Response headers:`, headers);
      
      // If the token is invalid or expired, the backend should return a 401.
      if (response.status === 401) {
        get().logout();
        get().handleApiError(new Error('Session expired.'), 'Session expired.');
        return Promise.reject(new Error('Session expired.'));
      }
      
      // Check if response is HTML (indicates server error or wrong endpoint)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response received:', responseText.substring(0, 200));
        
        if (responseText.includes('<!doctype') || responseText.includes('<html')) {
          throw new Error('Server returned HTML instead of JSON. Check if the API endpoint exists and server is configured correctly.');
        }
        
        throw new Error('Server returned unexpected content type: ' + contentType);
      }
      
      if (!response.ok) {
        // Attempt to read the error message from the response body
        const errorData = await response.json().catch(() => ({ 
          message: `API request failed with status ${response.status}` 
        }));
        return Promise.reject(errorData);
      }
      
      return response.json();
    } catch (error) {
      console.error('Network or unexpected API error:', error);
      
      // Enhanced error handling
      if (error.message.includes('fetch')) {
        get().handleApiError(error, 'Network error. Please check if the server is running.');
      } else {
        get().handleApiError(error, 'API request failed. Please try again.');
      }
      
      return Promise.reject(error);
    }
  },

  // Helper method for API error handling
  handleApiError: (error, defaultMessage = 'An error occurred') => {
    const message = error.response?.data?.message || error.message || defaultMessage;
    toast.error(`${message}`, {
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
    toast.success(`${message}`, {
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
    toast(`${message}`, {
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
    toast(`${message}`, {
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
  
  // Set loading state
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));

export { useAuthStore };