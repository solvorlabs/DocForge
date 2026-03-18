/**
 * Games API Service
 * Handles API calls for Dragon Out, Runner, and Crossword games
 */


// This file is used by new games (crossword, dragon out, endless runner) 
// So if any other developer (Aman) sees this, FUCK YOU

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
// const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/games`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Games API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Games API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`Games API Response: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('Games API Response Error:', error.response?.data || error.message);
    throw error;
  }
);

class GamesAPIService {
  
  /**
   * Start Dragon Out game with selected topics
   */
  async startDragonOut(topics, questionsPerTopic = 5, examType = 'JEE') {
    try {
      const response = await api.post('/dragon/start', {
        topics,
        questionsPerTopic,
        examType
      });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to start Dragon Out: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Start Endless Runner game
   */
  async startRunner(filters = {}) {
    try {
      const response = await api.post('/runner/start', {
        subject: filters.subject,
        topic: filters.topic,
        difficulty: filters.difficulty,
        count: filters.count || 20,
        examType: filters.examType || 'JEE'
      });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to start Runner: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get Crossword questions
   */
  async getCrosswordQuestions(filters = {}) {
    try {
      const response = await api.get('/crossword/questions', {
        params: {
          size: filters.size || 10,
          subject: filters.subject,
          difficulty: filters.difficulty,
          examType: filters.examType || 'JEE'
        }
      });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get crossword questions: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get Crossword statistics
   */
  async getCrosswordStats(examType = 'JEE') {
    try {
      const response = await api.get('/crossword/stats', {
        params: { examType }
      });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get crossword stats: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Validate answer for any game
   */
  async validateAnswer(userAnswer, correctAnswer, questionType) {
    try {
      const response = await api.post('/validate-answer', {
        userAnswer,
        correctAnswer,
        questionType
      });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to validate answer: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Save game result for leaderboard tracking
   */
  async saveGameResult(resultData) {
    try {
      const response = await api.post('/result', resultData);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to save game result: ${error.response?.data?.message || error.message}`);
    }
  }
}

const gamesAPIService = new GamesAPIService();
export default gamesAPIService;
