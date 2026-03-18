// hooks/useGames.js
import { useUser } from '../../../app/providers/UserContext';

export const useGames = () => {
  const {
    fetchGameQuestions: contextFetchGameQuestions,
    saveGameResult: contextSaveGameResult,
    getGameHistory,
    getGameLeaderboard,
    getBestScore,
    apiRequest,
    isAuthenticated,
    user
  } = useUser();

  const fetchGameQuestions = async (gameType, settings = {}) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to fetch game questions');
    }
    return await contextFetchGameQuestions(gameType, settings);
  };

  const saveGameResult = async (gameType, result) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to save game results');
    }
    return await contextSaveGameResult(gameType, result);
  };

  // Fetch equations for EquationBuilder
  const fetchEquations = async (settings = {}) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to fetch equations');
    }
    const { count = 20, subjects = [], difficulty = 'intermediate' } = settings;
    const queryParams = new URLSearchParams();
    
    if (count) queryParams.append('count', count);
    if (subjects.length > 0) queryParams.append('subjects', subjects.join(','));
    if (difficulty) queryParams.append('difficulty', difficulty);

    return await apiRequest(`/games/equation-builder?${queryParams.toString()}`);
  };

  // Fetch boss mode data
  const fetchBossModeData = async (settings = {}) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to fetch boss mode data');
    }
    const { level = 1, subjects = [] } = settings;
    const queryParams = new URLSearchParams();
    
    queryParams.append('level', level);
    if (subjects.length > 0) queryParams.append('subjects', subjects.join(','));

    return await apiRequest(`/games/boss-mode?${queryParams.toString()}`);
  };

  // Fetch numerical speed race questions
  const fetchNumericalQuestions = async (settings = {}) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to fetch numerical questions');
    }
    const { 
      count = 50, 
      subjects = ['Mathematics', 'Physics'], 
      difficultyRange = { min: 2, max: 9 },
      timePerQuestion = 30
    } = settings;
    
    const queryParams = new URLSearchParams();
    queryParams.append('count', count);
    queryParams.append('subjects', subjects.join(','));
    queryParams.append('difficultyRange', JSON.stringify(difficultyRange));
    queryParams.append('timePerQuestion', timePerQuestion);

    return await apiRequest(`/games/numerical-speed-race?${queryParams.toString()}`);
  };

  return {
    fetchGameQuestions,
    saveGameResult,
    fetchEquations,
    fetchBossModeData,
    fetchNumericalQuestions,
    getGameHistory,
    getGameLeaderboard,
    getBestScore,
    isAuthenticated,
    user
  };
};
