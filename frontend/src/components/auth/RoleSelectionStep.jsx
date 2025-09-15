import React from 'react';
import { Shield, Users, ChevronLeft, ArrowRight } from 'lucide-react';

const RoleSelectionStep = ({ onSelectRole, onBack }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl text-white font-semibold">Step 2: Select Your Role</h3>
      <p className="text-slate-400">Choose the account type that best describes you.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onSelectRole('admin')}
          className="w-full flex flex-col items-center p-6 bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-300 text-white text-center active:scale-[0.98]"
        >
          <Shield className="h-10 w-10 text-blue-400 mb-3" />
          <div className="font-medium text-lg">Admin</div>
          <div className="text-sm text-slate-400">Verify projects & manage registry</div>
        </button>
        <button
          onClick={() => onSelectRole('ngo')}
          className="w-full flex flex-col items-center p-6 bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors duration-300 text-white text-center active:scale-[0.98]"
        >
          <Users className="h-10 w-10 text-green-400 mb-3" />
          <div className="font-medium text-lg">NGO / Community</div>
          <div className="text-sm text-slate-400">Submit projects & earn credits</div>
        </button>
      </div>
      <button
        onClick={onBack}
        className="w-full flex items-center justify-center px-4 py-3 border border-slate-600 text-slate-300 font-semibold transition-all duration-300 hover:bg-slate-600 hover:text-white active:scale-[0.98]"
      >
        <ChevronLeft className="h-4 w-4 mr-2" /> Back
      </button>
    </div>
  );
};

export default RoleSelectionStep;