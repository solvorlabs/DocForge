import { NavLink } from 'react-router-dom';
import { Home, Sword, Trophy, User, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

const items = [
  { icon: <Home className="h-5 w-5" />, label: 'Arena', path: '/arena' },
  { icon: <Sword className="h-5 w-5" />, label: 'Play', path: '/custom-rooms' },
  { icon: <Trophy className="h-5 w-5" />, label: 'Ranked', path: '/ranked' },
  { icon: <BookOpen className="h-5 w-5" />, label: 'Questions', path: '/question-bank' },
  { icon: <User className="h-5 w-5" />, label: 'Profile', path: '/profile' },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 navbar border-t border-border flex items-center justify-around px-2">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs no-underline transition-all",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
