// hooks/useStats.js
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// Configure axios base URL
const API_BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

export const useStats = () => {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]); // <-- Add this
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetchedStats = useRef(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};

      // Fetch user stats, leaderboard, and top players
      const [
        statsResponse,
        leaderboardResponse,
        // topPlayersResponse
      ] = await Promise.all([
        axios.get('/stats/user', config),
        // axios.get('/stats/leaderboard/duel1v1'),
        axios.get('/leaderboard/ranked?page=1&limit=10') // <-- Fetch top 10 ranked players
      ]);

      setStats(statsResponse.data.data);
      // setLeaderboard(leaderboardResponse.data.data);
      setLeaderboard(leaderboardResponse.data.data.leaderboard || []); // <-- Set top players
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stats');
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGameResult = useCallback(async (gameData) => {
    try {
      const token = localStorage.getItem('authToken');

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.post('/stats/update-game-result', gameData, config);

      // Refresh stats after update
      await fetchStats();

      return response.data;
    } catch (err) {
      console.error('Error updating game result:', err);
      throw err;
    }
  }, [fetchStats]);

  const updateSoloScore = useCallback(async (gameMode, score, questionsCount, timeSpent, subject, examType) => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        // Allow anonymous users to play but don't save score
        console.log('Anonymous user - score not saved');
        return {
          success: true,
          anonymous: true,
          message: 'Score not saved - login to track your progress!'
        };
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.post('/leaderboard/update-solo-score', {
        gameMode,
        score,
        questionsCount,
        timeSpent,
        subject,
        examType
      }, config);

      // Refresh stats after update
      await fetchStats();

      return response.data;
    } catch (err) {
      console.error('Error updating solo score:', err);
      throw err;
    }
  }, [fetchStats]);

  const processLoginReward = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) return null;

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios.post('/progression/daily-login', {}, config);
      return response.data;
    } catch (err) {
      console.error('Error processing login reward:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    // Only fetch stats once on mount
    if (!hasFetchedStats.current) {
      hasFetchedStats.current = true;
      fetchStats();
    }
  }, [fetchStats]);

  return {
    stats,
    leaderboard,
    topPlayers, // <-- Expose topPlayers
    loading,
    error,
    refetch: fetchStats,
    updateGameResult,
    updateSoloScore,
    processLoginReward
  };
};