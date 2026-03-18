// context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasCheckedAuth = useRef(false);

  // API base URL - use useRef to keep it stable
  const API_BASE = useRef(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000/api').current;

  // Get token from localStorage - memoized
  const getToken = React.useCallback(() => {
    return localStorage.getItem('authToken');
  }, []);

  // Set token in localStorage - memoized
  const setToken = React.useCallback((token) => {
    localStorage.setItem('authToken', token);
  }, []);

  // Set authentication state directly (useful for OAuth callbacks) - memoized
  const setAuthState = React.useCallback((user, token) => {
    if (token) {
      setToken(token);
    }
    if (user) {
      setUser(user);
      setIsAuthenticated(true);
      // Store profile data including userId for ranked functionality
      localStorage.setItem('profile', JSON.stringify({ 
        username: user.username,
        userId: user.id,
        email: user.email,
        avatar: user.avatar
      }));
    } else if (token && !user) {
      // If only token is provided, set authentication to true 
      // (user data will be fetched subsequently)
      setIsAuthenticated(true);
    }
  }, [setToken]);

  // Remove token from localStorage - memoized
  const removeToken = React.useCallback(() => {
    localStorage.removeItem('authToken');
  }, []);

  // Logout function - needs to be defined early for use in apiRequest
  const logout = React.useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    removeToken();
    localStorage.removeItem('profile');
  }, [removeToken]);

  // Make authenticated API request - memoized
  const apiRequest = React.useCallback(async (url, options = {}) => {
    const token = getToken();
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE}${url}`, config);
    const data = await response.json();
    if (response.status === 401 && data.needsVerification == false) {
      // Token expired or invalid
      logout();
      throw new Error('Authentication required');
    }
    // console.log('response', data); // Removed to reduce console spam
    if (!response.ok || data.needsVerification == true) {
      // Create enhanced error with response data
      const error = new Error(data.message || 'Request failed');
      if (data.needsVerification) {
        error.needsVerification = true;
      }
      if (data.email) {
        error.email = data.email;
      }
      throw error;
    }

    // Return the already-parsed data instead of calling response.json() again
    return data;
  }, [API_BASE, getToken, logout]);

  // Register user
  const register = async (userData) => {
    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      console.error('Register error:', error);
      // Re-throw the error so it can be handled by the calling component
      throw error;
    }
  };

  // Verify email with OTP
  const verifyEmail = async (email, otp) => {
    try {
      const response = await apiRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      
      if (response.token) {
        setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        // Store profile data including userId for ranked functionality
        localStorage.setItem('profile', JSON.stringify({ 
          username: response.user.username,
          userId: response.user.id,
          email: response.user.email,
          avatar: response.user.avatar
        }));
      }
      
      return response;
    } catch (error) {
      console.error('Verify email error:', error);
      // Re-throw the error so it can be handled by the calling component
      throw error;
    }
  };

  // Resend OTP - memoized
  const resendOTP = React.useCallback(async (email) => {
    try {
      const response = await apiRequest('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return response;
    } catch (error) {
      console.error('Resend OTP error:', error);
      // Re-throw the error so it can be handled by the calling component
      throw error;
    }
  }, [apiRequest]);

  // Login user
  const login = async (email, password) => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.token) {
        setToken(response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        // Store profile data including userId for ranked functionality
        localStorage.setItem('profile', JSON.stringify({ 
          username: response.user.username,
          userId: response.user.id,
          email: response.user.email,
          avatar: response.user.avatar
        }));
      }
      
      return response;
    } catch (error) {
      // If error contains needsVerification, rethrow with extra info for UI
      if (error.needsVerification) {
        const enhancedError = new Error(error.message || 'Please verify your email before logging in');
        enhancedError.needsVerification = true;
        if (error.email) enhancedError.email = error.email;
        throw enhancedError;
      }
    throw error;
    }
  };

  // Logout user
  // const logout = () => {
  //   removeToken();
  //   setUser(null);
  //   setIsAuthenticated(false);
  // };

  // Get user profile - memoized
  const getProfile = React.useCallback(async () => {
    try {
      const response = await apiRequest('/auth/profile');
      setUser(response.user);
      // Ensure authentication state is set when profile is successfully retrieved
      if (response.user && getToken()) {
        setIsAuthenticated(true);
      }
      return response.user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [apiRequest, getToken]);

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      if (response.user) {
        setUser(prev => ({ ...prev, ...response.user }));
      }
      
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      // Re-throw the error so it can be handled by the calling component
      throw error;
    }
  };

  // Check username availability
  const checkUsername = async (username) => {
    try {
      const response = await apiRequest(`/auth/check-username/${username}`);
      return response;
    } catch (error) {
      console.error('Check username error:', error);
      // Re-throw the error so it can be handled by the calling component
      throw error;
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // Progression methods
  const addXP = async (amount, source) => {
    try {
      const response = await apiRequest('/progression/add-xp', {
        method: 'POST',
        body: JSON.stringify({ amount, source }),
      });
      
      if (response.leveledUp && user) {
        setUser(prev => ({
          ...prev,
          level: response.level,
          rank: response.rank,
          xp: response.xp,
          currentLevelXP: response.currentLevelXP,
          nextLevelXP: response.nextLevelXP
        }));
      }
      
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const updateHighScore = async (scoreData) => {
    try {
      const response = await apiRequest('/progression/update-high-score', {
        method: 'POST',
        body: JSON.stringify(scoreData),
      });
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const updateStats = async (statsData) => {
    try {
      const response = await apiRequest('/progression/update-stats', {
        method: 'POST',
        body: JSON.stringify(statsData),
      });
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const getProgression = async () => {
    try {
      const response = await apiRequest('/progression/progression');
      return response.progression;
    } catch (error) {
      console.error(error);
    }
  };

  const getLeaderboard = async (type = 'level', limit = 50) => {
    try {
      const response = await apiRequest(`/progression/leaderboard?type=${type}&limit=${limit}`);
      return response.leaderboard;
    } catch (error) {
      console.error(error);
    }
  };

  const addAchievement = async (achievementData) => {
    try {
      const response = await apiRequest('/progression/add-achievement', {
        method: 'POST',
        body: JSON.stringify(achievementData),
      });
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  // Friends methods
  const sendFriendRequest = async (username) => {
    try {
      const response = await apiRequest('/friends/send-request', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const acceptFriendRequest = async (fromUserId) => {
    try {
      const response = await apiRequest('/friends/accept-request', {
        method: 'POST',
        body: JSON.stringify({ fromUserId }),
      });
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const declineFriendRequest = async (fromUserId) => {
    try {
      const response = await apiRequest('/friends/decline-request', {
        method: 'POST',
        body: JSON.stringify({ fromUserId }),
      });
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      const response = await apiRequest(`/friends/remove/${friendId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const getFriendsList = async () => {
    try {
      const response = await apiRequest('/friends/list');
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  const searchUsers = async (query, limit = 20) => {
    try {
      const response = await apiRequest(`/friends/search?query=${encodeURIComponent(query)}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  // Game methods
  const fetchGameQuestions = async (gameType, settings = {}) => {
    try {
      const response = await apiRequest('/games/questions', {
        method: 'POST',
        body: JSON.stringify({ gameType, settings }),
      });
      return response.questions || [];
    } catch (error) {
      throw error;
    }
  };

  const saveGameResult = async (gameType, result) => {
    try {
      const response = await apiRequest('/games/result', {
        method: 'POST',
        body: JSON.stringify({
          gameType,
          ...result,
          timestamp: new Date().toISOString()
        }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const getGameHistory = async (gameType = null, limit = 20, page = 1) => {
    try {
      const url = gameType 
        ? `/games/history/${gameType}?limit=${limit}&page=${page}`
        : `/games/history?limit=${limit}&page=${page}`;
      const response = await apiRequest(url);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const getGameLeaderboard = async (gameType, limit = 50) => {
    try {
      const response = await apiRequest(`/games/leaderboard/${gameType}?limit=${limit}`);
      return response.leaderboard;
    } catch (error) {
      throw error;
    }
  };

  const getBestScore = async (gameType) => {
    try {
      const response = await apiRequest(`/games/best-score/${gameType}`);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Check authentication status on app load - only once
  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple auth checks
      if (hasCheckedAuth.current) {
        setIsLoading(false);
        return;
      }
      
      hasCheckedAuth.current = true;
      
      const token = getToken();
      if (token) {
        try {
          const profile = await getProfile();
          if (profile) {
            setIsAuthenticated(true);
            console.log('Authentication check successful, user profile:', profile);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [getToken, getProfile, logout]);

  const value = {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Auth methods
    register,
    verifyEmail,
    resendOTP,
    login,
    logout,
    getProfile,
    updateProfile,
    checkUsername,
    forgotPassword,
    resetPassword,
    setAuthState,
    
    // Progression methods
    addXP,
    updateHighScore,
    updateStats,
    getProgression,
    getLeaderboard,
    addAchievement,
    
    // Friends methods
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    getFriendsList,
    searchUsers,
    
    // Game methods
    fetchGameQuestions,
    saveGameResult,
    getGameHistory,
    getGameLeaderboard,
    getBestScore,
    
    // Utility methods
    apiRequest,
    getToken,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
