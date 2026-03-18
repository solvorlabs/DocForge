// components/navigation/MobileNavigation.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAudio } from '../../../app/providers/AudioContext';
import { 
  Home as HomeIcon, 
  Puzzle, 
  Trophy, 
  Users, 
  Settings,
  Bell,
  User
} from 'lucide-react';
import { useUser } from '../../../app/providers/UserContext';
import './MobileNavigation.css';
import { QuestionMark } from '@mui/icons-material';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useUser();
  const { playClick } = useAudio();

  const navigationItems = [
    { 
      icon: Trophy, 
      label: 'Leaderboard', 
      path: '/leaderboard',
      id: 'leaderboard'
    },
    { 
      icon: QuestionMark, 
      label: 'Questions', 
      path: '/question-bank',
      id: 'questions'
    },
    { 
      icon: HomeIcon, 
      label: 'Arena', 
      path: '/',
      id: 'home'
    },
    
    { 
      icon: Bell, 
      label: 'Feed', 
      path: '/feed',
      id: 'feed',
      comingSoon: true
    },
    { 
      icon: Settings, 
      label: 'More', 
      path: isAuthenticated ? '/profile' : '/auth',
      id: 'more'
    }
  ];

  const handleNavigation = (item) => {
    if (item.comingSoon) return;
    playClick();
    navigate(item.path);
  };

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="mobile-navigation">
      {navigationItems.map((item) => {
        const isActive = isActivePath(item.path);
        const IconComponent = item.icon;
        
        return (
          <div
            key={item.id}
            className={`mobile-nav-item ${isActive ? 'active' : ''} ${item.comingSoon ? 'coming-soon' : ''}`}
            onClick={() => handleNavigation(item)}
          >
            <div className="mobile-nav-icon">
              <IconComponent size={22} />
              {item.comingSoon && <span className="coming-soon-dot" />}
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </div>
        );
      })}
    </nav>
  );
};

export default MobileNavigation;