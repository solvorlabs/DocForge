import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '../providers/UserContext';
import { CircularProgress, Box } from '@mui/material';

// Auth Components
import ProtectedRoute from '../../shared/components/auth/ProtectedRoute';

// Pages
import GameRoom from '../../features/games/multiplayer/pages/GameRoom';
import GameBoard from '../../features/games/multiplayer/pages/GameBoard';
import SoloChallenge from '../../features/games/solo/pages/SoloChallenge';
import Leaderboard from '../../features/leaderboard/pages/Leaderboard';
import DoodleDemo from '../../features/user/pages/DoodleDemo';
import FriendsManager from '../../features/social/components/FriendsManager';
import RoomLinkHandler from '../../features/games/components/RoomLinkHandler';
import RankedHome from '../../features/ranked/pages/RankedHome';
import RankedSearch from '../../features/ranked/pages/RankedSearch';
import RankedBattle from '../../features/ranked/pages/RankedBattle';
import RankedResult from '../../features/ranked/pages/RankedResult';
import RankedHistory from '../../features/ranked/pages/RankedHistory';
import RankedProfile from '../../features/ranked/pages/RankedProfile';
import CompleteProfile from '../../features/auth/pages/CompleteProfile';
import AuthPage from '../../features/auth/pages/AuthPage';
import Profile from '../../features/user/pages/Profile';
import CustomRooms from '../../features/games/multiplayer/pages/CustomRooms';
import Settings from '../../features/user/pages/Settings';
import PlayerProfile from '../../features/user/components/PlayerProfile';
import QuantumChess from '../../features/games/modes/QuantumChess';
import EscapeLab from '../../features/games/modes/EscapeLab';
import GeneSplicer from '../../features/games/modes/GeneSplicer';
import AITraining from '../../features/games/modes/AITraining';
import ComingSoon from '../../features/games/modes/ComingSoon';
import NumericalSpeedRace from '../../features/games/modes/NumericalSpeedRace';
import EquationBuilder from '../../features/games/modes/EquationBuilder';
import BossMode from '../../features/games/modes/BossMode';
import Home from '../../features/user/pages/Home';
import DailyChallenge from '../../features/challenges/components/DailyChallenge';
import QuestionBank from '../../features/question-bank/pages/QuestionBank';
import AdminDashboard from '../../features/question-bank/pages/AdminDashboard';
import LandingPage from '../../features/marketing/pages/LandingPage';
import HackathonPage from '../../features/marketing/pages/HackathonPage';
import DragonOutGame from '../../features/games/modes/DragonOutGame';
import CrosswordGame from '../../features/games/modes/CrosswordGame';
import EndlessRunnerGame from '../../features/games/modes/EndlessRunnerGame';
import Community from '../../features/community/pages/Community';
import HackWithMaitPost from '../../features/community/pages/HackWithMaitPost';
import WelcomePost from '../../features/community/pages/WelcomePost';
import RankingStrategiesPost from '../../features/community/pages/RankingStrategiesPost';
import PrivacyPolicy from '../../features/marketing/pages/PrivacyPolicy';
import TermsOfService from '../../features/marketing/pages/TermsOfService';
import Contact from '../../features/marketing/pages/Contact';
import NotFound from '../../shared/components/NotFound';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public route - Landing Page */}
      <Route path="/landing" element={<LandingPage />} />
      
      {/* Hackathon Page - Public Access */}
      <Route path="/hackathon" element={<HackathonPage />} />
      
      {/* Root path logic - redirect based on auth status */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Home /> : <LandingPage />} 
      />

      {/* Auth routes - accessible when not authenticated */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />

      {/* Home route - allow access for all users (guests and authenticated) */}
      <Route path="/home" element={<Home />} />

      {/* Profile routes - require authentication */}
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/:playerId" element={<PlayerProfile />} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      
      {/* Game routes - allow guest access (guests can play) */}
      <Route path="/custom-rooms" element={<CustomRooms />} />
      <Route path="/join/:roomCode" element={<RoomLinkHandler />} />
      <Route path="/room/:roomCode" element={<GameRoom />} />
      <Route path="/game/:roomCode" element={<GameBoard />} />
      <Route path="/solo-challenge" element={<SoloChallenge />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/demo" element={<DoodleDemo />} />
      <Route path="/daily-challenge" element={<DailyChallenge />} />
      
      {/* Friends - require authentication */}
      <Route path="/friends" element={<ProtectedRoute><FriendsManager /></ProtectedRoute>} />
      
      {/* Question Bank Routes - allow guest access */}
      <Route path="/question-bank" element={<QuestionBank />} />
      {/* <Route path="/question-bank/admin" element={<AdminDashboard />} /> */}
      <Route path="/question-bank/jee" element={<QuestionBank />} />
      <Route path="/question-bank/gate" element={<QuestionBank />} />
      
      {/* Community Routes - public access */}
      <Route path="/community" element={<Community />} />
      <Route path="/community/hackwithMait-winners-2024" element={<HackWithMaitPost />} />
      <Route path="/community/welcome-community" element={<WelcomePost />} />
      <Route path="/community/ranking-strategies-guide" element={<RankingStrategiesPost />} />
      
      {/* Legal Routes - public access */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Game Mode Routes - allow guest access */}
      <Route path="/game/quantum-chess" element={<QuantumChess />} />
      <Route path="/game/escape-lab" element={<EscapeLab />} />
      <Route path="/game/gene-splicer" element={<GeneSplicer />} />
      <Route path="/game/ai-training" element={<AITraining />} />
      <Route path="/game/mind-readers" element={<ComingSoon />} />
      <Route path="/game/neuro-network" element={<ComingSoon />} />
      <Route path="/game/time-loop" element={<ComingSoon />} />
      <Route path="/game/chemical-crafting" element={<ComingSoon />} />
      <Route path="/game/ecosystem-sim" element={<ComingSoon />} />
      <Route path="/game/science-quiz" element={<ComingSoon />} />
      <Route path="/game/particle-collider" element={<ComingSoon />} />
      <Route path="/game/science-codenames" element={<ComingSoon />} />
      <Route path="/game/physics-puzzle" element={<ComingSoon />} />
      <Route path="/game/numerical-speed-race" element={<NumericalSpeedRace />} />
      <Route path="/game/equation-builder" element={<EquationBuilder />} />
      <Route path="/game/boss-mode" element={<BossMode />} />
      <Route path="/games/dragon-out" element={<DragonOutGame />} />
      <Route path="/games/crossword" element={<CrosswordGame />} />
      <Route path="/games/runner" element={<EndlessRunnerGame />} />
      
      {/* Ranked Routes - require authentication */}
      <Route path="/ranked" element={<ProtectedRoute><RankedHome /></ProtectedRoute>} />
      <Route path="/ranked/search" element={<ProtectedRoute><RankedSearch /></ProtectedRoute>} />
      <Route path="/ranked/battle" element={<ProtectedRoute><RankedBattle /></ProtectedRoute>} />
      <Route path="/ranked/result" element={<ProtectedRoute><RankedResult /></ProtectedRoute>} />
      <Route path="/ranked/history" element={<ProtectedRoute><RankedHistory /></ProtectedRoute>} />
      <Route path="/ranked/profile" element={<ProtectedRoute><RankedProfile /></ProtectedRoute>} />
      
      {/* 404 Catch-all route - must be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;

