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

  const onSubmit = (data) => {
    // This is where you would normally call your API to authenticate the user
    console.log('Login submitted with data:', data);

    // For demonstration, we'll simulate a successful login and navigate
    // to a specific dashboard based on a hardcoded email
    if (data.email === 'admin@nccr.com') {
      login({ name: 'NCCR Admin' }, 'admin');
      navigate('/admin-dashboard');
    } else if (data.email === 'ngo@green.com') {
      login({ name: 'Green Coast Foundation' }, 'ngo');
      navigate('/ngo-dashboard');
    } else {
      // You can handle an invalid login or a public user here
      alert('Invalid credentials or access type.');
    }
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-500/20">
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
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
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
              />
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center px-5 py-3 border border-slate-600 text-slate-300 font-semibold transition-all duration-300 hover:bg-slate-600 hover:text-white active:scale-[0.98]"
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