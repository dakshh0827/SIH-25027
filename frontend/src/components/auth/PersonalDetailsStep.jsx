import React from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

// Zod schema for validation
const personalDetailsSchema = z.object({
  name: z.string().min(1, "Full Name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

const PersonalDetailsStep = ({ onNext }) => {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(personalDetailsSchema),
  });

  const onSubmit = (data) => {
    onNext(data);
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl text-white font-semibold">Step 1: Personal Details</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300">Full Name</label>
          <input
            type="text"
            id="name"
            {...register("name")}
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
          />
          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email Address</label>
          <input
            type="email"
            id="email"
            {...register("email")}
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
          />
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
          <input
            type="password"
            id="password"
            {...register("password")}
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
          />
          {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            {...register("confirmPassword")}
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>}
        </div>
        
        {/* Next Step Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-3 border border-slate-600 text-slate-300 font-semibold transition-all duration-300 hover:bg-slate-600 hover:text-white active:scale-[0.98]"
        >
          Next Step <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </form>
      
      <div className="mt-4 text-center text-slate-400">
        Already have an account?{' '}
        <button
          onClick={handleLoginRedirect}
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default PersonalDetailsStep;