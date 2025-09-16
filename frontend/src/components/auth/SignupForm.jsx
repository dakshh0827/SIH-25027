import React, { useState } from 'react';
import PersonalDetailsStep from './personalDetailsStep';
import RoleSelectionStep from './RoleSelectionStep';
import AdminDetailsStep from './AdminDetailsStep';
import OrganizationDetailsStep from './OrganizationDetailsStep';
import { Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
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
    organizationType: '', 
    // FPO, Manufacturer, and Laboratory fields
    fpoName: '',
    regNumber: '',
    pan: '',
    gstin: '',
    registeredAddress: '',
    authorizedRepresentative: '',
    manufacturerName: '',
    ayushLicenseNumber: '',
    labName: '',
    nablAccreditationNumber: '',
    scopeOfNablAccreditation: '',
  });

  const navigate = useNavigate();

  const handleNext = (newData) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);

    // If the next step is after OrganizationDetailsStep or AdminDetailsStep,
    // it means the form is complete and we can submit
    if (step === 2 && updatedData.role === 'admin') {
        handleSubmit(updatedData);
    } else if (step === 3) {
        handleSubmit(updatedData);
    } else {
        setStep(prev => prev + 1);
    }
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = (finalData) => {
    // Here you would typically send the data to your backend
    console.log("Final form data:", finalData);
    
    // Redirect based on the user's role
    switch (finalData.role) {
      case 'fpo':
        navigate("/farmer");
        break;
      case 'manufacturers':
        navigate("/manufacturer");
        break;
      case 'laboratories':
        navigate("/labs");
        break;
      case 'admin':
        navigate("/admin-dashboard"); // Assuming a route for admin
        break;
      default:
        console.error("Unknown role, cannot redirect.");
        break;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <PersonalDetailsStep onNext={handleNext} />;
      case 2:
        return <RoleSelectionStep onSelectRole={(role) => handleNext({ role })} onBack={handleBack} />;
      case 3:
        if (formData.role === 'admin') {
          // Admin form should not be here, it should be handled in step 2
          return null; 
        } else if ('ngo/community'.includes(formData.role)) {
          return <OrganizationDetailsStep onNext={handleNext} onBack={handleBack} formData={formData} />;
        }
        return null;
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