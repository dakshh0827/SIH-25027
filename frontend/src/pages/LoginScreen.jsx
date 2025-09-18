import React from 'react';
import { Waves } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast'; // Removed Toaster import
import { useNavigate } from 'react-router-dom';

// Zod schema for login form validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const LoginScreen = () => {
  const { login, setLoading, handleApiError, showSuccess, showWarning } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const loadingToast = toast.loading('🔐 Signing you in...', {
      position: 'top-right',
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
      
      // IMPORTANT: Dismiss loading toast first
      toast.dismiss(loadingToast);
      
      // Update the Zustand store with the user data and token
      // This will show the success toast from useAuthStore
      login(user, token);

      // REMOVED: Duplicate success toast to prevent triple toasts
      
      setTimeout(() => {
        // Redirect based on the user's role from the API response
        switch (user.role.toLowerCase()) {
          case 'fpo':
          case 'farmer':
            navigate("/farmer");
            break;
          case 'manufacturer':
            navigate("/manufacturer");
            break;
          case 'laboratory':
          case 'lab':
            navigate("/labs");
            break;
          case 'admin':
            navigate("/admin-dashboard");
            break;
          default:
            console.error("Unknown role, cannot redirect.");
            toast.error("❌ Unknown user role. Please contact support.", {
              duration: 4000,
            });
            break;
        }
      }, 1500);
      
    } catch (error) {
      // IMPORTANT: Always dismiss loading toast
      toast.dismiss(loadingToast);
      setLoading(false);
      
      console.error('Login error:', error);
      
      // Specific error messages with proper duration
      if (error.message.includes('Invalid credentials') || error.message.includes('password')) {
        toast.error('❌ Invalid email or password. Please check your credentials and try again.', {
          duration: 4000,
        });
      } else if (error.message.includes('not found')) {
        toast.error('❌ Account not found. Would you like to create a new account?', {
          duration: 4000,
        });
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        toast.error('❌ Network error. Please check your connection and try again.', {
          duration: 4000,
        });
      } else if (error.message.includes('suspended') || error.message.includes('blocked')) {
        toast.error('❌ Your account has been suspended. Please contact support.', {
          duration: 5000,
        });
      } else {
        toast.error('❌ Login failed. Please try again.', {
          duration: 4000,
        });
      }
    }
  };

  const handleSignup = () => {
    const loadingToast = toast.loading('Redirecting to signup...', {
      duration: 1000,
    });
    
    setTimeout(() => {
      toast.dismiss(loadingToast);
      navigate('/signup');
    }, 1000);
  };

  const handleForgotPassword = () => {
    toast.error('🔧 Password reset feature is not yet implemented.', { 
      duration: 3000 
    });
  };

  // Show validation errors as toasts
  React.useEffect(() => {
    if (errors.email) {
      toast.error(`❌ ${errors.email.message}`, { 
        duration: 3000 
      });
    }
    if (errors.password) {
      toast.error(`❌ ${errors.password.message}`, { 
        duration: 3000 
      });
    }
  }, [errors]);

  // Welcome toast when component mounts
  React.useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      toast('👋 Welcome back! Please sign in to continue.', {
        duration: 3000,
        icon: '🔐',
      });
    }, 500);

    return () => clearTimeout(welcomeTimer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* REMOVED: <Toaster /> - This was causing conflicts */}
      <div className="max-w-xl w-full mx-4">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-sm text-slate-400 mt-1">Sign in to your account</p>
            </div>
            <div className="p-2 bg-emerald-500/20">
              <Waves className="h-6 w-6 text-[#34d399]" />
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                onFocus={() => {
                  toast.dismiss(); // Clear any existing error toasts
                  toast('📧 Enter your registered email address', {
                    duration: 2000,
                    icon: '💡',
                  });
                }}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="text-xs text-[#34d399] hover:text-[#10b981] transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                id="password"
                {...register('password')}
                disabled={isSubmitting}
                onFocus={() => {
                  toast.dismiss();
                  toast('🔒 Enter your account password', {
                    duration: 2000,
                    icon: '💡',
                  });
                }}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your password"
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-4 py-3 border border-[#10b981] bg-[#10b981] text-white font-semibold transition-all duration-300 hover:bg-transparent hover:border-[#34d399] hover:text-[#34d399] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#10b981] disabled:hover:text-white"
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
          </form>
          
          {/* Sign up link */}
          <div className="mt-8 text-center text-slate-400">
            Don't have an account?{' '}
            <button 
              onClick={handleSignup}
              disabled={isSubmitting}
              className="text-[#34d399] hover:text-[#10b981] font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign up
            </button>
          </div>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 text-center">
              💡 Demo Mode: Use any valid email format with password "password123"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
