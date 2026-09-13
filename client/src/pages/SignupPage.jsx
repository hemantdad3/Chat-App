import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative selection:bg-indigo-500 selection:text-white">
      {/* Background glow accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <AuthForm mode="signup" />
      </div>
    </div>
  );
};

export default SignupPage;
