import React, { useState } from 'react';
import { Waves } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import toast, { Toaster } from 'react-hot-toast';
import PersonalDetailsStep from './personalDetailsStep';
import RoleSelectionStep from './RoleSelectionStep';
import AdminDetailsStep from './AdminDetailsStep';
import OrganizationDetailsStep from './OrganizationDetailsStep';

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

    const navigate = (path) => {
        // This would be replaced with actual navigation logic
        window.location.href = path;
    };
    const { login, setLoading, handleApiError, showSuccess, showInfo } = useAuthStore();

    const handleNext = (newData) => {
        try {
            const updatedData = { ...formData, ...newData };
            setFormData(updatedData);

            // Show progress toast
            if (step === 1) {
                showInfo('Personal details saved. Please select your role.');
            } else if (step === 2 && updatedData.role === 'admin') {
                showInfo('Role selected. Please complete admin verification details.');
            } else if (step === 2 && updatedData.role === 'user') {
                showInfo('Role selected. Please provide organization details.');
            }

            if (updatedData.role === 'admin' && step === 2) {
                handleSubmit(updatedData);
            } else if (updatedData.role === 'user' && step === 2) {
                setStep(prev => prev + 1);
            } else if (step === 3) {
                handleSubmit(updatedData);
            } else {
                setStep(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error in handleNext:', error);
            toast.error('Error processing form data. Please try again.');
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        toast('Returning to previous step...', {
            duration: 1500,
            icon: '⬅️',
        });
    };

    const handleSubmit = async (finalData) => {
        // Show loading toast
        const loadingToast = toast.loading('Creating your account...', {
            position: 'top-center',
        });
        
        setLoading(true);

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
          
          // Dismiss loading toast
          toast.dismiss(loadingToast);
          
          // Use the login action to update the store and save the token
          login(user, token);
          
          // Show success message
          showSuccess('Account created successfully! Redirecting to dashboard...');
          
          // Redirect based on the user's role after a short delay
          setTimeout(() => {
            switch (user.role.toLowerCase()) {
              case 'fpo':
                navigate("/farmer");
                break;
              case 'manufacturer':
                navigate("/manufacturer");
                break;
              case 'laboratory':
                navigate("/labs");
                break;
              case 'admin':
                navigate("/admin-dashboard");
                break;
              default:
                console.error("Unknown role, cannot redirect.");
                toast.error("Unknown user role. Please contact support.");
                break;
            }
          }, 1000);

        } catch (error) {
          toast.dismiss(loadingToast);
          setLoading(false);
          
          console.error('Registration error:', error);
          
          // Handle specific error cases
          if (error.message.includes('email')) {
            toast.error('This email is already registered. Please try logging in instead.');
          } else if (error.message.includes('validation')) {
            toast.error('Please check your form data and try again.');
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            toast.error('Network error. Please check your connection and try again.');
          } else {
            handleApiError(error, 'Registration failed. Please try again.');
          }
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <PersonalDetailsStep onNext={handleNext} />;
            case 2:
                return (
                    <RoleSelectionStep 
                        onSelectRole={(role) => handleNext({ role })} 
                        onBack={handleBack} 
                    />
                );
            case 3:
                if (formData.role === 'user') {
                    return (
                        <OrganizationDetailsStep 
                            onNext={handleNext} 
                            onBack={handleBack} 
                            formData={formData} 
                        />
                    );
                }
                return null;
            default:
                return null;
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Personal Information';
            case 2: return 'Role Selection';
            case 3: return 'Organization Details';
            default: return 'Sign Up';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Toaster />
            <div className="max-w-xl w-full mx-4">
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Create an Account</h2>
                            <p className="text-sm text-slate-400 mt-1">{getStepTitle()} - Step {step} of 3</p>
                        </div>
                        <div className="p-2 bg-blue-500/20">
                            <Waves className="h-6 w-6 text-[#34d399]" />
                        </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs text-slate-400">Progress</span>
                            <span className="text-xs text-slate-400">{Math.round((step / 3) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2">
                            <div 
                                className="bg-[#34d399] h-2 transition-all duration-300 ease-in-out" 
                                style={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>
                    </div>

                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default SignupForm;