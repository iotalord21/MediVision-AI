import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 transition-colors duration-300">
        <Activity className="w-12 h-12 text-cyan-500 dark:text-cyan-400 animate-spin mb-4" />
        <p className="text-sm font-medium tracking-wide text-cyan-600 dark:text-cyan-200 animate-pulse">
          Authenticating MediVision AI...
        </p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
