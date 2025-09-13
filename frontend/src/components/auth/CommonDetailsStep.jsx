import React from 'react';
import { ArrowRight, ChevronLeft, CheckCircle } from 'lucide-react';

const CommonDetailsStep = ({ formData, handleChange, onNext, onBack }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl text-white font-semibold">Step 4: Common Details</h3>
      <p className="text-slate-400">Enter your public and contact information for the registry.</p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-slate-300">Display Name</label>
          <input
            type="text"
            name="displayName"
            id="displayName"
            value={formData.displayName || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="officialAddress" className="block text-sm font-medium text-slate-300">Official Address</label>
          <input
            type="text"
            name="officialAddress"
            id="officialAddress"
            value={formData.officialAddress || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="jurisdictionState" className="block text-sm font-medium text-slate-300">Jurisdiction State</label>
            <input
              type="text"
              name="jurisdictionState"
              id="jurisdictionState"
              value={formData.jurisdictionState || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-slate-300">District</label>
            <input
              type="text"
              name="district"
              id="district"
              value={formData.district || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="primaryContactName" className="block text-sm font-medium text-slate-300">Primary Contact Name</label>
          <input
            type="text"
            name="primaryContactName"
            id="primaryContactName"
            value={formData.primaryContactName || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="primaryContactRole" className="block text-sm font-medium text-slate-300">Primary Contact Role</label>
          <input
            type="text"
            name="primaryContactRole"
            id="primaryContactRole"
            value={formData.primaryContactRole || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="primaryContactPhone" className="block text-sm font-medium text-slate-300">Primary Contact Phone</label>
            <input
              type="tel"
              name="primaryContactPhone"
              id="primaryContactPhone"
              value={formData.primaryContactPhone || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label htmlFor="primaryContactEmail" className="block text-sm font-medium text-slate-300">Primary Contact Email</label>
            <input
              type="email"
              name="primaryContactEmail"
              id="primaryContactEmail"
              value={formData.primaryContactEmail || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="geoCoordinates" className="block text-sm font-medium text-slate-300">Geo Coordinates of Office</label>
          <input
            type="text"
            name="geoCoordinates"
            id="geoCoordinates"
            value={formData.geoCoordinates || ''}
            onChange={handleChange}
            placeholder="e.g. 21.9497, 88.2743"
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="blockchainWallet" className="block text-sm font-medium text-slate-300">Blockchain Wallet / Public Key</label>
          <input
            type="text"
            name="blockchainWallet"
            id="blockchainWallet"
            value={formData.blockchainWallet || ''}
            onChange={handleChange}
            placeholder="Auto-generated if they don’t have one"
            className="mt-1 block w-full rounded-md bg-slate-700/50 border-slate-600 text-white shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="consent"
            id="consent"
            checked={formData.consent || false}
            onChange={e => handleChange({ target: { name: 'consent', value: e.target.checked } })}
            className="h-4 w-4 text-green-600 border-slate-600 rounded focus:ring-green-500"
            required
          />
          <label htmlFor="consent" className="ml-2 block text-sm text-slate-400">
            I consent to the terms and document storage.
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-2" /> Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          Submit <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default CommonDetailsStep;