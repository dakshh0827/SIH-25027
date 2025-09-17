import React from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
    try {
      // Show success message for step completion
      toast.success('Personal details saved successfully!', {
        duration: 2000,
        position: 'top-right',
      });
      onNext(data);
    } catch (error) {
      toast.error('Failed to save personal details. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
    }
  };

  const handleLoginRedirect = () => {
    toast.loading('Redirecting to login...', {
      duration: 1000,
    });
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  // Show validation error toasts
  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0]?.message;
      if (firstError) {
        toast.error(firstError, {
          duration: 3000,
        });
      }
    }
  }, [errors]);

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
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
            onFocus={() => toast.dismiss()} // Dismiss any existing toasts on focus
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
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
            onFocus={() => toast.dismiss()}
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
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
            onFocus={() => toast.dismiss()}
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
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:outline-none"
            onFocus={() => toast.dismiss()}
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>}
        </div>
        
        {/* Next Step Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-3 border border-[#34d399] bg-[#10b981] text-white font-semibold transition-all duration-300 hover:bg-transparent hover:border-[#34d399] hover:text-[#34d399] active:scale-[0.98]"
        >
          Next Step <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </form>
      
      <div className="mt-4 text-center text-slate-400">
        Already have an account?{' '}
        <button
          onClick={handleLoginRedirect}
          className="text-[#34d399] hover:text-[#10b981] font-medium transition-colors duration-300"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default PersonalDetailsStep;
