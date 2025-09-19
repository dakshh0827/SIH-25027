// File: src/components/Auth/AdminDetailsStep.jsx

import React from 'react';
import { ArrowRight, ChevronLeft, FileImage } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

// Zod schema for validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const adminDetailsSchema = z.object({
  idProofImage: z
    .any()
    .refine((files) => files?.length === 1, "ID Proof image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

const AdminDetailsStep = ({ onNext, onBack }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(adminDetailsSchema),
  });

  const idProofImage = watch("idProofImage");

  // Show validation error toasts
  React.useEffect(() => {
    if (errors.idProofImage) {
      toast.error(`❌ ${errors.idProofImage.message}`, {
        duration: 4000,
        id: 'validation-error',
      });
    }
  }, [errors.idProofImage]);

  const onSubmit = (data) => {
    toast.success('✅ ID Proof selected!', { id: 'step-success' });
    // Pass the file object to the parent
    onNext({ idProofImage: data.idProofImage[0] });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl text-white font-semibold">Step 3: Admin Verification</h3>
      <p className="text-slate-400">Please upload a government-issued ID for verification.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="idProofImage" className="block text-sm font-medium text-slate-300 mb-1">ID Proof Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed hover:border-[#34d399] transition-colors duration-300">
            <div className="space-y-1 text-center">
              <FileImage className="mx-auto h-12 w-12 text-slate-400" />
              <div className="flex text-sm text-slate-400">
                <label
                  htmlFor="idProofImage"
                  className="relative cursor-pointer font-medium text-[#34d399] hover:text-[#10b981] focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input id="idProofImage" {...register("idProofImage")} type="file" className="sr-only" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500">PNG, JPG, JPEG up to 5MB</p>
              {idProofImage?.[0] && <p className="text-sm text-green-400 pt-2">Selected: {idProofImage[0].name}</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 flex items-center justify-center px-4 py-3 border border-[#34d399] text-[#34d399] font-semibold transition-all hover:bg-[#10b981] hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center px-4 py-3 border border-[#10b981] bg-[#10b981] text-white font-semibold transition-all hover:bg-transparent hover:text-[#34d399]"
          >
            Complete Signup <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminDetailsStep;