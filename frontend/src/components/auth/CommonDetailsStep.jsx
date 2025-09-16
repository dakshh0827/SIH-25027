import React from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod schema for common details
const commonDetailsSchema = z.object({
    displayName: z.string().min(1, 'Display Name is required.'),
    officialAddress: z.string().min(1, 'Official Address is required.'),
    jurisdictionState: z.string().min(1, 'Jurisdiction State is required.'),
    district: z.string().min(1, 'District is required.'),
    primaryContactName: z.string().min(1, 'Primary Contact Name is required.'),
    primaryContactRole: z.string().min(1, 'Primary Contact Role is required.'),
    primaryContactPhone: z.string().min(1, 'Phone number is required.'),
    primaryContactEmail: z.string().email('Invalid email address.'),
    geoCoordinates: z.string().regex(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/, 'Invalid geo coordinates format (e.g., 21.9497, 88.2743).'),
    blockchainWallet: z.string().min(1, 'Blockchain Wallet / Public Key is required.'),
    consent: z.boolean().refine(val => val === true, 'You must consent to the terms.'),
});

const CommonDetailsStep = ({ onNext, onBack }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(commonDetailsSchema),
    });

    const onSubmit = (data) => {
        onNext(data);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl text-white font-semibold">Step 4: Common Details</h3>
            <p className="text-slate-400">Enter your public and contact information for the registry.</p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Display Name */}
                <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-slate-300">Display Name</label>
                    <input
                        type="text"
                        id="displayName"
                        {...register("displayName")}
                        className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
                    />
                    {errors.displayName && <p className="mt-1 text-sm text-red-400">{errors.displayName.message}</p>}
                </div>

                {/* Official Address */}
                <div>
                    <label htmlFor="officialAddress" className="block text-sm font-medium text-slate-300">Official Address</label>
                    <input
                        type="text"
                        id="officialAddress"
                        {...register("officialAddress")}
                        className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
                    />
                    {errors.officialAddress && <p className="mt-1 text-sm text-red-400">{errors.officialAddress.message}</p>}
                </div>

                {/* Jurisdiction State & District */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="jurisdictionState" className="block text-sm font-medium text-slate-300">Jurisdiction State</label>
                        <input
                            type="text"
                            id="jurisdictionState"
                            {...register("jurisdictionState")}
                            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
                        />
                        {errors.jurisdictionState && <p className="mt-1 text-sm text-red-400">{errors.jurisdictionState.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="district" className="block text-sm font-medium text-slate-300">District</label>
                        <input
                            type="text"
                            id="district"
                            {...register("district")}
                            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
                        />
                        {errors.district && <p className="mt-1 text-sm text-red-400">{errors.district.message}</p>}
                    </div>
                </div>

                {/* Primary Contact Details */}
                <div>
                    <label htmlFor="primaryContactName" className="block text-sm font-medium text-slate-300">Primary Contact Name</label>
                    <input
                        type="text"
                        id="primaryContactName"
                        {...register("primaryContactName")}
                        className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
                    />
                    {errors.primaryContactName && <p className="mt-1 text-sm text-red-400">{errors.primaryContactName.message}</p>}
                </div>

                <div>
                    <label htmlFor="primaryContactRole" className="block text-sm font-medium text-slate-300">Primary Contact Role</label>
                    <input
                        type="text"
                        id="primaryContactRole"
                        {...register("primaryContactRole")}
                        className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
                    />
                    {errors.primaryContactRole && <p className="mt-1 text-sm text-red-400">{errors.primaryContactRole.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="primaryContactPhone" className="block text-sm font-medium text-slate-300">Primary Contact Phone</label>
                        <input
                            type="tel"
                            id="primaryContactPhone"
                            {...register("primaryContactPhone")}
                            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
                        />
                        {errors.primaryContactPhone && <p className="mt-1 text-sm text-red-400">{errors.primaryContactPhone.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="primaryContactEmail" className="block text-sm font-medium text-slate-300">Primary Contact Email</label>
                        <input
                            type="email"
                            id="primaryContactEmail"
                            {...register("primaryContactEmail")}
                            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
                        />
                        {errors.primaryContactEmail && <p className="mt-1 text-sm text-red-400">{errors.primaryContactEmail.message}</p>}
                    </div>
                </div>

                {/* Geo Coordinates */}
                <div>
                    <label htmlFor="geoCoordinates" className="block text-sm font-medium text-slate-300">Geo Coordinates of Office</label>
                    <input
                        type="text"
                        id="geoCoordinates"
                        {...register("geoCoordinates")}
                        placeholder="e.g. 21.9497, 88.2743"
                        className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
                    />
                    {errors.geoCoordinates && <p className="mt-1 text-sm text-red-400">{errors.geoCoordinates.message}</p>}
                </div>

                {/* Blockchain Wallet */}
                <div>
                    <label htmlFor="blockchainWallet" className="block text-sm font-medium text-slate-300">Blockchain Wallet / Public Key</label>
                    <input
                        type="text"
                        id="blockchainWallet"
                        {...register("blockchainWallet")}
                        placeholder="Auto-generated if they don’t have one"
                        className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
                    />
                    {errors.blockchainWallet && <p className="mt-1 text-sm text-red-400">{errors.blockchainWallet.message}</p>}
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="consent"
                        {...register("consent")}
                        className="h-4 w-4 text-green-600 border-slate-600 focus:ring-green-500"
                    />
                    <label htmlFor="consent" className="ml-2 block text-sm text-slate-400">
                        I consent to the terms and document storage.
                    </label>
                </div>
                {errors.consent && <p className="mt-1 text-sm text-red-400">{errors.consent.message}</p>}
            </form>

            <div className="flex gap-4 mt-6">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 flex items-center justify-center px-4 py-3 border border-slate-600 text-slate-300 font-semibold transition-all duration-300 hover:bg-slate-600 hover:text-white active:scale-[0.98]"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </button>
                <button
                    type="submit"
                    onClick={handleSubmit(onSubmit)} // Added this to trigger form validation
                    className="flex-1 flex items-center justify-center px-4 py-3 border border-slate-600 text-slate-300 font-semibold transition-all duration-300 hover:bg-slate-600 hover:text-white active:scale-[0.98]"
                >
                    Submit <ArrowRight className="h-4 w-4 ml-2" />
                </button>
            </div>
        </div>
    );
};

export default CommonDetailsStep;