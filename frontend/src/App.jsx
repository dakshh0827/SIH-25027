import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; // Import BrowserRouter, Routes, and Route
import { useAuthStore } from './stores/useAuthStore';
import LoginScreen from './pages/LoginScreen';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import NGODashboard from './pages/NGODashboard';
import Navigation from './components/common/Navigation'; // Updated to work with Router
import SignupForm from './components/auth/SignupForm';

const App = () => {
    const { userType } = useAuthStore();
    const navigate = useNavigate();

    // Use a redirect effect to automatically navigate to the correct dashboard after login
    // This replaces the manual setCurrentView logic
    React.useEffect(() => {
        if (userType === 'admin') {
            navigate('/admin-dashboard');
        } else if (userType === 'ngo') {
            navigate('/ngo-dashboard');
        }
    }, [userType, navigate]);

    return (
        <div className="min-h-screen">
            {/* Navigation component will handle its own routing internally */}
            {/* <Navigation />  */}

            {/* Define application routes */}
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/signup" element={<SignupForm />} />
                
                {/* Protected routes */}
                {userType === 'admin' && (
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                )}
                {userType === 'ngo' && (
                    <Route path="/ngo-dashboard" element={<NGODashboard />} />
                )}

                {/* You can add a 404 page for unmatched routes */}
                <Route path="*" element={<LandingPage />} /> 
            </Routes>
        </div>
    );
};

export default App;