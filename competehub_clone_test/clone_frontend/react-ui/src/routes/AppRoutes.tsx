import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from '../components/layout/Layout';
import LandingLayout from '../components/layout/LandingLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Eager imports for critical paths
import LandingPage from '../pages/LandingPage';
import AuthPage from '../pages/AuthPage';
import NotFound from '../pages/NotFound';

// Lazy imports for other pages
const HomePage = lazy(() => import('../pages/HomePage'));
const GameRoom = lazy(() => import('../pages/GameRoom'));
const GameBoard = lazy(() => import('../pages/GameBoard'));
const SoloChallenge = lazy(() => import('../pages/SoloChallenge'));
const Leaderboard = lazy(() => import('../pages/Leaderboard'));
const RankedHome = lazy(() => import('../pages/RankedHome'));
const RankedSearch = lazy(() => import('../pages/RankedSearch'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const QuestionBank = lazy(() => import('../pages/QuestionBank'));
const Community = lazy(() => import('../pages/Community'));
const Friends = lazy(() => import('../pages/Friends'));
const CustomRooms = lazy(() => import('../pages/CustomRooms'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Landing routes */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<div className="min-h-screen p-8 max-w-3xl mx-auto"><h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1><p className="text-muted-foreground">Last updated: March 2026</p><p className="text-muted-foreground mt-4">Your privacy is important to us. CompeteHub collects minimal data required to provide the service.</p></div>} />
        <Route path="/terms" element={<div className="min-h-screen p-8 max-w-3xl mx-auto"><h1 className="text-3xl font-bold text-foreground mb-6">Terms of Service</h1><p className="text-muted-foreground">By using CompeteHub, you agree to these terms.</p></div>} />
        <Route path="/contact" element={<div className="min-h-screen p-8 max-w-lg mx-auto"><h1 className="text-3xl font-bold text-foreground mb-6">Contact Us</h1><p className="text-muted-foreground">Reach us at support@competehub.in</p></div>} />
      </Route>

      {/* Auth route */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />

      {/* App routes with layout */}
      <Route element={<Layout />}>
        {/* Home / Arena */}
        <Route path="/arena" element={<ProtectedPage><HomePage /></ProtectedPage>} />
        <Route path="/home" element={<Navigate to="/arena" replace />} />

        {/* Game routes */}
        <Route path="/custom-rooms" element={<ProtectedPage><CustomRooms /></ProtectedPage>} />
        <Route path="/solo-challenge" element={<ProtectedPage><SoloChallenge /></ProtectedPage>} />
        <Route path="/room/:roomCode" element={<ProtectedPage><GameRoom /></ProtectedPage>} />
        <Route path="/game/:roomCode" element={<ProtectedPage><GameBoard /></ProtectedPage>} />

        {/* Placeholder game modes */}
        {['/game/boss-mode', '/game/numerical-speed-race', '/game/equation-builder', '/game/quantum-chess', '/game/escape-lab', '/game/gene-splicer', '/game/ai-training', '/games/dragon-out', '/games/crossword', '/games/runner'].map(path => (
          <Route key={path} path={path} element={
            <ProtectedPage>
              <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-5xl mb-4 animate-float">🎮</div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Coming Soon</h2>
                  <p className="text-muted-foreground">This game mode is under development!</p>
                </div>
              </div>
            </ProtectedPage>
          } />
        ))}

        {/* Leaderboard */}
        <Route path="/leaderboard" element={<ProtectedPage><Leaderboard /></ProtectedPage>} />

        {/* Ranked */}
        <Route path="/ranked" element={<ProtectedPage><RankedHome /></ProtectedPage>} />
        <Route path="/ranked/search" element={<ProtectedPage><RankedSearch /></ProtectedPage>} />
        <Route path="/ranked/battle" element={<ProtectedPage><GameBoard /></ProtectedPage>} />
        <Route path="/ranked/result" element={<ProtectedPage><div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Match result</p></div></ProtectedPage>} />
        <Route path="/ranked/history" element={<ProtectedPage><RankedHome /></ProtectedPage>} />

        {/* Question Bank */}
        <Route path="/question-bank" element={<ProtectedPage><QuestionBank /></ProtectedPage>} />
        <Route path="/question-bank/jee" element={<ProtectedPage><QuestionBank /></ProtectedPage>} />
        <Route path="/question-bank/gate" element={<ProtectedPage><QuestionBank /></ProtectedPage>} />

        {/* Community */}
        <Route path="/community" element={<ProtectedPage><Community /></ProtectedPage>} />
        <Route path="/community/*" element={<ProtectedPage><Community /></ProtectedPage>} />

        {/* Social */}
        <Route path="/friends" element={<ProtectedPage><Friends /></ProtectedPage>} />

        {/* User */}
        <Route path="/profile" element={<ProtectedPage><Profile /></ProtectedPage>} />
        <Route path="/profile/:playerId" element={<ProtectedPage><Profile /></ProtectedPage>} />
        <Route path="/settings" element={<ProtectedPage><Settings /></ProtectedPage>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
