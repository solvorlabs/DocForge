import type { GameMode, RankTier } from '../types';

export const API_BASE = import.meta.env.VITE_SOCKET_URL
  ? `${import.meta.env.VITE_SOCKET_URL}/api`
  : 'http://localhost:5000/api';

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const RANK_TIERS: Record<RankTier, { min: number; max: number; color: string; icon: string }> = {
  Bronze: { min: 0, max: 1000, color: '#cd7f32', icon: '🥉' },
  Silver: { min: 1000, max: 1200, color: '#c0c0c0', icon: '🥈' },
  Gold: { min: 1200, max: 1400, color: '#ffd700', icon: '🥇' },
  Platinum: { min: 1400, max: 1600, color: '#e5e4e2', icon: '💠' },
  Diamond: { min: 1600, max: 1800, color: '#b9f2ff', icon: '💎' },
  Master: { min: 1800, max: 2000, color: '#ff6b6b', icon: '👑' },
  Grandmaster: { min: 2000, max: Infinity, color: '#ffd700', icon: '🏆' },
};

export function getRankFromElo(elo: number): RankTier {
  if (elo >= 2000) return 'Grandmaster';
  if (elo >= 1800) return 'Master';
  if (elo >= 1600) return 'Diamond';
  if (elo >= 1400) return 'Platinum';
  if (elo >= 1200) return 'Gold';
  if (elo >= 1000) return 'Silver';
  return 'Bronze';
}

export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export const GAME_MODES: GameMode[] = [
  {
    id: '5v5',
    title: '5v5 Team Battle',
    description: 'Join a team and battle it out in intense 5v5 multiplayer knowledge fights.',
    icon: '⚔️',
    difficulty: 'All',
    features: ['Real-time multiplayer', 'Team strategy', 'Chat & emotes', 'Face-off rounds'],
    route: '/custom-rooms',
    available: true,
    players: '2-10',
    category: 'core',
    color: 'from-violet-600 to-blue-600',
    image: '/doodierooms.png',
  },
  {
    id: 'ranked',
    title: 'Ranked 1v1',
    description: 'Climb the ELO ladder in intense 1v1 ranked battles. Earn your rank.',
    icon: '🏆',
    difficulty: 'All',
    features: ['ELO ranking', '1v1 battles', 'Rank tiers', 'Seasonal rewards'],
    route: '/ranked',
    available: true,
    players: '2',
    category: 'core',
    color: 'from-yellow-500 to-orange-600',
    image: '/doodieranked.png',
  },
  {
    id: 'solo',
    title: 'Solo Challenge',
    description: 'Practice at your own pace. Choose subject, difficulty and sharpen your skills.',
    icon: '🧠',
    difficulty: 'All',
    features: ['Self-paced', 'Explanations', 'Progress tracking', 'Multiple exams'],
    route: '/solo-challenge',
    available: true,
    players: '1',
    category: 'core',
    color: 'from-green-500 to-teal-600',
    image: '/doodiesolo.png',
  },
  {
    id: 'boss',
    title: 'Boss Mode',
    description: 'Face progressively harder challenges. Can you beat the boss?',
    icon: '👹',
    difficulty: 'Hard',
    features: ['Escalating difficulty', 'Boss battles', 'Special rewards', 'Leaderboard'],
    route: '/game/boss-mode',
    available: true,
    players: '1',
    category: 'battle',
    color: 'from-red-600 to-pink-700',
    image: '/doodieboss.png',
  },
  {
    id: 'dragon',
    title: 'Dragon Out',
    description: 'Answer correctly to slay dragons and save the kingdom!',
    icon: '🐉',
    difficulty: 'Medium',
    features: ['Action gameplay', 'Dragon battles', 'Power-ups', 'Story mode'],
    route: '/games/dragon-out',
    available: true,
    players: '1',
    category: 'battle',
    color: 'from-orange-500 to-red-600',
    image: '/doodiedragon.png',
  },
  {
    id: 'speed',
    title: 'Speed Race',
    description: 'Race against the clock. Answer numerical questions at lightning speed!',
    icon: '⚡',
    difficulty: 'Medium',
    features: ['Time attack', 'Numerical focus', 'Speed bonuses', 'Global ranking'],
    route: '/game/numerical-speed-race',
    available: true,
    players: '1',
    category: 'speedrun',
    color: 'from-yellow-400 to-amber-600',
    image: '/doodiecalculus.png',
  },
  {
    id: 'equation',
    title: 'Equation Builder',
    description: 'Build equations piece by piece. Math has never been this fun!',
    icon: '🔢',
    difficulty: 'Medium',
    features: ['Math focus', 'Component building', 'Multiple subjects', 'Hints available'],
    route: '/game/equation-builder',
    available: true,
    players: '1',
    category: 'puzzle',
    color: 'from-blue-500 to-cyan-600',
    image: '/doodieequation.png',
  },
  {
    id: 'crossword',
    title: 'Crossword',
    description: 'Solve crossword puzzles with exam-level questions across topics.',
    icon: '📝',
    difficulty: 'Easy',
    features: ['Word puzzles', 'Topic-based', 'Hints system', 'Time challenge'],
    route: '/games/crossword',
    available: true,
    players: '1',
    category: 'puzzle',
    color: 'from-indigo-500 to-purple-600',
    image: '/doodiecrossword.png',
  },
  {
    id: 'runner',
    title: 'Endless Runner',
    description: 'Run, jump, and answer questions to survive the endless challenge!',
    icon: '🏃',
    difficulty: 'Easy',
    features: ['Parkour action', 'Answer to jump', 'Endless mode', 'High scores'],
    route: '/games/runner',
    available: true,
    players: '1',
    category: 'speedrun',
    color: 'from-teal-500 to-green-600',
    image: '/doodierunner.png',
  },
  {
    id: 'quantum',
    title: 'Quantum Chess',
    description: 'Chess meets quantum physics. Coming soon!',
    icon: '♟️',
    difficulty: 'Hard',
    features: ['Quantum mechanics', 'Chess strategy', 'AI opponent', 'Puzzle mode'],
    route: '/game/quantum-chess',
    available: false,
    players: '1-2',
    category: 'puzzle',
    color: 'from-violet-600 to-indigo-700',
    image: '/doodiequantum.png',
  },
];

export const EXAM_TYPES = ['JEE', 'NEET', 'GATE', 'CAT', 'UPSC', 'GRE', 'GMAT'];
export const HEARD_FROM = ['Social Media', 'Friend', 'Search', 'Advertisement', 'School/College', 'Other'];
export const AVATAR_OPTIONS = ['🧑‍💻', '👩‍🔬', '🧑‍🎓', '👨‍🚀', '👩‍🏫', '🧑‍🔭', '👨‍🎨', '👩‍💻', '🦸', '🧙'];
