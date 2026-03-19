import { atom } from 'jotai';
import type { User, GameData, GameQuestion, Faceoff, AnswerResult, ChatMessage, GameSettings, Player } from '../types';

// Auth atoms
export const userAtom = atom<User | null>(null);
export const tokenAtom = atom<string | null>(
  typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null
);
export const isAuthenticatedAtom = atom<boolean>((get) => get(tokenAtom) !== null && get(userAtom) !== null);
export const isAuthLoadingAtom = atom<boolean>(true);

// Game atoms
export const usernameAtom = atom<string>('');
export const roomCodeAtom = atom<string>('');
export const isHostAtom = atom<boolean>(false);
export const gameDataAtom = atom<GameData | null>(null);
export const currentQuestionAtom = atom<GameQuestion | null>(null);
export const selectedAnswerAtom = atom<string>('');
export const confirmedAnswerAtom = atom<string>('');
export const answerResultAtom = atom<AnswerResult | null>(null);
export const chatMessagesAtom = atom<ChatMessage[]>([]);
export const chatVisibleAtom = atom<boolean>(false);
export const currentFaceoffAtom = atom<Faceoff | null>(null);
export const gameSettingsAtom = atom<GameSettings>({ questionTimer: 30, breakTimer: 5 });
export const soloModeAtom = atom<boolean>(false);
export const gamePhaseAtom = atom<'lobby' | 'countdown' | 'faceoff' | 'question' | 'result' | 'ended'>('lobby');

// UI atoms
export const sidebarCollapsedAtom = atom<boolean>(false);
export const mobileMenuOpenAtom = atom<boolean>(false);
export const volumeMusicAtom = atom<number>(
  typeof localStorage !== 'undefined' ? Number(localStorage.getItem('musicVolume') ?? 0.5) : 0.5
);
export const volumeSoundAtom = atom<number>(
  typeof localStorage !== 'undefined' ? Number(localStorage.getItem('soundVolume') ?? 0.7) : 0.7
);

// Ranked atoms
export const rankedOpponentAtom = atom<Player | null>(null);
export const rankedEloAtom = atom<number>(1200);
export const isSearchingAtom = atom<boolean>(false);

// Derived atoms
export const myTeamAtom = atom<'red' | 'blue' | 'spectator' | null>((get) => {
  const gameData = get(gameDataAtom);
  const username = get(usernameAtom);
  if (!gameData) return null;
  if (gameData.redTeam.some((p) => p.username === username)) return 'red';
  if (gameData.blueTeam.some((p) => p.username === username)) return 'blue';
  if (gameData.spectators.some((p) => p.username === username)) return 'spectator';
  return null;
});
