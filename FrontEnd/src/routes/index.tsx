import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Pages
import Landing from '../pages/Landing';
import MaterialUpload from '../pages/MaterialUpload';
import MyMaterials from '../pages/MyMaterials';
import Profile from '../pages/Profile';
import Wallet from '../pages/Wallet';
import LoginForm from '../components/web2/LoginForm';
import RegisterForm from '../components/web2/RegisterForm';
import DashboardRouter from '../pages/dashboard/DashboardRouter';

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

  // Determine the user's home route based on their role
  const homeRoute = () => {
    switch (user?.role) {
      case 'branch': return '/branch';
      case 'admin': return '/admin';
      default: return '/home';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 min-h-[calc(100vh-64px)]">
          <Routes>
            <Route path="/" element={<Navigate to={homeRoute()} replace />} />
            <Route path="/home" element={<DashboardRouter />} />
            <Route path="/branch" element={<DashboardRouter />} />
            <Route path="/admin/*" element={<DashboardRouter />} />
            <Route path="/materials/upload" element={<MaterialUpload />} />
            <Route path="/materials" element={<MyMaterials />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Navigate to={homeRoute()} replace />} />
            <Route path="/register" element={<Navigate to={homeRoute()} replace />} />
            <Route path="*" element={<Navigate to={homeRoute()} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AppRoutes;