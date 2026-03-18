/**
 * API Service for Quiz Application
 * Handles all API communications with the backend
 */


// This file is used by new games (crossword, dragon out, endless runner) 
// So if any other developer (Aman) sees this, FUCK YOU

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
// const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Resource not found. Please try again.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    }
    
    throw error;
  }
);

class QuizService {
  
  /**
   * Get available universities
   */
  async getUniversities() {
    try {
      const response = await api.get('/exam-questions/universities');
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch universities: ${error.message}`);
    }
  }

  /**
   * Get university syllabus
   */
  async getUniversitySyllabus(code) {
    try {
      const response = await api.get(`/exam-questions/university/${code}/syllabus`);
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch syllabus: ${error.message}`);
    }
  }

  /**
   * Get available subjects
   */
  async getSubjects(examType = 'JEE') {
    try {
      const response = await api.get('/quiz/subjects', {
        params: { examType }
      });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch subjects: ${error.message}`);
    }
  }

  /**
   * Get topics for a subject
   */
  async getTopics(subject = null, examType = 'JEE') {
    try {
      const params = { examType };
      if (subject) params.subject = subject;
      const response = await api.get('/quiz/topics', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch topics: ${error.message}`);
    }
  }

  /**
   * Generate a new quiz
   */
  async generateQuiz(options = {}) {
    try {
      const response = await api.post('/quiz/generate', options);
      return response.data.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(`Failed to generate quiz: ${error.message}`);
    }
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(quizId, answers) {
    try {
      const response = await api.post('/quiz/submit', {
        quizId,
        answers
      });
      return response.data.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(`Failed to submit quiz: ${error.message}`);
    }
  }

  /**
   * Get quiz statistics
   */
  async getStats(examType = 'JEE') {
    try {
      const response = await api.get('/quiz/stats', {
        params: { examType }
      });
      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await api.get('/quiz/health');
      return response.data.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }
}

const quizService = new QuizService();
export default quizService;