import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, Building, FileText } from 'lucide-react';

const OrganizationDetailsStep = ({ formData, handleChange, onNext, onBack }) => {
  const [orgType, setOrgType] = useState(formData.organizationType || null);

  const renderNgoForm = () => (
    <>
      <div className="space-y-4">
        <div>
          <label htmlFor="ngoLegalName" className="block text-sm font-medium text-slate-300">NGO Legal Name</label>
          <input
            type="text"
            name="ngoLegalName"
            id="ngoLegalName"
            value={formData.ngoLegalName || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="regId" className="block text-sm font-medium text-slate-300">Registration Number</label>
          <input
            type="text"
            name="regId"
            id="regId"
            value={formData.regId || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="regType" className="block text-sm font-medium text-slate-300">Registration Type</label>
          <input
            type="text"
            name="regType"
            id="regType"
            value={formData.regType || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="regCertificate" className="block text-sm font-medium text-slate-300">Registration Certificate Upload</label>
          <input
            type="file"
            name="regCertificate"
            id="regCertificate"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            required
          />
        </div>
        <div>
          <label htmlFor="panNumber" className="block text-sm font-medium text-slate-300">PAN Number (Organization)</label>
          <input
            type="text"
            name="panNumber"
            id="panNumber"
            value={formData.panNumber || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="panUpload" className="block text-sm font-medium text-slate-300">PAN Upload</label>
          <input
            type="file"
            name="panUpload"
            id="panUpload"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            required
          />
        </div>
        <div>
          <label htmlFor="bankProof" className="block text-sm font-medium text-slate-300">Bank Account Proof</label>
          <input
            type="file"
            name="bankProof"
            id="bankProof"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            required
          />
        </div>
        <div>
          <label htmlFor="signatoryName" className="block text-sm font-medium text-slate-300">Authorized Signatory Name</label>
          <input
            type="text"
            name="signatoryName"
            id="signatoryName"
            value={formData.signatoryName || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="signatoryRole" className="block text-sm font-medium text-slate-300">Authorized Signatory Role</label>
          <input
            type="text"
            name="signatoryRole"
            id="signatoryRole"
            value={formData.signatoryRole || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="signatoryIdProof" className="block text-sm font-medium text-slate-300">Authorized Signatory ID Proof</label>
          <input
            type="file"
            name="signatoryIdProof"
            id="signatoryIdProof"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            required
          />
        </div>
        <div>
          <label htmlFor="yearOfEstablishment" className="block text-sm font-medium text-slate-300">Year of Establishment</label>
          <input
            type="number"
            name="yearOfEstablishment"
            id="yearOfEstablishment"
            value={formData.yearOfEstablishment || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
      </div>
    </>
  );

  const renderPanchayatForm = () => (
    <>
      <div className="space-y-4">
        <div>
          <label htmlFor="panchayatCode" className="block text-sm font-medium text-slate-300">Panchayat Code</label>
          <input
            type="text"
            name="panchayatCode"
            id="panchayatCode"
            value={formData.panchayatCode || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="panchayatName" className="block text-sm font-medium text-slate-300">Panchayat Name</label>
          <input
            type="text"
            name="panchayatName"
            id="panchayatName"
            value={formData.panchayatName || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="sarpanchName" className="block text-sm font-medium text-slate-300">Sarpanch / Authorized Representative Name</label>
          <input
            type="text"
            name="sarpanchName"
            id="sarpanchName"
            value={formData.sarpanchName || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="repIdProof" className="block text-sm font-medium text-slate-300">Authorized Representative ID Proof</label>
          <input
            type="file"
            name="repIdProof"
            id="repIdProof"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            required
          />
        </div>
        <div>
          <label htmlFor="officialLetter" className="block text-sm font-medium text-slate-300">Official Letter (on Panchayat Letterhead)</label>
          <input
            type="file"
            name="officialLetter"
            id="officialLetter"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            required
          />
        </div>
        <div>
          <label htmlFor="panchayatSeal" className="block text-sm font-medium text-slate-300">Panchayat Seal/Stamp</label>
          <input
            type="file"
            name="panchayatSeal"
            id="panchayatSeal"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-xl text-white font-semibold">Step 3: Organization Details</h3>
      <p className="text-slate-400">Provide the following details for verification as a community organization.</p>
      
      {!orgType && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setOrgType('ngo')}
            className="w-full flex flex-col items-center p-6 bg-green-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-colors text-white text-center"
          >
            <Building className="h-10 w-10 text-green-400 mb-3" />
            <div className="font-medium text-lg">NGO</div>
            <div className="text-sm text-slate-400">Register as a Non-Governmental Organization</div>
          </button>
          <button
            onClick={() => setOrgType('panchayat')}
            className="w-full flex flex-col items-center p-6 bg-green-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-colors text-white text-center"
          >
            <FileText className="h-10 w-10 text-green-400 mb-3" />
            <div className="font-medium text-lg">Panchayat</div>
            <div className="text-sm text-slate-400">Register as a Local Governing Body</div>
          </button>
        </div>
      )}

      {orgType === 'ngo' && (
        <form onSubmit={(e) => { e.preventDefault(); onNext(orgType); }} className="space-y-6">
          {renderNgoForm()}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setOrgType(null)}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Next Step <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </form>
      )}

      {orgType === 'panchayat' && (
        <form onSubmit={(e) => { e.preventDefault(); onNext(orgType); }} className="space-y-6">
          {renderPanchayatForm()}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setOrgType(null)}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Next Step <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </form>
      )}
      
      {!orgType && (
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center px-4 py-2 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> Back
        </button>
      )}
    </div>
  );
};

export default OrganizationDetailsStep;