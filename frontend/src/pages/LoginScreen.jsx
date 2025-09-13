import React from 'react';
import { Waves, Shield, Users, Globe, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

const LoginScreen = ({ setCurrentView }) => {
  const { login } = useAuthStore();

  const handleLogin = (userType) => {
    if (userType === 'admin') {
      login({ name: 'NCCR Admin' }, 'admin');
      setCurrentView('admin');
    } else if (userType === 'ngo') {
      login({ name: 'Green Coast Foundation' }, 'ngo');
      setCurrentView('ngo');
    } else if (userType === 'public') {
      setCurrentView('public');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Waves className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Blue Carbon Registry</h2>
            <p className="text-slate-400">Select your access type</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => handleLogin('admin')}
              className="w-full flex items-center justify-between p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors text-white"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-400" />
                <div className="text-left">
                  <div className="font-medium">NCCR Admin</div>
                  <div className="text-sm text-slate-400">Verification & Management</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
            
            <button
              onClick={() => handleLogin('ngo')}
              className="w-full flex items-center justify-between p-4 bg-green-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-colors text-white"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-400" />
                <div className="text-left">
                  <div className="font-medium">NGO / Community</div>
                  <div className="text-sm text-slate-400">Project Management</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
            
            <button
              onClick={() => handleLogin('public')}
              className="w-full flex items-center justify-between p-4 bg-slate-600/20 border border-slate-500/30 rounded-lg hover:bg-slate-600/30 transition-colors text-white"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-slate-400" />
                <div className="text-left">
                  <div className="font-medium">Public Dashboard</div>
                  <div className="text-sm text-slate-400">View All Projects</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
          </div>
          <div className="mt-8 text-center text-slate-400">
            Don't have an account?{' '}
            <button 
              onClick={() => setCurrentView('signup')}
              className="text-blue-400 hover:text-blue-300 font-medium"
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