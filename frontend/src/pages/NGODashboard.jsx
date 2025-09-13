import React, { useState } from 'react';
import {
  Leaf,
  Award,
  Activity,
  TreePine,
  Upload,
  Coins
} from 'lucide-react';
import DashboardTab from '../components/ngo/DashboardTab';
import ProjectsTab from '../components/ngo/ProjectsTab';
import DataUploadTab from '../components/ngo/DataUploadTab';

const NGODashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Mock NGO data - in real app, this would come from auth store
  const currentNGO = {
    id: 'NGO-001',
    name: 'Green Coast Foundation',
    totalCredits: 450,
    totalArea: 125.5
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'projects', label: 'Projects', icon: TreePine },
    { id: 'upload', label: 'Data Upload', icon: Upload },
    { id: 'credits', label: 'Credits', icon: Coins }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab currentNGO={currentNGO} />;
      case 'projects':
        return <ProjectsTab currentNGO={currentNGO} />;
      case 'upload':
        return <DataUploadTab />;
      case 'credits':
        return (
          <div className="text-center py-12">
            <Coins className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Credits management coming soon</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{currentNGO.name}</h1>
                <p className="text-slate-400 text-sm">NGO Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-slate-400">Wallet Balance</div>
                <div className="text-lg font-semibold text-green-400">{currentNGO.totalCredits} Credits</div>
              </div>
              <Award className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          {/* Main Content */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;