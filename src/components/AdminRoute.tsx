import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('AdminRoute check:', {
      isAuthenticated: !!currentUser,
      userEmail: currentUser?.email,
      isAdmin: currentUser?.is_admin,
      loading
    });
  }, [currentUser, loading]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser || !currentUser.is_admin) {
    console.log('Admin access denied:', {
      isAuthenticated: !!currentUser,
      userEmail: currentUser?.email,
      isAdmin: currentUser?.is_admin
    });
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
