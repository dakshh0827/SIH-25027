import React from 'react';
import { Users, MapPin, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ProjectCard = ({ project, index }) => {
  return (
    <div 
      className={`animate-on-scroll`} 
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-blue-400 font-mono text-sm">{project.id}</span>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                project.status === 'verified'  ? 'bg-green-500/20 text-green-400 border border-green-500/30'  :
                project.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              }`}>
                {project.status === 'verified' && <CheckCircle className="inline h-3 w-3 mr-1" />}
                {project.status === 'in-progress' && <Clock className="inline h-3 w-3 mr-1" />}
                {project.status === 'pending-verification' && <AlertCircle className="inline h-3 w-3 mr-1" />}
                {project.status.replace('-', ' ')}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {project.title}
            </h3>
            <div className="flex items-center text-slate-400 mb-2">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm">{project.ngo}</span>
            </div>
            <div className="flex items-center text-slate-400 mb-4">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">{project.location}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">{project.carbonCredits}</div>
            <div className="text-xs text-slate-400">Credits Generated</div>
          </div>
        </div>

        <p className="text-slate-300 text-sm mb-6 leading-relaxed">{project.description}</p>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm font-medium text-white">{project.progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-teal-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-400">{project.area} ha</div>
            <div className="text-xs text-slate-400">Area</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-purple-400">{project.iotSensors}</div>
            <div className="text-xs text-slate-400">IoT Sensors</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-teal-400">{project.dataPoints.toLocaleString()}</div>
            <div className="text-xs text-slate-400">Data Points</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;