export interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar: string;
  examTarget?: string;
  level: number;
  xp: number;
  totalXP: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  bestScore?: number;
  achievements?: Achievement[];
  friends?: string[];
  isEmailVerified: boolean;
  createdAt: string;
  eloRating?: number;
  rank?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export interface GameQuestion {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  subject?: string;
  topic?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  examType?: string;
  images?: string[];
  year?: number;
}

export interface GameData {
  redTeam: Player[];
  blueTeam: Player[];
  spectators: Player[];
  scores: { red: number; blue: number };
  currentRound: number;
  totalRounds: number;
  status: 'waiting' | 'playing' | 'ended';
  winner?: 'red' | 'blue' | 'tie';
}

export interface Player {
  socketId: string;
  username: string;
  avatar?: string;
}

export interface Faceoff {
  redPlayer: Player;
  bluePlayer: Player;
  roundNumber: number;
}

export interface AnswerResult {
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
  pointsAwarded?: number;
}

export interface GameSettings {
  questionTimer: number;
  breakTimer: number;
}

export interface ChatMessage {
  username: string;
  message: string;
  timestamp: number;
  team?: 'red' | 'blue' | 'spectator';
}

export interface RankedMatch {
  _id: string;
  opponent: string;
  opponentElo: number;
  result: 'win' | 'loss';
  eloChange: number;
  date: string;
  accuracy?: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar?: string;
  score: number;
  wins?: number;
  losses?: number;
  gamesPlayed?: number;
  winRate?: number;
  eloRating?: number;
}

export interface Friend {
  _id: string;
  username: string;
  avatar?: string;
  online?: boolean;
  level?: number;
}

export interface FriendRequest {
  _id: string;
  from: { _id: string; username: string; avatar?: string };
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface ExamQuestion {
  _id: string;
  questionText: string;
  options: string[];
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  examType: string;
  year?: number;
  type?: string;
  images?: string[];
  solution?: string;
}

export interface FilterOptions {
  subjects: string[];
  topics: string[];
  difficulties: string[];
  examTypes: string[];
  years: number[];
}

export interface GameResult {
  gameType: string;
  score: number;
  xpEarned?: number;
  questionsAnswered?: number;
  correctAnswers?: number;
  timeTaken?: number;
  details?: Record<string, unknown>;
}

export interface Progression {
  level: number;
  xp: number;
  totalXP: number;
  xpForNextLevel: number;
  achievements: Achievement[];
}

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface GameMode {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'All';
  features: string[];
  route: string;
  available: boolean;
  players?: string;
  category: 'core' | 'puzzle' | 'battle' | 'speedrun';
  color: string;
  image?: string;
}
