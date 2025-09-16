import React, { useState } from 'react';
import PersonalDetailsStep from './personalDetailsStep';
import RoleSelectionStep from './RoleSelectionStep';
import AdminDetailsStep from './AdminDetailsStep';
import OrganizationDetailsStep from './OrganizationDetailsStep';
import { Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

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
    const { login } = useAuthStore(); // Use the login action from the store

    const handleNext = (newData) => {
        const updatedData = { ...formData, ...newData };
        setFormData(updatedData);

        if (updatedData.role === 'admin' && step === 2) {
            handleSubmit(updatedData);
        } else if (updatedData.role === 'user' && step === 2) {
            setStep(prev => prev + 1);
        } else if (step === 3) {
            handleSubmit(updatedData);
        } else {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async (finalData) => {
        // Prepare data for API
        const dataToSend = {
          fullName: finalData.name,
          email: finalData.email,
          password: finalData.password,
          role: finalData.role.toUpperCase(), // Backend expects uppercase role
          ...finalData
        };
        
        try {
          const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
          });
          
          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Registration failed');
          }

          const { token, user } = await res.json();
          // Use the login action to update the store and save the token
          login(user, token);
          
          // Redirect based on the user's role
          switch (user.role.toLowerCase()) {
            case 'fpo':
              navigate("/farmer");
              break;
            case 'manufacturer':
              navigate("/manufacturer");
              break;
            case 'laboratory': // The role is 'laboratory' from the backend
              navigate("/labs");
              break;
            case 'admin':
              navigate("/admin-dashboard");
              break;
            default:
              console.error("Unknown role, cannot redirect.");
              break;
          }

        } catch (error) {
          alert(`Error: ${error.message}`);
          console.error(error);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <PersonalDetailsStep onNext={handleNext} />;
            case 2:
                return <RoleSelectionStep onSelectRole={(role) => handleNext({ role })} onBack={handleBack} />;
            case 3:
                if (formData.role === 'user') {
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