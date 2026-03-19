import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Bell, Settings, LogOut, User, Trophy, Users, Menu, X, ChevronDown
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '../ui/dropdown-menu';
import { toast } from 'sonner';

interface NavBarProps {
  onMenuToggle?: () => void
  menuOpen?: boolean
}

export default function NavBar({ onMenuToggle, menuOpen }: NavBarProps) {
  const { user, isAuthenticated, isGuest, logout } = useUser();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const xpPercent = user ? Math.min(100, ((user.xp || 0) / Math.max(1, Math.floor(100 * Math.pow(1.5, (user.level || 1) - 1)))) * 100) : 0;

  return (
    <header className="navbar fixed top-0 left-0 right-0 z-40 h-14 px-4">
      <div className="flex h-full items-center justify-between max-w-screen-2xl mx-auto">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onMenuToggle}
              className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
          <Link to={isAuthenticated ? '/arena' : '/'} className="flex items-center gap-2 no-underline">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">CompeteHub</span>
          </Link>
        </div>

        {/* Center: Nav Links (desktop) */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/arena" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors no-underline">Arena</Link>
            <Link to="/ranked" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors no-underline">Ranked</Link>
            <Link to="/leaderboard" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors no-underline">Leaderboard</Link>
            <Link to="/question-bank" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors no-underline">Questions</Link>
          </nav>
        )}

        {/* Right: User Actions */}
        <div className="flex items-center gap-2">
          {isGuest ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                👤 Guest Mode
              </span>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Login</Button>
              <Button size="sm" className="gradient-primary border-0 glow-primary" onClick={() => navigate('/auth?mode=register')}>
                Sign Up Free
              </Button>
            </div>
          ) : isAuthenticated && user ? (
            <>
              {/* XP & Level (desktop) */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                <span className="text-xs font-bold text-primary">Lv.{user.level}</span>
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{user.xp}xp</span>
              </div>

              {/* Notifications */}
              <button
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              </button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
                  <Avatar size="sm">
                    <AvatarFallback emoji={user.avatar || '🧑‍💻'} />
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-foreground">{user.username}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{user.username}</span>
                      <Badge variant="purple" className="text-xs">Lv.{user.level}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/ranked')}>
                    <Trophy className="h-4 w-4" /> Ranked
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/friends')}>
                    <Users className="h-4 w-4" /> Friends
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:text-destructive">
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Login</Button>
              <Button size="sm" className="gradient-primary border-0" onClick={() => navigate('/auth?mode=register')}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
