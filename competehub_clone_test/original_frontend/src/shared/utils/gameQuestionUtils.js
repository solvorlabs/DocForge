/**
 * Game Question Fetching Utilities
 * Handles fetching and filtering questions for various game types
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch subjects available for a given exam type
 * @param {string} examType - 'JEE' or 'GATE'
 * @returns {Promise<Array>} - Array of subjects
 */
export async function fetchSubjects(examType = 'JEE') {
  try {
    const QuestionModel = examType.toUpperCase() === 'GATE' ? 'gatequestions' : 'jeequestions';
    const response = await axios.get(`${API_BASE_URL}/games/subjects`, {
      params: { examType }
    });
    return response.data.subjects || [];
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
}

/**
 * Fetch topics for Dragon Out game
 * @param {string} subject - Optional subject filter
 * @param {string} examType - 'JEE' or 'GATE'
 * @returns {Promise<Array>} - Array of topics with counts
 */
export async function fetchDragonTopics(subject = null, examType = 'JEE') {
  try {
    const response = await axios.get(`${API_BASE_URL}/games/dragon/topics`, {
      params: { subject, examType }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching dragon topics:', error);
    return [];
  }
}

/**
 * Start Dragon Out game with selected topics
 * @param {Array<string>} topics - Selected topics
 * @param {number} questionsPerTopic - Questions per topic (default 5)
 * @param {string} difficulty - Optional difficulty filter
 * @param {string} examType - 'JEE' or 'GATE'
 * @returns {Promise<Object>} - Questions grouped by topic
 */
export async function startDragonGame(topics, questionsPerTopic = 5, difficulty = null, examType = 'JEE') {
  try {
    const response = await axios.post(`${API_BASE_URL}/games/dragon/start`, {
      topics,
      questionsPerTopic,
      difficulty,
      examType
    });
    return response.data.data || {};
  } catch (error) {
    console.error('Error starting dragon game:', error);
    throw error;
  }
}

/**
 * Start Endless Runner game with MCQ questions
 * @param {Object} filters - Game filters
 * @returns {Promise<Array>} - Array of MCQ questions
 */
export async function startRunnerGame(filters = {}) {
  try {
    const {
      count = 20,
      subject = null,
      topic = null,
      difficulty = null,
      examType = 'JEE'
    } = filters;

    const response = await axios.post(`${API_BASE_URL}/games/runner/start`, {
      count,
      subject,
      topic,
      difficulty,
      examType
    });
    return response.data.data?.questions || [];
  } catch (error) {
    console.error('Error starting runner game:', error);
    throw error;
  }
}

/**
 * Fetch crossword questions
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} - Array of crossword questions
 */
export async function fetchCrosswordQuestions(params = {}) {
  try {
    const {
      size = 10,
      subject = null,
      difficulty = null,
      examType = 'JEE'
    } = params;

    const response = await axios.get(`${API_BASE_URL}/games/crossword/questions`, {
      params: { size, subject, difficulty, examType }
    });
    return response.data.data?.questions || [];
  } catch (error) {
    console.error('Error fetching crossword questions:', error);
    throw error;
  }
}

/**
 * Get crossword statistics
 * @param {string} examType - 'JEE' or 'GATE'
 * @returns {Promise<Object>} - Statistics about available questions
 */
export async function getCrosswordStats(examType = 'JEE') {
  try {
    const response = await axios.get(`${API_BASE_URL}/games/crossword/stats`, {
      params: { examType }
    });
    return response.data.data || {};
  } catch (error) {
    console.error('Error fetching crossword stats:', error);
    return { totalQuestions: 0, subjects: [] };
  }
}

/**
 * Save game result
 * @param {Object} gameData - Game result data
 * @returns {Promise<Object>} - Saved result
 */
export async function saveGameResult(gameData) {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/games/result`,
      gameData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.result;
  } catch (error) {
    console.error('Error saving game result:', error);
    throw error;
  }
}

/**
 * Get game history
 * @param {string} gameType - Optional game type filter
 * @param {Object} pagination - Page and limit
 * @returns {Promise<Object>} - Game history with pagination
 */
export async function getGameHistory(gameType = null, pagination = {}) {
  try {
    const token = localStorage.getItem('token');
    const { page = 1, limit = 20 } = pagination;
    
    const url = gameType 
      ? `${API_BASE_URL}/games/history/${gameType}`
      : `${API_BASE_URL}/games/history`;
    
    const response = await axios.get(url, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching game history:', error);
    return { results: [], pagination: {} };
  }
}

/**
 * Get leaderboard for a game type
 * @param {string} gameType - Game type
 * @param {number} limit - Number of entries
 * @returns {Promise<Array>} - Leaderboard entries
 */
export async function getLeaderboard(gameType, limit = 50) {
  try {
    const response = await axios.get(`${API_BASE_URL}/games/leaderboard/${gameType}`, {
      params: { limit }
    });
    return response.data.leaderboard || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Get user's best score for a game type
 * @param {string} gameType - Game type
 * @returns {Promise<Object>} - Best score data
 */
export async function getBestScore(gameType) {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/games/best-score/${gameType}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.bestScore || null;
  } catch (error) {
    console.error('Error fetching best score:', error);
    return null;
  }
}

export default {
  fetchSubjects,
  fetchDragonTopics,
  startDragonGame,
  startRunnerGame,
  fetchCrosswordQuestions,
  getCrosswordStats,
  saveGameResult,
  getGameHistory,
  getLeaderboard,
  getBestScore
};
