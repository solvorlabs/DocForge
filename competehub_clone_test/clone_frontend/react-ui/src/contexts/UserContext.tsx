import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, progressionApi, friendsApi } from '../lib/api';
import type { User, Friend, FriendRequest, Progression } from '../types';

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  loginAsGuest: () => void;
  register: (data: Record<string, unknown>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  getProfile: () => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<void>;
  checkUsername: (username: string) => Promise<{ available: boolean }>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  setAuthState: (user: User, token: string) => void;
  friends: Friend[];
  friendRequests: FriendRequest[];
  getFriends: () => Promise<void>;
  sendFriendRequest: (username: string) => Promise<void>;
  acceptFriendRequest: (fromUserId: string) => Promise<void>;
  declineFriendRequest: (fromUserId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<unknown[]>;
  progression: Progression | null;
  getProgression: () => Promise<void>;
}

const GUEST_USER: User = {
  _id: 'guest',
  username: 'Guest',
  email: '',
  avatar: '👤',
  level: 1,
  xp: 0,
  totalXP: 0,
  wins: 0,
  losses: 0,
  gamesPlayed: 0,
  isEmailVerified: false,
  createdAt: new Date().toISOString(),
  eloRating: 1200,
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (localStorage.getItem('guestMode') === 'true') return GUEST_USER;
    const stored = localStorage.getItem('userProfile');
    return stored ? JSON.parse(stored) : null;
  });
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('guestMode') === 'true');
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [progression, setProgression] = useState<Progression | null>(null);

  const isAuthenticated = isGuest || (!!user && !!localStorage.getItem('authToken'));

  const setAuthState = useCallback((userData: User, token: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userProfile', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const loginAsGuest = useCallback(() => {
    localStorage.setItem('guestMode', 'true');
    setIsGuest(true);
    setUser(GUEST_USER);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('guestMode');
    setUser(null);
    setIsGuest(false);
    setFriends([]);
    setFriendRequests([]);
    setProgression(null);
  }, []);

  const register = useCallback(async (data: Record<string, unknown>) => {
    await authApi.register(data);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password) as { token: string; user: User };
    setAuthState(res.user, res.token);
  }, [setAuthState]);

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    const res = await authApi.verifyEmail(email, otp) as { token: string; user: User };
    if (res.token) setAuthState(res.user, res.token);
  }, [setAuthState]);

  const resendOTP = useCallback(async (email: string) => {
    await authApi.resendOTP(email);
  }, []);

  const getProfile = useCallback(async () => {
    const res = await authApi.getProfile() as { user: User };
    setUser(res.user);
    localStorage.setItem('userProfile', JSON.stringify(res.user));
  }, []);

  const updateProfile = useCallback(async (data: Record<string, unknown>) => {
    await authApi.updateProfile(data);
    await getProfile();
  }, [getProfile]);

  const checkUsername = useCallback(async (username: string) => {
    return authApi.checkUsername(username) as Promise<{ available: boolean }>;
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await authApi.forgotPassword(email);
  }, []);

  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string) => {
    await authApi.resetPassword(email, otp, newPassword);
  }, []);

  const getFriends = useCallback(async () => {
    const res = await friendsApi.getFriends() as { friends: Friend[]; requests: FriendRequest[] };
    setFriends(res.friends || []);
    setFriendRequests(res.requests || []);
  }, []);

  const sendFriendRequest = useCallback(async (username: string) => {
    await friendsApi.sendRequest(username);
  }, []);

  const acceptFriendRequest = useCallback(async (fromUserId: string) => {
    await friendsApi.acceptRequest(fromUserId);
    await getFriends();
  }, [getFriends]);

  const declineFriendRequest = useCallback(async (fromUserId: string) => {
    await friendsApi.declineRequest(fromUserId);
    await getFriends();
  }, [getFriends]);

  const removeFriend = useCallback(async (friendId: string) => {
    await friendsApi.removeFriend(friendId);
    await getFriends();
  }, [getFriends]);

  const searchUsers = useCallback(async (query: string) => {
    const res = await friendsApi.searchUsers(query) as { users: unknown[] };
    return res.users || [];
  }, []);

  const getProgression = useCallback(async () => {
    const res = await progressionApi.getProgression() as Progression;
    setProgression(res);
  }, []);

  // Initial auth check
  useEffect(() => {
    if (isGuest) {
      setIsLoading(false);
      return;
    }
    const token = localStorage.getItem('authToken');
    if (token && !user) {
      getProfile().catch(() => {
        logout();
      }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{
      user, isAuthenticated, isGuest, isLoading,
      loginAsGuest, register, login, logout, verifyEmail, resendOTP,
      getProfile, updateProfile, checkUsername,
      forgotPassword, resetPassword, setAuthState,
      friends, friendRequests, getFriends,
      sendFriendRequest, acceptFriendRequest,
      declineFriendRequest, removeFriend, searchUsers,
      progression, getProgression,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}
