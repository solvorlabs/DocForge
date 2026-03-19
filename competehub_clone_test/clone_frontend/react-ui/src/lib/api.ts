import { API_BASE } from './constants';

function getToken(): string | null {
  return localStorage.getItem('authToken');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    window.location.href = '/auth';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }

  return res.json();
}

// Auth endpoints
export const authApi = {
  register: (data: Record<string, unknown>) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (email: string, password: string) =>
    request<{ token: string; user: unknown }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  verifyEmail: (email: string, otp: string) =>
    request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resendOTP: (email: string) =>
    request('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  getProfile: () => request<{ user: unknown }>('/auth/profile'),
  updateProfile: (data: Record<string, unknown>) =>
    request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  checkUsername: (username: string) =>
    request(`/auth/check-username?username=${username}`),
  forgotPassword: (email: string) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (email: string, otp: string, newPassword: string) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    }),
};

// Game endpoints
export const gameApi = {
  getQuestions: (gameType: string, settings?: Record<string, unknown>) =>
    request('/games/questions', {
      method: 'POST',
      body: JSON.stringify({ gameType, ...settings }),
    }),
  saveResult: (gameType: string, result: Record<string, unknown>) =>
    request('/games/result', {
      method: 'POST',
      body: JSON.stringify({ gameType, ...result }),
    }),
  getHistory: (gameType: string, limit = 10, page = 1) =>
    request(`/games/history?gameType=${gameType}&limit=${limit}&page=${page}`),
  getLeaderboard: (gameType: string, limit = 20) =>
    request(`/games/leaderboard?gameType=${gameType}&limit=${limit}`),
  getBestScore: (gameType: string) =>
    request(`/games/best-score?gameType=${gameType}`),
};

// Progression endpoints
export const progressionApi = {
  getProgression: () => request('/progression'),
  addXP: (amount: number, source: string) =>
    request('/progression/xp', { method: 'POST', body: JSON.stringify({ amount, source }) }),
  getLeaderboard: (type: string, limit = 20) =>
    request(`/progression/leaderboard?type=${type}&limit=${limit}`),
};

// Friends endpoints
export const friendsApi = {
  getFriends: () => request('/friends'),
  sendRequest: (username: string) =>
    request('/friends/request', { method: 'POST', body: JSON.stringify({ username }) }),
  acceptRequest: (fromUserId: string) =>
    request(`/friends/accept/${fromUserId}`, { method: 'POST' }),
  declineRequest: (fromUserId: string) =>
    request(`/friends/decline/${fromUserId}`, { method: 'POST' }),
  removeFriend: (friendId: string) =>
    request(`/friends/${friendId}`, { method: 'DELETE' }),
  searchUsers: (query: string, limit = 10) =>
    request(`/friends/search?q=${encodeURIComponent(query)}&limit=${limit}`),
};

// Question bank endpoints
export const questionBankApi = {
  getFilters: (params?: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return request(`/exam-questions/filters${q ? `?${q}` : ''}`);
  },
  search: (params: Record<string, string | number>) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    ).toString();
    return request(`/exam-questions/search?${q}`);
  },
  getById: (id: string) => request(`/exam-questions/${id}`),
};

// Ranked endpoints
export const rankedApi = {
  getProfile: () => request('/ranked/profile'),
  getHistory: (limit = 20, page = 1) =>
    request(`/ranked/history?limit=${limit}&page=${page}`),
  getLeaderboard: (limit = 50) => request(`/ranked/leaderboard?limit=${limit}`),
};
