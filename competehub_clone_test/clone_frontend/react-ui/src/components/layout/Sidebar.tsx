import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Sword, Trophy, BookOpen, Users, Star,
  User, BarChart2, Zap, ChevronRight, Lock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';

interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
  badge?: string
  locked?: boolean
}

const navItems: NavItem[] = [
  { icon: <Home className="h-4 w-4" />, label: 'Arena', path: '/arena' },
  { icon: <Sword className="h-4 w-4" />, label: 'Group Play', path: '/custom-rooms' },
  { icon: <Star className="h-4 w-4" />, label: 'Solo Challenge', path: '/solo-challenge' },
  { icon: <Trophy className="h-4 w-4" />, label: 'Ranked', path: '/ranked' },
  { icon: <BarChart2 className="h-4 w-4" />, label: 'Leaderboard', path: '/leaderboard' },
  { icon: <BookOpen className="h-4 w-4" />, label: 'Question Bank', path: '/question-bank' },
  { icon: <Users className="h-4 w-4" />, label: 'Community', path: '/community' },
  { icon: <Users className="h-4 w-4" />, label: 'Friends', path: '/friends' },
  { icon: <User className="h-4 w-4" />, label: 'Profile', path: '/profile' },
];

interface SidebarProps {
  collapsed?: boolean
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const { user } = useUser();

  return (
    <motion.aside
      className="sidebar h-full flex flex-col py-4 overflow-hidden"
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Logo indicator */}
      <div className="px-3 mb-4">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <div className="flex items-center justify-center w-7 h-7 rounded-lg gradient-primary flex-shrink-0">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-sm gradient-text whitespace-nowrap overflow-hidden"
              >
                CompeteHub
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User quick info */}
      {!collapsed && user && (
        <div className="px-3 mb-4">
          <div className="px-3 py-2 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Level {user.level}</span>
              <span className="text-primary font-semibold">{user.xp} XP</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(100, (user.xp / Math.max(1, Math.floor(100 * Math.pow(1.5, user.level - 1)))) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all group no-underline",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn("flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
                  {item.icon}
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-between flex-1 overflow-hidden"
                    >
                      <span className="whitespace-nowrap">{item.label}</span>
                      {isActive && (
                        <ChevronRight className="h-3 w-3 text-primary ml-auto flex-shrink-0" />
                      )}
                      {item.locked && (
                        <Lock className="h-3 w-3 text-muted-foreground ml-auto flex-shrink-0" />
                      )}
                      {item.badge && (
                        <span className="text-xs bg-primary/20 text-primary rounded-full px-1.5 py-0.5 ml-auto flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="px-3 mt-4">
          <div className="px-3 py-2 bg-primary/8 border border-primary/20" style={{ borderRadius: 0 }}>
            <p className="text-xs font-semibold text-primary mb-1 tracking-widest uppercase">⚡ Daily Challenge</p>
            <p className="text-xs text-muted-foreground">Complete 3 solo sessions</p>
            <div className="mt-2 h-px bg-muted overflow-hidden">
              <div className="h-full w-1/3 bg-primary" />
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
