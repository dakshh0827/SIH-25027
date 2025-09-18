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
    const [shouldResetForm, setShouldResetForm] = useState(false);
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
        // Clear all toasts before navigation
        toast.dismiss();
        // This would be replaced with actual navigation logic
        window.location.href = path;
    };
    
    const { login, setLoading, handleApiError, showSuccess, showInfo } = useAuthStore();

    const resetFormToStart = () => {
        // Clear all toasts first
        toast.dismiss();
        
        // Reset form data
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: '',
            govtId: '',
            govtIdImage: null,
            metamaskAccount: '',
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
        
        // Go back to step 1
        setStep(1);
        
        // Trigger form reset in PersonalDetailsStep
        setShouldResetForm(true);
        
        // Reset the trigger after a short delay
        setTimeout(() => setShouldResetForm(false), 100);
    };

    const handleNext = (newData) => {
        try {
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
        } catch (error) {
            console.error('Error in handleNext:', error);
            toast.error('❌ Error processing form data. Please try again.', {
                duration: 4000,
                id: 'form-process-error'
            });
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        toast('⬅️ Returning to previous step...', {
            duration: 1500,
            id: 'step-back'
        });
    };

    const handleSubmit = async (finalData) => {
        // Clear all existing toasts before starting submission
        toast.dismiss();
        
        // Show loading toast
        const loadingToast = toast.loading('🔄 Creating your account...', {
            duration: Infinity,
            id: 'signup-loading'
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
          
          // Show success message
          const successToast = toast.success('🎉 Account created successfully! Redirecting to dashboard...', {
            duration: 3000,
            id: 'signup-success'
          });
          
          // Use the login action to update the store and save the token
          login(user, token);
          
          // Redirect based on the user's role after success toast completes
          setTimeout(() => {
            // Dismiss the success toast before navigation
            toast.dismiss(successToast);
            
            // Small delay to ensure toast is cleared
            setTimeout(() => {
              switch (user.role.toLowerCase()) {
                case 'fpo':
                case 'farmer':
                  navigate("/farmer");
                  break;
                case 'manufacturer':
                  navigate("/manufacturer");
                  break;
                case 'laboratory':
                case 'lab':
                  navigate("/labs");
                  break;
                case 'admin':
                  navigate("/admin-dashboard");
                  break;
                default:
                  console.error("Unknown role, cannot redirect.");
                  toast.error("❌ Unknown user role. Please contact support.", {
                      duration: 4000,
                      id: 'role-error'
                  });
                  break;
              }
            }, 100);
          }, 3000);

        } catch (error) {
          // Dismiss loading toast and reset loading state
          toast.dismiss(loadingToast);
          setLoading(false);
          
          console.error('Registration error:', error);
          
          // Handle specific error cases with proper duration
          let errorMessage = '❌ Registration failed. Please try again.';
          let errorDuration = 4000;
          
          if (error.message.includes('email')) {
            errorMessage = '📧 This email is already registered. Please try logging in instead.';
            errorDuration = 5000;
          } else if (error.message.includes('validation')) {
            errorMessage = '📝 Please check your form data and try again.';
            errorDuration = 4000;
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = '🌐 Network error. Please check your connection and try again.';
            errorDuration = 4000;
          }
          
          toast.error(errorMessage, {
            duration: errorDuration,
            id: 'signup-error'
          });
          
          // Reset form after error toast is shown (wait for toast to be displayed)
          setTimeout(() => {
            resetFormToStart();
          }, errorDuration + 500); // Wait for error toast to finish + small buffer
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <PersonalDetailsStep onNext={handleNext} shouldReset={shouldResetForm} />;
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
            <Toaster 
                position="top-right"
                containerClassName="z-50"
                containerStyle={{
                    zIndex: 9999,
                }}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1e293b',
                        color: '#f8fafc',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        fontSize: '14px',
                        maxWidth: '400px',
                    },
                    success: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#ffffff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#ffffff',
                        },
                    },
                    loading: {
                        duration: Infinity,
                    },
                }}
            />
            
            <div className="max-w-xl w-full mx-4">
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-lg p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Create an Account</h2>
                            <p className="text-sm text-slate-400 mt-1">{getStepTitle()} - Step {step} of 3</p>
                        </div>
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Waves className="h-6 w-6 text-[#34d399]" />
                        </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs text-slate-400">Progress</span>
                            <span className="text-xs text-slate-400">{Math.round((step / 3) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                                className="bg-[#34d399] h-2 rounded-full transition-all duration-300 ease-in-out" 
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