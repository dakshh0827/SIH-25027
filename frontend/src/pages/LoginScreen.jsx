import React from 'react';
import { Waves } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';

// Zod schema for login form validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const LoginScreen = () => {
  const { login, setLoading, handleApiError, showSuccess, showWarning } = useAuthStore();

  const navigate = (path) => {
    // This would be replaced with actual navigation logic
    window.location.href = path;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    // Show loading toast
    const loadingToast = toast.loading('Signing you in...', {
      position: 'top-center',
    });
    
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }

      const { token, user } = await res.json();
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Update the Zustand store with the user data and token
      login(user, token);

      // Show success and redirect
      setTimeout(() => {
        // Redirect based on the user's role from the API response
        switch (user.role.toLowerCase()) {
          case 'fpo':
            navigate("/farmer");
            break;
          case 'manufacturer':
            navigate("/manufacturer");
            break;
          case 'laboratory':
            navigate("/labs");
            break;
          case 'admin':
            navigate("/admin-dashboard");
            break;
          default:
            console.error("Unknown role, cannot redirect.");
            toast.error("Unknown user role. Please contact support.");
            break;
        }
      }, 1000);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      setLoading(false);
      
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Invalid credentials') || error.message.includes('password')) {
        toast.error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message.includes('not found')) {
        showWarning('Account not found. Would you like to create a new account?');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (error.message.includes('suspended') || error.message.includes('blocked')) {
        toast.error('Your account has been suspended. Please contact support.');
      } else {
        handleApiError(error, 'Login failed. Please try again.');
      }
    }
  };

  const handleSignup = () => {
    toast('Redirecting to signup...', {
      icon: '👋',
      duration: 1500,
    });
    setTimeout(() => navigate('/signup'), 500);
  };

  const handleForgotPassword = () => {
    showWarning('Password reset feature is not yet implemented. Please contact support.');
  };

  // Show validation errors as toasts
  React.useEffect(() => {
    if (errors.email) {
      toast.error(errors.email.message, { duration: 3000 });
    }
    if (errors.password) {
      toast.error(errors.password.message, { duration: 3000 });
    }
  }, [errors]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Toaster />
      <div className="max-w-xl w-full mx-4">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-sm text-slate-400 mt-1">Sign in to your account</p>
            </div>
            <div className="p-2 bg-blue-500/20">
              <Waves className="h-6 w-6 text-[#34d399]" />
            </div>
          </div>
          
          <div onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                disabled={isSubmitting}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>
            
            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-[#34d399] hover:text-blue-300 transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                id="password"
                {...register('password')}
                disabled={isSubmitting}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your password"
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-4 py-3 border border-slate-600 text-slate-300 font-semibold transition-all duration-300 hover:bg-slate-600 hover:text-white active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-300"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
          
          {/* Sign up link */}
          <div className="mt-8 text-center text-slate-400">
            Don't have an account?{' '}
            <button 
              onClick={handleSignup}
              disabled={isSubmitting}
              className="text-[#34d399] hover:text-blue-300 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign up
            </button>
          </div>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700/50 rounded">
            <p className="text-xs text-slate-400 text-center">
              Demo Mode: Use any valid email format with password "password123"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;