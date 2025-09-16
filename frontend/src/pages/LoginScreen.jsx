import React from 'react';
import { Waves } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import gsap from 'gsap';

// Zod schema for login form validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const LoginScreen = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
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
      
      // Update the Zustand store with the user data and token
      login(user, token);

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
          break;
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Waves className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Login to Blue Carbon Registry</h2>
            <p className="text-slate-400">Enter your credentials to access your dashboard.</p>
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
                className="mt-1 block w-full px-4 py-3 rounded-md bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-200 hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 focus:outline-none"
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register('password')}
                className="mt-1 block w-full px-4 py-3 rounded-md bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-200 hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500 focus:ring-1 focus:outline-none"
              />
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-8 text-center text-slate-400">
            Don't have an account?{' '}
            <button 
              onClick={handleSignup}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;