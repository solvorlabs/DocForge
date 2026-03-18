// src/components/layout/Sidebar.jsx - Left Sidebar with Game Categories and Navigation
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAudio } from '../../../app/providers/AudioContext';
import {
  Crown, Brain, Users, Zap, Calculator, Shield, Atom, FlaskConical, Dna, Cpu,
  Clock, Beaker, TreePine, Lightbulb, Target, Puzzle, Gamepad, Trophy, Gauge,
  Home, User, Settings, Menu, X, ChevronDown, ChevronRight, Play, Star,
  BarChart3, Award, Globe, MessageSquare, BookOpen
} from 'lucide-react';
import './Sidebar.css';
import { SingleBed, SingleBedTwoTone } from '@mui/icons-material';

const navigationItems = [
  { id: 'home', title: 'Arena', icon: Home, route: '/', active: true },
  { id: 'group-play', title: 'Group Play', icon: Users, route: '/custom-rooms' },
  // { id: 'solo', title: 'Question Bank', icon: User, route: '/solo-challenge' },
  // { id: 'daily-challenge', title: 'Daily Challenge', icon: Trophy, route: '/daily-challenge' },
  { id: 'question-bank', title: 'Question Bank', icon: BookOpen, route: '/question-bank' },
  { id: 'community', title: 'Community', icon: MessageSquare, route: '/community' },
  // { id: 'compete', title: 'Compete', icon: Award, route: '/leaderboard' },
  { id: 'social', title: 'Social', icon: Users, route: '/friends' },
  { id: 'leaderboard', title: 'Leaderboard', icon: BarChart3, route: '/leaderboard' },
  { id: 'my-profile', title: 'My Profile', icon: User, route: '/profile' },
  // { id: 'feedback', title: 'Feedback', icon: MessageSquare, route: '/feedback', comingSoon: true },
  // { id: 'creators-programme', title: 'Creators Programme', icon: Star, route: '/creators', comingSoon: true },
  // { id: 'social', title: 'Social', icon: Globe, route: '/social', comingSoon: true }
];

function Sidebar({ screenSize }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { playClick } = useAudio();
  const isCompact = screenSize === 'medium';

  const handleNavigation = (item) => {
    if (item.comingSoon) return;
    playClick();
    navigate(item.route);
  };

  const isActivePath = (route) => {
    if (route === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(route);
  };

  return (
    <div className={`sidebar ${isCompact ? 'sidebar-compact' : 'sidebar-full'}`}>
      {/* Navigation Items */}
      <div className="notebook-spiral"></div>
      <div className="notebook-page">
        <div className="sidebar-navigation">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = isActivePath(item.route);

            return (
              <div>
                <button
                  key={item.id}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''} ${item.comingSoon ? 'coming-soon' : ''} ${isCompact ? 'compact' : ''}`}
                  onClick={() => handleNavigation(item)}
                  disabled={item.comingSoon}
                  title={isCompact ? item.title : ''} // Show tooltip on compact mode
                >
                  <div className="nav-icon">
                    <IconComponent size={20} />
                  </div>
                  {!isCompact && <span className="nav-label">{item.title}</span>}
                  {!isCompact && item.comingSoon && <span className="coming-soon-badge">Soon</span>}
                </button>
                <hr style={{background:'black', width:'90%', marginLeft:'5px'}}/>
              </div>
            );
          })}
        </div>
        {/* {!isCompact && (
          <div className="sidebar-footer">
            <div className="app-version">v2.0.0</div>
          </div>
        )} */}
      </div>

      {/* Footer */}

    </div>
  );
}

export default Sidebar;