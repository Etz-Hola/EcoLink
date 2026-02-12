import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Pages
import Landing from '../pages/Landing';
import Home from '../pages/Home';
import MaterialUpload from '../pages/MaterialUpload';
import CollectorDashboard from '../pages/CollectorDashboard';
import Profile from '../pages/Profile';
import LoginForm from '../components/web2/LoginForm';
import RegisterForm from '../components/web2/RegisterForm';
import BranchDashboard from '../pages/BranchDashboard';

// Layout Components
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/materials/upload" element={<MaterialUpload />} />
            <Route path="/materials" element={<CollectorDashboard />} />
            <Route path="/branch" element={<BranchDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Navigate to="/home" replace />} />
            <Route path="/register" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AppRoutes;