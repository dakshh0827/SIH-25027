import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';

const Navigation = ({ currentView, setCurrentView }) => {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setCurrentView('login');
  };
  
  const handleSwitchView = () => {
    if (currentView === 'login' || currentView === 'signup') {
      setCurrentView('public');
    } else {
      setCurrentView('login');
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2">
        {currentView !== 'login' && currentView !== 'signup' && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg text-white hover:bg-slate-700/80 transition-colors text-sm"
          >
            Logout
          </button>
        )}
        <button
          onClick={handleSwitchView}
          className="px-4 py-2 bg-blue-600/80 backdrop-blur-sm border border-blue-500/30 rounded-lg text-white hover:bg-blue-700/80 transition-colors text-sm"
        >
          {currentView === 'login' || currentView === 'signup' ? 'View Public' : 'Switch View'}
        </button>
      </div>
    </div>
  );
};

export default Navigation;