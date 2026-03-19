import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSocket } from './SocketContext';
import type { GameData, GameQuestion, Faceoff, AnswerResult, ChatMessage, GameSettings, Player } from '../types';

interface GameContextType {
  username: string;
  roomCode: string;
  gameData: GameData | null;
  isHost: boolean;
  currentQuestion: GameQuestion | null;
  selectedAnswer: string;
  confirmedAnswer: string;
  answerResult: AnswerResult | null;
  chatMessages: ChatMessage[];
  chatVisible: boolean;
  currentFaceoff: Faceoff | null;
  gameSettings: GameSettings;
  soloMode: boolean;
  gamePhase: string;
  setUsername: (name: string) => void;
  setChatVisible: (v: boolean) => void;
  createRoom: (name: string, rounds?: number) => void;
  joinRoom: (name: string, code: string) => void;
  startGame: () => void;
  joinTeam: (team: 'red' | 'blue') => void;
  spectate: () => void;
  selectAnswer: (option: string) => void;
  confirmAnswer: () => void;
  sendMessage: (message: string) => void;
  kickUser: (socketId: string) => void;
  endRound: () => void;
  returnToLobby: () => void;
  updateGameSettings: (settings: Partial<GameSettings>) => void;
  isInRedTeam: () => boolean;
  isInBlueTeam: () => boolean;
  isSpectator: () => boolean;
  isMyTurn: () => boolean;
  isCurrentPlayerInFaceoff: () => boolean;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { socket } = useSocket();
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [confirmedAnswer, setConfirmedAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatVisible, setChatVisible] = useState(false);
  const [currentFaceoff, setCurrentFaceoff] = useState<Faceoff | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings>({ questionTimer: 30, breakTimer: 5 });
  const [soloMode] = useState(false);
  const [gamePhase, setGamePhase] = useState('lobby');

