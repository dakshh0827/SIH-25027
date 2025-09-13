import React from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import StatsCard from '../ui/StatsCard';
import { TreePine, Coins, MapPin, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import StatusBadge from '../UI/StatusBadge';

const DashboardTab = ({ currentNGO }) => {
  const { projects } = useProjectStore();
  const ngoProjects = projects.filter(p => p.ngo === currentNGO.name);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          label="Active Projects"
          value={ngoProjects.length}
          icon={TreePine}
          color="text-green-400"
        />
        <StatsCard 
          label="Carbon Credits"
          value={currentNGO.totalCredits}
          icon={Coins}
          color="text-yellow-400"
        />
        <StatsCard 
          label="Restored Area"
          value={`${currentNGO.totalArea} ha`}
          icon={MapPin}
          color="text-blue-400"
        />
      </div>

      {/* My Projects */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">My Projects</h3>
        <div className="space-y-4">
          {ngoProjects.map(project => (
            <div key={project.id} className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-medium text-white">{project.title}</h4>
                  <p className="text-slate-400 text-sm">{project.location}</p>
                </div>
                <StatusBadge status={project.status} />
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-teal-400 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-green-400 font-medium">{project.carbonCredits}</div>
                  <div className="text-slate-500">Credits</div>
                </div>
                <div>
                  <div className="text-blue-400 font-medium">{project.area} ha</div>
                  <div className="text-slate-500">Area</div>
                </div>
                <div>
                  <div className="text-purple-400 font-medium">{project.iotSensors}</div>
                  <div className="text-slate-500">Sensors</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;