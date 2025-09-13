import React, { useState } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import LoginScreen from './pages/LoginScreen';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import NGODashboard from './pages/NGODashboard';
import Navigation from './components/common/Navigation';
import SignupForm from './components/auth/SignupForm';

const App = () => {
  const { userType } = useAuthStore();
  const [currentView, setCurrentView] = useState('public');

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <LoginScreen setCurrentView={setCurrentView} />;
      case 'signup':
        return <SignupForm setCurrentView={setCurrentView} />;
      case 'public':
        return <LandingPage />;
      case 'admin':
        return <AdminDashboard />;
      case 'ngo':
        return <NGODashboard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
      {renderView()}
    </div>
  );
};

export default App;