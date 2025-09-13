import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="ml-4 text-slate-400">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;