import React from 'react';
import { Upload, FileText } from 'lucide-react';

const DataUploadTab = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Data Upload</h3>
        <p className="text-slate-400">Upload project data for NCCR verification</p>
      </div>
      
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="h-8 w-8 text-blue-400" />
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">Upload Project Data</h4>
          <p className="text-slate-400 text-sm">
            Upload geo-tagged images, sensor data, and project documentation
          </p>
        </div>
        
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 mb-6">
          <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">Drag and drop files here, or click to browse</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Choose Files
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-blue-400 font-medium">Geo-tagged Images</div>
            <div className="text-slate-400">JPG, PNG max 10MB</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-green-400 font-medium">IoT Sensor Data</div>
            <div className="text-slate-400">CSV, JSON formats</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-purple-400 font-medium">Documentation</div>
            <div className="text-slate-400">PDF reports</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUploadTab;