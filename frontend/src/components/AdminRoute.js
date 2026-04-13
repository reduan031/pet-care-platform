import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
};

export default AdminRoute;
