import React from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';

const AdminDetailsStep = ({ formData, handleChange, onNext, onBack }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl text-white font-semibold">Step 3: Admin Details</h3>
      <p className="text-slate-400">Provide the following details for verification as an NCCR Admin.</p>
      <div>
        <label htmlFor="govtId" className="block text-sm font-medium text-slate-300">NCCR Govt. ID</label>
        <input
          type="text"
          name="govtId"
          id="govtId"
          value={formData.govtId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="govtIdImage" className="block text-sm font-medium text-slate-300">
          Upload ID Proof
        </label>
        <input
          type="file"
          name="govtIdImage"
          id="govtIdImage"
          onChange={handleChange}
          className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          required
        />
      </div>
      <div>
        <label htmlFor="metamaskAccount" className="block text-sm font-medium text-slate-300">Metamask Account Address</label>
        <input
          type="text"
          name="metamaskAccount"
          id="metamaskAccount"
          value={formData.metamaskAccount}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Submit <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default AdminDetailsStep;