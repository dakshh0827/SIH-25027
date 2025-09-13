import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessStep = ({ setCurrentView }) => {
  return (
    <div className="text-center py-12">
      <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-6 animate-pulse" />
      <h3 className="text-2xl font-bold text-white mb-2">Registration Complete!</h3>
      <p className="text-slate-400 mb-6">Your registration details have been submitted. An admin will review your credentials for verification. We will notify you once your account is activated.</p>
      <button
        onClick={() => setCurrentView('login')}
        className="px-6 py-3 rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        Back to Login
      </button>
    </div>
  );
};

export default SuccessStep;