  useEffect(() => {
    if (!socket) return;

    socket.on('room_created', (data: { roomCode: string; isHost: boolean }) => {
      setRoomCode(data.roomCode);
      setIsHost(data.isHost);
      setGamePhase('lobby');
    });

    socket.on('room_joined', (data: { roomCode: string; gameData: GameData }) => {
      setRoomCode(data.roomCode);
      setGameData(data.gameData);
      setGamePhase('lobby');
    });

    socket.on('teams_updated', (data: GameData) => {
      setGameData(data);
    });

    socket.on('user_joined', (data: GameData) => setGameData(data));
    socket.on('user_left', (data: GameData) => setGameData(data));

    socket.on('game_started', () => {
      setGamePhase('playing');
      setSelectedAnswer('');
      setConfirmedAnswer('');
      setAnswerResult(null);
    });

    socket.on('new_faceoff', (data: Faceoff) => {
      setCurrentFaceoff(data);
      setCurrentQuestion(null);
      setSelectedAnswer('');
      setConfirmedAnswer('');
      setAnswerResult(null);
      setGamePhase('faceoff');
    });

    socket.on('new_question', (data: GameQuestion) => {
      setCurrentQuestion(data);
      setSelectedAnswer('');
      setConfirmedAnswer('');
      setAnswerResult(null);
      setGamePhase('question');
    });

    socket.on('faceoff_result', (data: AnswerResult) => {
      setAnswerResult(data);
      setGamePhase('result');
    });

    socket.on('answers_evaluated', (data: { results: Record<string, AnswerResult>; gameData: GameData }) => {
      setGameData(data.gameData);
      const mySocketId = sessionStorage.getItem('socketId');
      if (mySocketId && data.results[mySocketId]) {
        setAnswerResult(data.results[mySocketId]);
      }
    });

    socket.on('game_ended', (data: GameData) => {
      setGameData(data);
      setGamePhase('ended');
    });

    socket.on('new_message', (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('game_settings_updated', (settings: GameSettings) => {
      setGameSettings(settings);
    });

    socket.on('kicked', () => {
      setRoomCode('');
      setGameData(null);
      setGamePhase('lobby');
      window.location.href = '/custom-rooms';
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('teams_updated');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('game_started');
      socket.off('new_faceoff');
      socket.off('new_question');
      socket.off('faceoff_result');
      socket.off('answers_evaluated');
      socket.off('game_ended');
      socket.off('new_message');
      socket.off('game_settings_updated');
      socket.off('kicked');
    };
  }, [socket]);

  const createRoom = useCallback((name: string, rounds = 5) => {
    setUsername(name);
    socket?.emit('create_room', { username: name, totalRounds: rounds });
  }, [socket]);

  const joinRoom = useCallback((name: string, code: string) => {
    setUsername(name);
    socket?.emit('join_room', { username: name, roomCode: code });
  }, [socket]);

  const startGame = useCallback(() => {
    socket?.emit('start_game', { roomCode });
  }, [socket, roomCode]);

  const joinTeam = useCallback((team: 'red' | 'blue') => {
    socket?.emit('join_team', { roomCode, team });
  }, [socket, roomCode]);

  const spectate = useCallback(() => {
    socket?.emit('spectate', { roomCode });
  }, [socket, roomCode]);

  const selectAnswer = useCallback((option: string) => {
    setSelectedAnswer(option);
  }, []);

  const confirmAnswer = useCallback(() => {
    if (!selectedAnswer) return;
    setConfirmedAnswer(selectedAnswer);
    socket?.emit('submit_answer', { roomCode, answer: selectedAnswer });
  }, [socket, roomCode, selectedAnswer]);

  const sendMessage = useCallback((message: string) => {
    socket?.emit('send_message', { roomCode, message, username });
  }, [socket, roomCode, username]);

  const kickUser = useCallback((socketId: string) => {
    socket?.emit('kick_user', { roomCode, socketId });
  }, [socket, roomCode]);

  const endRound = useCallback(() => {
    socket?.emit('end_round', { roomCode });
  }, [socket, roomCode]);

  const returnToLobby = useCallback(() => {
    socket?.emit('return_to_lobby', { roomCode });
    setGamePhase('lobby');
    setCurrentQuestion(null);
    setCurrentFaceoff(null);
    setAnswerResult(null);
  }, [socket, roomCode]);

  const updateGameSettings = useCallback((settings: Partial<GameSettings>) => {
    const updated = { ...gameSettings, ...settings };
    setGameSettings(updated);
    socket?.emit('update_game_settings', { roomCode, settings: updated });
  }, [socket, roomCode, gameSettings]);

  const isInRedTeam = useCallback(() =>
    gameData?.redTeam.some((p: Player) => p.username === username) ?? false,
    [gameData, username]);

  const isInBlueTeam = useCallback(() =>
    gameData?.blueTeam.some((p: Player) => p.username === username) ?? false,
    [gameData, username]);

  const isSpectator = useCallback(() =>
    gameData?.spectators.some((p: Player) => p.username === username) ?? false,
    [gameData, username]);

  const isMyTurn = useCallback(() => {
    if (!currentFaceoff) return false;
    return currentFaceoff.redPlayer.username === username ||
           currentFaceoff.bluePlayer.username === username;
  }, [currentFaceoff, username]);

  const isCurrentPlayerInFaceoff = isMyTurn;

  return (
    <GameContext.Provider value={{
      username, roomCode, gameData, isHost,
      currentQuestion, selectedAnswer, confirmedAnswer,
      answerResult, chatMessages, chatVisible,
      currentFaceoff, gameSettings, soloMode, gamePhase,
      setUsername, setChatVisible,
      createRoom, joinRoom, startGame,
      joinTeam, spectate, selectAnswer, confirmAnswer,
      sendMessage, kickUser, endRound, returnToLobby,
      updateGameSettings, isInRedTeam, isInBlueTeam,
      isSpectator, isMyTurn, isCurrentPlayerInFaceoff,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
}
