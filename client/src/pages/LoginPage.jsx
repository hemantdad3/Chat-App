import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 selection:bg-terracotta selection:text-white">
      <div className="w-full flex justify-center">
        <AuthForm mode="login" />
      </div>
    </div>
  );
};

export default LoginPage;
