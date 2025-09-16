import React, { useState } from 'react';
import PersonalDetailsStep from './personalDetailsStep';
import RoleSelectionStep from './RoleSelectionStep';
import AdminDetailsStep from './AdminDetailsStep';
import OrganizationDetailsStep from './OrganizationDetailsStep';
import CommonDetailsStep from './CommonDetailsStep';
import SuccessStep from './SuccessStep';
import { Waves } from 'lucide-react';

const SignupForm = ({ setCurrentView }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    // Admin fields
    govtId: '',
    govtIdImage: null,
    metamaskAccount: '',
    // Organization fields
    organizationType: '', // 'ngo' or 'panchayat'
    ngoLegalName: '',
    regId: '',
    regType: '',
    regCertificate: null,
    panNumber: '',
    panUpload: null,
    bankProof: null,
    signatoryName: '',
    signatoryRole: '',
    signatoryIdProof: null,
    yearOfEstablishment: '',
    panchayatCode: '',
    panchayatName: '',
    sarpanchName: '',
    repIdProof: null,
    officialLetter: null,
    panchayatSeal: null,
    // Common fields
    displayName: '',
    officialAddress: '',
    jurisdictionState: '',
    district: '',
    primaryContactName: '',
    primaryContactRole: '',
    primaryContactPhone: '',
    primaryContactEmail: '',
    geoCoordinates: '',
    consent: false,
    blockchainWallet: ''
  });

  const handleNext = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
    setStep(prev => prev + 1);
  };
  const handleBack = () => setStep(prev => prev - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <PersonalDetailsStep onNext={handleNext} />;
      case 2:
        return <RoleSelectionStep onSelectRole={(role) => handleNext({ role })} onBack={handleBack} />;
      case 3:
        if (formData.role === 'admin') {
          return <AdminDetailsStep onNext={handleNext} onBack={handleBack} />;
        } else if (formData.role === 'ngo') {
          return <OrganizationDetailsStep onNext={handleNext} onBack={handleBack} formData={formData} />;
        }
        return null;
      case 4:
        return <CommonDetailsStep onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <SuccessStep setCurrentView={setCurrentView} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-4">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Create an Account</h2>
            <div className="p-2 bg-blue-500/20">
              <Waves className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default SignupForm;