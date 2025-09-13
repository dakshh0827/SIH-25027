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
          className="w-full flex flex-col items-center p-6 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors text-white text-center"
        >
          <Shield className="h-10 w-10 text-blue-400 mb-3" />
          <div className="font-medium text-lg">Admin</div>
          <div className="text-sm text-slate-400">Verify projects & manage registry</div>
        </button>
        <button
          onClick={() => onSelectRole('ngo')}
          className="w-full flex flex-col items-center p-6 bg-green-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-colors text-white text-center"
        >
          <Users className="h-10 w-10 text-green-400 mb-3" />
          <div className="font-medium text-lg">NGO / Community</div>
          <div className="text-sm text-slate-400">Submit projects & earn credits</div>
        </button>
      </div>
      <button
        onClick={onBack}
        className="w-full flex items-center justify-center px-4 py-2 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-2" /> Back
      </button>
    </div>
  );
};

export default RoleSelectionStep;