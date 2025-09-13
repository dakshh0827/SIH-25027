import React from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';

const PersonalDetailsStep = ({ formData, handleChange, onNext }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl text-white font-semibold">Step 1: Personal Details</h3>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-300">Full Name</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email Address</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <button
        onClick={onNext}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        Next Step <ArrowRight className="h-4 w-4 ml-2" />
      </button>
    </div>
  );
};

export default PersonalDetailsStep;