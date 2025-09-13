import React from 'react';
import { useProjectStore } from '../../stores/useProjectStore';
import { Plus, MapPin } from 'lucide-react';
import StatusBadge from '../UI/StatusBadge';

const ProjectsTab = ({ currentNGO }) => {
  const { projects } = useProjectStore();
  const ngoProjects = projects.filter(p => p.ngo === currentNGO.name);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">My Projects</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4 inline mr-2" />
          New Project
        </button>
      </div>
      
      <div className="grid gap-6">
        {ngoProjects.map(project => (
          <div key={project.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-semibold text-white">{project.title}</h4>
                  <span className="text-blue-400 font-mono text-sm">{project.id}</span>
                </div>
                <div className="flex items-center text-slate-400 mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{project.location}</span>
                </div>
              </div>
              <StatusBadge status={project.status} />
            </div>
            
            <p className="text-slate-300 mb-6">{project.description}</p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h5 className="text-white font-medium mb-3">Target Species</h5>
                <div className="flex flex-wrap gap-2">
                  {project.targetSpecies.map(species => (
                    <span key={species} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                      {species}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-white font-medium mb-3">Project Stats</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Start Date:</span>
                    <span className="text-white">{project.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Update:</span>
                    <span className="text-white">{project.lastUpdate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Funding:</span>
                    <span className="text-white">₹{project.totalFunding.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-lg font-semibold text-green-400">{project.carbonCredits}</div>
                <div className="text-xs text-slate-400">Credits</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-lg font-semibold text-blue-400">{project.area} ha</div>
                <div className="text-xs text-slate-400">Area</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-lg font-semibold text-purple-400">{project.iotSensors}</div>
                <div className="text-xs text-slate-400">Sensors</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-lg font-semibold text-teal-400">{project.dataPoints.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Data Points</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsTab;