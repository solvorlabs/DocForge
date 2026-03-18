// features/auth/hooks/useAuth.js
import { useUser } from '../../../app/providers/UserContext';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    verifyEmail,
    resendOTP,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    checkUsername
  } = useUser();

  // For compatibility with existing game pages
  const isLoggedIn = isAuthenticated;

  return {
    user,
    isLoggedIn,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    verifyEmail,
    resendOTP,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    checkUsername
  };
};