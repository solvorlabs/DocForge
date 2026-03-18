// src/app/providers/GameContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useNavigate } from 'react-router-dom';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const { socket, connected } = useSocket();
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [gameData, setGameData] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [confirmedAnswer, setConfirmedAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [error, setError] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [soloMode, setSoloMode] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatVisible, setChatVisible] = useState(true);
  const [currentFaceoff, setCurrentFaceoff] = useState(null);
  const [gameSettings, setGameSettings] = useState({
    questionTimer: 120,
    breakTimer: 10,
    allowSpectatorChat: true
  });
  const navigate = useNavigate();

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Room creation success
    socket.on('room_created', ({ roomCode, game }) => {
      setRoomCode(roomCode);
      setGameData(game);
      setChatMessages(game.chatMessages || []);
      setGameSettings(game.gameSettings || { questionTimer: 120, breakTimer: 10, allowSpectatorChat: true });
      setIsHost(true);
      setLoading(false);
      navigate(`/room/${roomCode}`);
    });

    // Error handling
    socket.on('error', ({ message }) => {
      setError(message);
      setLoading(false);
    });

    // Room joined (received by the user who just joined)
    socket.on('room_joined', ({ roomCode, game, isRejoin }) => {
      setRoomCode(roomCode);
      setGameData(game);
      setChatMessages(game.chatMessages || []);
      setGameSettings(game.gameSettings || { questionTimer: 120, breakTimer: 10, allowSpectatorChat: true });
      setLoading(false);
      navigate(`/room/${roomCode}`);
    });
    
    // User joined room (received by users already in the room)
    socket.on('user_joined', ({ game }) => {
      setGameData(game);
    });

    // Teams updated
    socket.on('teams_updated', ({ game }) => {
      setGameData(game);
    });

    // Game started
    socket.on('game_started', ({ game }) => {
      setGameData(game);
      navigate(`/game/${roomCode}`);
    });

    // New question (legacy support)
    socket.on('new_question', (questionData) => {
      setCurrentQuestion(questionData);
      setSelectedAnswer(null);
      setConfirmedAnswer(null);
      setAnswerResult(null);
    });

    // New face-off
    socket.on('new_faceoff', (faceoffData) => {
      setCurrentFaceoff(faceoffData);
      setCurrentQuestion(faceoffData);
      setSelectedAnswer(null);
      setConfirmedAnswer(null);
      setAnswerResult(null);
      
      // Update game state if provided
      if (faceoffData.gameState) {
        setGameData(faceoffData.gameState);
      }
      
      // Check if current user is participating
      const isParticipating = isCurrentPlayerInFaceoff(faceoffData);
      setChatVisible(!isParticipating);
    });

    // Face-off result
    socket.on('faceoff_result', (result) => {
      setAnswerResult(result);
      setChatVisible(true); // Show chat again after result
    });

    // Answer submitted
    socket.on('answer_submitted', ({ player, team }) => {
      // Show notification that a player has submitted an answer
      console.log(`${player} from ${team} team has submitted an answer`);
    });

    // Answers evaluated
    socket.on('answers_evaluated', (result) => {
      setAnswerResult(result);
      // Update game data with new scores
      setGameData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          scores: {
            red: result.redScore,
            blue: result.blueScore
          }
        };
      });
    });

    // Next round
    socket.on('next_round', ({ game }) => {
      setGameData(game);
      setSelectedAnswer(null);
      setConfirmedAnswer(null);
      setAnswerResult(null);
    });

    // Game ended
    socket.on('game_ended', ({ game, winner }) => {
      setGameData({
        ...game,
        winner
      });
    });

    // Returned to lobby
    socket.on('returned_to_lobby', ({ game }) => {
      setGameData(game);
      setCurrentQuestion(null);
      setSelectedAnswer(null);
      setConfirmedAnswer(null);
      setAnswerResult(null);
      navigate(`/room/${roomCode}`);
    });

    // Host disconnected
    socket.on('host_disconnected', () => {
      setError('The host has disconnected. Returning to home page.');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    });

    // User left
    socket.on('user_left', ({ game }) => {
      setGameData(game);
    });

    // Chat messages
    socket.on('new_message', ({ message, gameState }) => {
      setChatMessages(prev => [...prev, message]);
      setGameData(gameState);
    });

    // Settings updated
    socket.on('settings_updated', ({ game }) => {
      setGameData(game);
      setGameSettings(game.gameSettings);
    });

    // User kicked
    socket.on('kicked', ({ message }) => {
      setError(message);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    });

    // User disconnected
    socket.on('user_disconnected', ({ game, disconnectedUser }) => {
      setGameData(game);
    });

    // User kicked notification
    socket.on('user_kicked', ({ game, kickedUser }) => {
      setGameData(game);
    });

    // New round
    socket.on('new_round', ({ round, totalRounds, scores }) => {
      setGameData(prev => ({
        ...prev,
        currentRound: round,
        scores: scores
      }));
      setChatVisible(true);
      setAnswerResult(null);
    });

    // Clean up listeners on unmount
    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('error');
      socket.off('user_joined');
      socket.off('teams_updated');
      socket.off('game_started');
      socket.off('new_question');
      socket.off('new_faceoff');
      socket.off('faceoff_result');
      socket.off('answer_submitted');
      socket.off('answers_evaluated');
      socket.off('next_round');
      socket.off('new_round');
      socket.off('game_ended');
      socket.off('returned_to_lobby');
      socket.off('host_disconnected');
      socket.off('user_left');
      socket.off('new_message');
      socket.off('settings_updated');
      socket.off('kicked');
      socket.off('user_disconnected');
      socket.off('user_kicked');
    };
  }, [socket, navigate, roomCode]);

  // Create a new game room
  const createRoom = (name, rounds) => {
    if (!socket || !connected) {
      setError('Socket not connected');
      return;
    }
    
    setUsername(name);
    setLoading(true);
    socket.emit('create_room', { username: name, rounds: parseInt(rounds) });
  };

  // Start solo challenge
  const startSoloChallenge = (name, questionCount) => {
    if (!socket || !connected) {
      setError('Socket not connected');
      return;
    }
    
    setUsername(name);
    setSoloMode(true);
    setLoading(true);
    socket.emit('start_solo_challenge', { username: name, questionCount });
    
    // Navigate to solo challenge page
    navigate('/solo-challenge');
    
    // If we don't get a response within 5 seconds, clear loading state
    setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          setError('No response from server. Please try again.');
          navigate('/');
          return false;
        }
        return prev;
      });
    }, 5000);
  };

  // Join an existing game room
  const joinRoom = (name, code) => {
    if (!socket || !connected) {
      setError('Socket not connected');
      return;
    }
    
    setUsername(name);
    setRoomCode(code);
    setLoading(true);
    socket.emit('join_room', { username: name, roomCode: code });
    
    // If we don't get a response within 5 seconds, clear loading state
    setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          setError('No response from server. Please try again.');
          return false;
        }
        return prev;
      });
    }, 5000);
  };

  // Join a team
  const joinTeam = (team) => {
    if (!socket || !connected) {
      setError('Socket not connected');
      return;
    }
    
    socket.emit('join_team', { team });
  };

  // Choose to spectate
  const spectate = () => {
    if (!socket || !connected) {
      setError('Socket not connected');
      return;
    }
    
    socket.emit('spectate');
  };

  // Start the game
  const startGame = () => {
    if (!socket || !connected || !isHost) {
      setError('Cannot start game');
      return;
    }
    
    socket.emit('start_game');
  };

  // Select an answer (first step)
  const selectAnswer = (option) => {
    setSelectedAnswer(option);
  };

  // Confirm and submit answer (second step)
  const confirmAnswer = () => {
    if (!socket || !connected || selectedAnswer === null) {
      return;
    }
    
    setConfirmedAnswer(selectedAnswer);
    socket.emit('submit_answer', { option: selectedAnswer });
  };

  // End current round (host only)
  const endRound = () => {
    if (!socket || !connected || !isHost) {
      return;
    }
    
    socket.emit('end_round');
  };

  // Return to lobby (host only)
  const returnToLobby = () => {
    if (!socket || !connected || !isHost) {
      return;
    }
    
    socket.emit('return_to_lobby');
  };

  // Send chat message
  const sendMessage = (message) => {
    if (!socket || !connected || !message.trim()) {
      return;
    }
    
    socket.emit('send_message', { message: message.trim() });
  };

  // Update game settings (host only)
  const updateGameSettings = (settings) => {
    if (!socket || !connected || !isHost) {
      return;
    }
    
    socket.emit('update_game_settings', { settings });
  };

  // Kick user (host only)
  const kickUser = (targetSocketId) => {
    if (!socket || !connected || !isHost) {
      return;
    }
    
    socket.emit('kick_user', { targetSocketId });
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Check if the current user is in red team
  const isInRedTeam = () => {
    if (!gameData || !socket) return false;
    return gameData.redTeam.some(player => player.socketId === socket.id);
  };

  // Check if the current user is in blue team
  const isInBlueTeam = () => {
    if (!gameData || !socket) return false;
    return gameData.blueTeam.some(player => player.socketId === socket.id);
  };

  // Check if the current user is a spectator
  const isSpectator = () => {
    if (!gameData || !socket) return true; // Default to spectator
    return gameData.spectators.some(player => player.socketId === socket.id);
  };

  // Check if it's the current user's turn (updated for face-off system)
  const isMyTurn = () => {
    if (!gameData || !socket || !username) return false;
    
    // For face-off system, check if user is one of the current players
    if (currentQuestion && (currentQuestion.redPlayer || currentQuestion.bluePlayer)) {
      const isMyTurnResult = (
        currentQuestion.redPlayer === username ||
        currentQuestion.bluePlayer === username
      );
      console.log('[isMyTurn] Checking face-off participants:', {
        username,
        redPlayer: currentQuestion.redPlayer,
        bluePlayer: currentQuestion.bluePlayer,
        result: isMyTurnResult
      });
      return isMyTurnResult;
    }
    
    // Also check currentFaceoff data structure
    if (currentFaceoff && (currentFaceoff.redPlayer || currentFaceoff.bluePlayer)) {
      return (
        currentFaceoff.redPlayer === username ||
        currentFaceoff.bluePlayer === username
      );
    }
    
    // Check currentPlayers structure if available (for backward compatibility)
    if (currentQuestion && currentQuestion.currentPlayers) {
      return (
        currentQuestion.currentPlayers.red?.socketId === socket.id ||
        currentQuestion.currentPlayers.blue?.socketId === socket.id
      );
    }
    
    // Legacy support for old system
    if (gameData.currentPlayerIndex !== undefined) {
      const { currentPlayerIndex } = gameData;
      
      if (isInRedTeam()) {
        return gameData.redTeam[currentPlayerIndex]?.socketId === socket.id;
      }
      
      if (isInBlueTeam()) {
        return gameData.blueTeam[currentPlayerIndex]?.socketId === socket.id;
      }
    }
    
    return false;
  };

  // Check if current user is participating in current face-off
  const isCurrentPlayerInFaceoff = (faceoffData) => {
    if (!socket || !faceoffData) return false;
    
    return (
      faceoffData.redPlayer === getUsernameBySocketId(socket.id) ||
      faceoffData.bluePlayer === getUsernameBySocketId(socket.id)
    );
  };

  // Get username by socket ID
  const getUsernameBySocketId = (socketId) => {
    if (!gameData || !socketId) return null;
    
    const allUsers = [...gameData.redTeam, ...gameData.blueTeam, ...gameData.spectators];
    const user = allUsers.find(u => u.socketId === socketId);
    return user?.username || null;
  };

  return (
    <GameContext.Provider
      value={{
        username,
        roomCode,
        gameData,
        isHost,
        currentQuestion,
        selectedAnswer,
        confirmedAnswer,
        answerResult,
        error,
        timeline,
        loading,
        soloMode,
        chatMessages,
        chatVisible,
        currentFaceoff,
        gameSettings,
        createRoom,
        joinRoom,
        joinTeam,
        spectate,
        startGame,
        selectAnswer,
        confirmAnswer,
        endRound,
        returnToLobby,
        sendMessage,
        updateGameSettings,
        kickUser,
        clearError,
        isInRedTeam,
        isInBlueTeam,
        isSpectator,
        isMyTurn,
        isCurrentPlayerInFaceoff,
        getUsernameBySocketId,
        startSoloChallenge,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};