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

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
    handleNext();
  };

  const handleOrgTypeSelect = (orgType) => {
    setFormData(prev => ({ ...prev, organizationType: orgType }));
    handleNext();
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <PersonalDetailsStep formData={formData} handleChange={handleChange} onNext={handleNext} />;
      case 2:
        return <RoleSelectionStep onSelectRole={handleRoleSelect} onBack={handleBack} />;
      case 3:
        if (formData.role === 'admin') {
          return <AdminDetailsStep formData={formData} handleChange={handleChange} onNext={handleNext} onBack={handleBack} />;
        } else if (formData.role === 'ngo') {
          return <OrganizationDetailsStep formData={formData} handleChange={handleChange} onNext={handleNext} onBack={handleBack} />;
        }
        return null;
      case 4:
        return <CommonDetailsStep formData={formData} handleChange={handleChange} onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <SuccessStep setCurrentView={setCurrentView} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full mx-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Create an Account</h2>
            <div className="p-2 bg-blue-500/20 rounded-full">
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