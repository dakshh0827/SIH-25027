import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import LoginScreen from './pages/LoginScreen';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import LabsDashboard from './pages/LabsDashboard';
import Navigation from './components/common/Navigation';
import SignupForm from './components/auth/SignupForm';

const App = () => {
    const { userType } = useAuthStore();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (userType === 'admin') {
            navigate('/admin-dashboard');
        } else if (userType === 'farmer') {
            navigate('/farmer');
        } else if (userType === 'manufacturer') {
            navigate('/manufacturer');
        } else if (userType === 'lab') {
            navigate('/labs');
        }
    }, [userType, navigate]);

    return (
        <div className="min-h-screen">
            <Routes>
                {/* Public routes that are always accessible */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/signup" element={<SignupForm />} />
                
                {/* Protected routes are now defined first */}
                {userType === 'admin' && (
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                )}
                
                {userType === 'farmer' && (
                    <Route path="/farmer" element={<FarmerDashboard />} />
                )}
                {userType === 'manufacturer' && (
                    <Route path="/manufacturer" element={<ManufacturerDashboard />} />
                )}
                {userType === 'lab' && (
                    <Route path="/labs" element={<LabsDashboard />} />
                )}

                {/* The catch-all route should be the last one in the list */}
                {/* It will only render if no other routes match */}
                <Route path="*" element={<LandingPage />} />
            </Routes>
        </div>
    );
};

export default App;