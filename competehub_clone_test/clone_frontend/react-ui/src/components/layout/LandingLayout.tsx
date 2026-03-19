import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { useUser } from '../../contexts/UserContext';

export default function LandingLayout() {
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Landing Header */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 px-6 navbar">
        <div className="flex h-full items-center justify-between max-w-6xl mx-auto">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">CompeteHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/community" className="hover:text-foreground transition-colors no-underline">Community</Link>
            <Link to="/leaderboard" className="hover:text-foreground transition-colors no-underline">Leaderboard</Link>
          </nav>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button size="sm" className="gradient-primary border-0" onClick={() => navigate('/arena')}>
                Go to Arena
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Login</Button>
                <Button size="sm" className="gradient-primary border-0" onClick={() => navigate('/auth?mode=register')}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="pt-14">
        <Outlet />
      </main>
      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">CompeteHub</span>
            <span>— Multiplayer Knowledge Battles</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-foreground no-underline">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground no-underline">Terms</Link>
            <Link to="/contact" className="hover:text-foreground no-underline">Contact</Link>
          </div>
          <p>© 2026 CompeteHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
