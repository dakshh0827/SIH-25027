import React from 'react';
import { Shield, Users, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const RoleSelectionStep = ({ onSelectRole, onBack }) => {
  
  const handleRoleSelection = (role) => {
    // Clear all existing toasts first
    toast.dismiss();
    
    const roleNames = {
      'admin': 'Administrator',
      'user': 'Supply Chain User'
    };
    
    toast.success(`✅ ${roleNames[role]} role selected!`, {
      duration: 2000,
    });
    
    onSelectRole(role);
  };

  const handleBack = () => {
    // Clear all existing toasts first
    toast.dismiss();
    
    toast.loading('⬅️ Going back to previous step...', {
      duration: 1000,
    });
    setTimeout(() => {
      onBack();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl text-white font-semibold">Step 2: Select Your Role</h3>
      <p className="text-slate-400">Choose the account type that best describes you.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Admin Role */}
        <button
          onClick={() => handleRoleSelection('admin')}
          className="w-full flex flex-col items-center p-6 bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-[#34d399] transition-all duration-300 text-white text-center active:scale-[0.98] group"
        >
          <Shield className="h-10 w-10 text-blue-400 group-hover:text-[#34d399] mb-3 transition-colors duration-300" />
          <div className="font-medium text-lg">Admin</div>
          <div className="text-sm text-slate-400">Verify projects & manage registry</div>
        </button>

        {/* User Role */}
        <button
          onClick={() => handleRoleSelection('user')}
          className="w-full flex flex-col items-center p-6 bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-[#34d399] transition-all duration-300 text-white text-center active:scale-[0.98] group"
        >
          <Users className="h-10 w-10 text-green-400 group-hover:text-[#34d399] mb-3 transition-colors duration-300" />
          <div className="font-medium text-lg">User</div>
          <div className="text-sm text-slate-400">Join a supply chain</div>
        </button>
      </div>
      <button
        onClick={handleBack}
        className="w-full flex items-center justify-center px-4 py-3 border border-[#34d399] bg-transparent text-[#34d399] font-semibold transition-all duration-300 hover:bg-[#10b981] hover:border-[#10b981] hover:text-white active:scale-[0.98]"
      >
        <ChevronLeft className="h-4 w-4 mr-2" /> Back
      </button>
    </div>
  );
};

export default RoleSelectionStep;
