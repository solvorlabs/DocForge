// shared/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../../app/providers/UserContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * ProtectedRoute - Wrapper component for routes requiring authentication
 * Redirects unauthenticated users to login while preserving intended destination
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to auth page, preserving the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
