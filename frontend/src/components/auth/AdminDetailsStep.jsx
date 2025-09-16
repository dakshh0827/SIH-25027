import React from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod schema for Admin details
const adminDetailsSchema = z.object({
  govtId: z.string().min(1, 'Government ID is required.'),
  govtIdImage: z.any().refine((fileList) => fileList?.length > 0, 'ID Proof upload is required.'),
  metamaskAccount: z.string().min(1, 'Metamask account is required.')
    .startsWith('0x', 'Metamask account address must start with 0x.')
    .length(42, 'Metamask account address must be 42 characters long.'),
});

const AdminDetailsStep = ({ onNext, onBack }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(adminDetailsSchema),
  });

  const onSubmit = (data) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl text-white font-semibold">Step 3: Admin Details</h3>
      <p className="text-slate-400">Provide the following details for verification as an NCCR Admin.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="govtId" className="block text-sm font-medium text-slate-300">NCCR Govt. ID</label>
          <input
            type="text"
            id="govtId"
            {...register("govtId")}
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
          />
          {errors.govtId && <p className="mt-1 text-sm text-red-400">{errors.govtId.message}</p>}
        </div>
        
        <div>
          <label htmlFor="govtIdImage" className="block text-sm font-medium text-slate-300">
            Upload ID Proof
          </label>
          <input
            type="file"
            id="govtIdImage"
            {...register("govtIdImage")}
            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {errors.govtIdImage && <p className="mt-1 text-sm text-red-400">{errors.govtIdImage.message}</p>}
        </div>
        
        <div>
          <label htmlFor="metamaskAccount" className="block text-sm font-medium text-slate-300">Metamask Account Address</label>
          <input
            type="text"
            id="metamaskAccount"
            {...register("metamaskAccount")}
            className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-blue-400 focus:border-blue-400 focus:ring-1 focus:outline-none"
          />
          {errors.metamaskAccount && <p className="mt-1 text-sm text-red-400">{errors.metamaskAccount.message}</p>}
        </div>
        
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
            className="flex-1 flex items-center justify-center px-4 py-3 border border-slate-600 text-slate-300 font-semibold transition-all duration-300 hover:bg-slate-600 hover:text-white active:scale-[0.98]"
          >
            Submit <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminDetailsStep;