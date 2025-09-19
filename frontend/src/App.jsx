import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/useAuthStore';
import LoginScreen from './pages/LoginScreen';
import LandingPage from './pages/LandingPage';
// import AdminDashboard from './pages/AdminDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import LabsDashboard from './pages/LabsDashboard';
import Navigation from './components/common/Navigation';
import SignupForm from './components/auth/SignupForm';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
    const { userType } = useAuthStore();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (userType === 'admin') {
            navigate('/admin');
        } else if (userType === 'farmer') {
            navigate('/farmer');
        } else if (userType === 'manufacturer') {
            navigate('/manufacturer');
        } else if (userType === 'lab') {
            navigate('/labs');
        }
    }, [userType, navigate]);

    return (
        <>
            {/* Add Toaster once at the root level */}
            <Toaster 
                position="top-right" 
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                    duration: 4000, // Default 4 seconds for all toasts
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid #334155',
                    },
                    success: {
                        duration: 3000, // Success toasts disappear after 3 seconds
                        style: {
                            background: '#10b981',
                            color: '#fff',
                        },
                    },
                    error: {
                        duration: 5000, // Error toasts disappear after 5 seconds
                        style: {
                            background: '#ef4444',
                            color: '#fff',
                        },
                    },
                    // ADD THIS: Configure loading toasts
                    loading: {
                        duration: Infinity, // Loading toasts stay until manually dismissed
                        style: {
                            background: '#1e293b',
                            color: '#fff',
                            border: '1px solid #334155',
                        },
                    },
                    // ADD THIS: Configure custom/info toasts
                    blank: {
                        duration: 3000, // Info/blank toasts disappear after 3 seconds
                        style: {
                            background: '#1e293b',
                            color: '#fff',
                            border: '1px solid #334155',
                        },
                    },
                }}
            />
            <div className="min-h-screen bg-slate-950">
                <Routes>
                    {/* Public routes that are always accessible */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginScreen />} />
                    <Route path="/signup" element={<SignupForm />} />
                    
                    {/* Protected routes are now defined first */}
                    {/* {userType === 'admin' && (
                        // <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    )} */}
                    
                    {userType === 'farmer' && (
                        <Route path="/farmer" element={<FarmerDashboard />} />
                    )}
                    {userType === 'manufacturer' && (
                        <Route path="/manufacturer" element={<ManufacturerDashboard />} />
                    )}
                    {userType === 'lab' && (
                        <Route path="/labs" element={<LabsDashboard />} />
                    )}
                    {userType === 'admin' && (
                        <Route path="/admin" element={<AdminDashboard />} />
                    )}

                    {/* The catch-all route should be the last one in the list */}
                    {/* It will only render if no other routes match */}
                    <Route path="*" element={<LandingPage />} />
                </Routes>
            </div>
        </>
    );
};

export default App;
