// File: src/components/Auth/SignupForm.jsx

import React, { useState } from "react";
import { Waves } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import toast, { Toaster } from "react-hot-toast";
import PersonalDetailsStep from "./PersonalDetailsStep";
import RoleSelectionStep from "./RoleSelectionStep";
import AdminDetailsStep from "./AdminDetailsStep"; // Import the new step
import OrganizationDetailsStep from "./OrganizationDetailsStep";

const SignupForm = () => {
  const { login, setLoading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Cleaned up state to remove legacy fields
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    idProofImage: null, // For admin file upload
    // Organization fields
    fpoName: "",
    regNumber: "",
    pan: "",
    gstin: "",
    registeredAddress: "",
    authorizedRepresentative: "",
    manufacturerName: "",
    ayushLicenseNumber: "",
    labName: "",
    nablAccreditationNumber: "",
    scopeOfNablAccreditation: "",
  });

  // ... (navigate and useAuthStore hooks remain the same)

  const handleNext = (newData) => {
    const updatedData = { ...formData, ...newData };
    setFormData(updatedData);

    // Key Fix: Corrected step logic
    if (step === 1) {
      // After personal details
      setStep(2);
    } else if (step === 2) {
      // After role selection
      if (updatedData.role === "admin" || updatedData.role === "user") {
        setStep(3); // Always go to step 3
      }
    } else if (step === 3) {
      // After role-specific details
      handleSubmit(updatedData); // Submit the form
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (finalData) => {
    const loadingToast = toast.loading("Creating your account...");
    setLoading(true);

    // Key Fix: Use FormData for file uploads, otherwise use JSON
    let body;
    const headers = {};

    if (finalData.idProofImage) {
      // Admin signup with file
      body = new FormData();
      body.append("fullName", finalData.name);
      body.append("email", finalData.email);
      body.append("password", finalData.password);
      body.append("role", "admin"); // Role is explicitly admin
      body.append("file", finalData.idProofImage); // The key 'file' must match multer on backend
    } else {
      // Organization signup
      body = JSON.stringify({
        fullName: finalData.name,
        email: finalData.email,
        password: finalData.password,
        role: finalData.role, // This will be 'farmer', 'lab', etc.
        ...finalData,
      });
      headers["Content-Type"] = "application/json";
    }

    try {
      const res = await fetch(
        "https://ayurtrace.onrender.com/api/auth/register",
        {
          method: "POST",
          headers, // Headers will be empty for FormData, letting browser set it
          body,
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }

      const { token, user } = await res.json();
      toast.dismiss(loadingToast);
      toast.success("Account created! Redirecting...", { duration: 3000 });
      login(user, token);

      // Redirect logic remains the same...
      // In the handleSubmit function, replace the commented section with:
      setTimeout(() => {
        switch (finalData.role) {
          case "admin":
            navigate("/admin"); // or wherever your admin dashboard is
            break;
          case "farmer":
          case "fpo":
            navigate("/fpo");
            break;
          case "manufacturer":
            navigate("/manufacturer");
            break;
          case "lab":
          case "laboratory":
            navigate("/laboratory");
            break;
          case "user": // If 'user' maps to organization users
            navigate("/organization/dashboard");
            break;
          default:
            navigate("/"); // Generic dashboard or landing page
        }
      }, 3000);
    } catch (error) {
      toast.dismiss(loadingToast);
      setLoading(false);
      toast.error(error.message || "Registration failed.");
      // Optionally reset to step 1
      // setStep(1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <PersonalDetailsStep onNext={handleNext} />;
      case 2:
        // Key Fix: `onSelectRole` now passes the role to `handleNext`
        return (
          <RoleSelectionStep
            onSelectRole={(role) => handleNext({ role })}
            onBack={handleBack}
          />
        );
      case 3:
        // Key Fix: Render the correct component based on the role selected in step 2
        if (formData.role === "admin") {
          return <AdminDetailsStep onNext={handleNext} onBack={handleBack} />;
        }
        if (formData.role === "user") {
          return (
            <OrganizationDetailsStep
              formData={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          );
        }
        return null; // Should not happen
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Personal Information";
      case 2:
        return "Role Selection";
      case 3:
        return "Organization Details";
      default:
        return "Sign Up";
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
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid #475569",
            borderRadius: "0px", // Changed from '8px' to '0px'
            fontSize: "14px",
            maxWidth: "400px",
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
          loading: {
            duration: Infinity,
          },
        }}
      />

      <div className="max-w-xl w-full mx-4">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-8 shadow-2xl">
          {" "}
          {/* Removed rounded-lg */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Create an Account
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {getStepTitle()} - Step {step} of 3
              </p>
            </div>
            <div className="p-2 bg-blue-500/20">
              {" "}
              {/* Removed rounded-lg */}
              <Waves className="h-6 w-6 text-[#34d399]" />
            </div>
          </div>
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-slate-400">Progress</span>
              <span className="text-xs text-slate-400">
                {Math.round((step / 3) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-700 h-2">
              {" "}
              {/* Removed rounded-full */}
              <div
                className="bg-[#34d399] h-2 transition-all duration-300 ease-in-out" // Removed rounded-full
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
