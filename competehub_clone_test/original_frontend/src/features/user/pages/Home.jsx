// src/pages/HomeNew.jsx - Gaming Platform Style Interface
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '../../../app/providers/GameContext';
import { useUser } from '../../../app/providers/UserContext';
import { useStats } from '../../progression/hooks/useStats';
import { useAudio } from '../../../app/providers/AudioContext';
import { createClickEffect, DoodleIcons } from '../../../shared/utils/doodleUtils';
import {
  Crown, Brain, Users, Zap, Calculator, Shield, Atom, FlaskConical, Dna, Cpu,
  Clock, Beaker, TreePine, Lightbulb, Target, Puzzle, Gamepad, Trophy, Gauge,
  Bell, ChevronLeft, ChevronRight, Lock, Play, Star, Award, Timer, Medal,
  TrendingUp, Globe, BookOpen, Settings, Home as HomeIcon, Calendar,
  User, MessageSquare, Code, Heart, Info,
  CloudLightning,
  PlayIcon,
  AppleIcon,
  StarsIcon,
  Rocket,
  TargetIcon,
  Unlock
} from 'lucide-react';
import '../../../styles/themes/doodle.css';

// Import new components
import GameModeCard from '../../games/components/GameModeCard';
import LeaderboardCarousel from '../../leaderboard/components/LeaderboardCarousel';
import DailyChallenges from '../../challenges/components/DailyChallenges';
import GameInfoModal from '../../../shared/components/modals/GameInfoModal';
import UserStats from '../components/UserStats';
import { RemoveRedEyeSharp } from '@mui/icons-material';

// Real leaderboard data will be fetched from backend

// Game categories data structure
const gameCategories = {
  core: {
    title: "Core Modes",
    description: "Essential CompeteHub experiences",
    games: [
      {
        id: 'ranked-multiplayer',
        title: 'RANKED MULTIPLAYER',
        subtitle: 'Competitive team battles with ranking system',
        icon: Crown,
        color: '#4285f4',
        status: 'available',
        badge: 'Hot',
        route: '/ranked',
        info: 'Compete against players worldwide in real-time mathematical duels. Climb the global leaderboard with ELO-based ranking system!'
      },
      {
        id: 'custom-rooms',
        title: '5V5 CUSTOM ROOMS',
        subtitle: 'Private matches with friends',
        icon: Users,
        badge: 'Most Played',
        color: '#9c27b0',
        status: 'available',
        route: '/custom-rooms',
        info: 'Create private matches with friends and custom settings for team battles.'
      },
      // {
      //   id: 'practice-questions',
      //   title: 'PRACTICE QUESTIONS',
      //   subtitle: 'Solo practice with customized quizzes',
      //   icon: Brain,
      //   badge: 'Solo mode',
      //   color: '#0f9d58',
      //   status: 'available',
      //   route: '/solo-challenge',
      //   info: 'Practice mathematical problems at your own pace. Customize difficulty levels, subjects, and track your progress over time.'
      // },
    ]
  },
  competitive: {
    title: "Competitive Practice",
    description: "Fast-paced skill-building games for competitive exam prep",
    games: [
      {
        id: 'equation-builder',
        title: 'EQUATION BUILDER',
        subtitle: 'Construct complex equations step by step',
        icon: Calculator,
        badge: 'Hot',
        color: '#673ab7',
        status: 'available',
        route: '/game/equation-builder',
        info: 'Build and solve complex mathematical equations in a step-by-step competitive format.'
      },
      {
        id: 'boss-mode',
        title: 'BOSS MODE CHALLENGE',
        subtitle: 'Face increasingly difficult boss-level problems',
        badge: 'Hot',
        icon: Shield,
        color: '#1565c0',
        status: 'available',
        route: '/game/boss-mode',
        info: 'Challenge yourself against increasingly difficult mathematical bosses.'
      },
      {
        id: 'crossword-game',
        title: 'CROSSWORD QUEST',
        subtitle: 'Solve crossword puzzles with questions as clues',
        icon: Puzzle,
        badge: 'New',
        color: '#673ab7',
        status: 'available',
        route: '/games/crossword',
        info: 'Test your knowledge through interactive crossword puzzles. Questions become clues to complete the grid!'
      },
      {
        id: 'dragonout-game',
        title: 'DRAGON OUT SURVIVAL',
        subtitle: 'Survive dragon attacks by answering topic-based questions',
        icon: Shield,
        badge: 'New',
        color: '#e91e63',
        status: 'available',
        route: '/games/dragon-out',
        info: 'Face waves of dragons! Answer questions correctly to defeat them and level up. Choose your topics wisely!'
      },
      {
        id: 'endless-runner',
        title: 'ENDLESS RUNNER RACE',
        subtitle: 'Lane-switching runner with MCQ question gates',
        icon: Zap,
        badge: 'New',
        color: '#ff6b35',
        status: 'available',
        route: '/games/runner',
        info: 'Race through lanes while answering questions at gates. Switch lanes with arrow keys and answer quickly for bonus points!'
      }
    ]
  },
  science: {
    title: "Science & Strategy",
    description: "Mind-bending strategic games with scientific concepts",
    games: [
      {
        id: 'quantum-chess',
        title: 'QUANTUM CHESS',
        subtitle: 'Chess with quantum mechanics',
        icon: Atom,
        color: '#7b1fa2',
        status: 'coming-soon',
        route: '/game/quantum-chess',
        info: 'Experience chess with quantum superposition, entanglement, and wave function collapse.'
      },
      {
        id: 'escape-lab',
        title: 'ESCAPE ROOM: LAB DISASTER',
        subtitle: 'Collaborative puzzle solving',
        icon: FlaskConical,
        color: '#00695c',
        status: 'coming-soon',
        route: '/game/escape-lab',
        info: 'Work together to solve scientific puzzles and prevent laboratory catastrophe.'
      },
      {
        id: 'gene-splicer',
        title: 'GENE SPLICER SIMULATOR',
        subtitle: 'Competitive genetics using Mendelian inheritance',
        icon: Dna,
        color: '#00838f',
        status: 'coming-soon',
        route: '/game/gene-splicer',
        info: 'Apply genetic principles in competitive biological simulations.'
      }
    ]
  },
  mind: {
    title: "Mind & Psychology",
    description: "Games that challenge your mental prowess and strategic thinking",
    games: [
      {
        id: 'mind-readers',
        title: "MIND READERS' DUEL",
        subtitle: 'Predict opponents using game theory',
        icon: Brain,
        color: '#e91e63',
        status: 'coming-soon',
        route: '/game/mind-readers',
        info: 'Use psychological tactics and game theory to predict opponent behavior.'
      },
      {
        id: 'neuro-network',
        title: 'NEURONETWORK',
        subtitle: 'Build neural networks with logic gates',
        icon: Cpu,
        color: '#2196f3',
        status: 'coming-soon',
        route: '/game/neuro-network',
        info: 'Design and build neural networks using logic gates to solve pattern recognition.'
      },
      {
        id: 'time-loop',
        title: 'TIME LOOP STRATEGIST',
        subtitle: 'Navigate time loops to gather clues',
        icon: Clock,
        color: '#ff5722',
        status: 'coming-soon',
        route: '/game/time-loop',
        info: 'Use temporal mechanics to gather information and fix reality anomalies.'
      }
    ]
  },
  educational: {
    title: "Educational & Collaborative",
    description: "Learn together through interactive scientific simulations",
    games: [
      {
        id: 'chemical-crafting',
        title: 'CHEMICAL COMPOUND CRAFTING',
        subtitle: 'Build molecules using periodic table elements',
        icon: Beaker,
        color: '#4caf50',
        status: 'coming-soon',
        route: '/game/chemical-crafting',
        info: 'Create chemical compounds using realistic bonding rules and periodic table elements.'
      },
      {
        id: 'ecosystem-sim',
        title: 'ECOSYSTEM SIMULATOR',
        subtitle: 'Balance food chains and environmental events',
        icon: TreePine,
        color: '#8bc34a',
        status: 'coming-soon',
        route: '/game/ecosystem-sim',
        info: 'Collaboratively manage ecosystem balance and environmental challenges.'
      },
      {
        id: 'science-quiz',
        title: 'SCIENCE QUIZ SHOWDOWN',
        subtitle: 'Fast-paced trivia with power-ups',
        icon: Lightbulb,
        color: '#ffc107',
        status: 'coming-soon',
        route: '/game/science-quiz',
        info: 'Competitive science trivia with special abilities and power-ups.'
      }
    ]
  },
  experimental: {
    title: "Creative & Experimental",
    description: "Cutting-edge games exploring AI, physics, and innovation",
    games: [
      {
        id: 'ai-training',
        title: 'AI TRAINING ARENA',
        subtitle: 'Compete to train the smartest AI',
        icon: Cpu,
        color: '#3f51b5',
        status: 'coming-soon',
        route: '/game/ai-training',
        info: 'Train artificial intelligence models using datasets and compete for the best results.'
      },
      {
        id: 'particle-collider',
        title: 'PARTICLE COLLIDER CHALLENGE',
        subtitle: 'Predict collision results and discover particles',
        icon: Atom,
        color: '#9c27b0',
        status: 'coming-soon',
        route: '/game/particle-collider',
        info: 'Simulate particle physics experiments and predict collision outcomes.'
      }
    ]
  },
  traditional: {
    title: "Traditional with a Twist",
    description: "Classic games reimagined with scientific and educational elements",
    games: [
      {
        id: 'science-codenames',
        title: 'SCIENCE CODENAMES',
        subtitle: 'Classic Codenames with scientific terminology',
        icon: Target,
        color: '#ff9800',
        status: 'coming-soon',
        route: '/game/science-codenames',
        info: 'The classic word-association game enhanced with scientific vocabulary and concepts.'
      },
      {
        id: 'physics-puzzle',
        title: 'PHYSICS PUZZLE RELAY',
        subtitle: 'Rube Goldberg-style puzzles using real physics',
        icon: Puzzle,
        color: '#607d8b',
        status: 'coming-soon',
        route: '/game/physics-puzzle',
        info: 'Create chain-reaction puzzles using realistic physics simulation and mechanics.'
      }
    ]
  }
};

// Flatten games for compatibility with existing code
const gameModes = Object.values(gameCategories).flatMap(category => category.games);

// Map game IDs to their corresponding doodie images
const gameImageMap = {
  'ranked-multiplayer': '/doodieranked.png',
  'custom-rooms': '/doodierooms.png',
  'practice-questions': '/doodiesolo.png',
  'equation-builder': '/doodieequation.png',
  'boss-mode': '/doodieboss.png',
  'crossword-game': '/doodiecrossword.png',
  'dragonout-game': '/doodiedragon.png',
  'endless-runner': '/doodierunner.png',
  'quantum-chess': '/doodie.png',
  'escape-lab': '/doodie.png',
  'gene-splicer': '/doodie.png',
  'mind-readers': '/doodie.png',
  'neuro-network': '/doodie.png',
  'time-loop': '/doodie.png',
  'chemical-crafting': '/doodie.png',
  'ecosystem-sim': '/doodie.png',
  'science-quiz': '/doodie.png',
  'ai-training': '/doodie.png',
  'particle-collider': '/doodie.png',
  'science-codenames': '/doodie.png',
  'physics-puzzle': '/doodie.png'
};

// Lighten the original colors
const lightenColor = (color, locked) => {
  if (locked) return 'var(--doodle-secondary)';

  const lightColorMap = {
    '#4285f4': '#A8C8FF', '#9c27b0': '#E1BEE7', '#0f9d58': '#A5D6A7',
    '#673ab7': '#D1C4E9', '#1565c0': '#90CAF9', '#e91e63': '#F8BBD0',
    '#ff6b35': '#FFCCBC', '#7b1fa2': '#E1BEE7', '#00695c': '#B2DFDB',
    '#00838f': '#B2EBF2', '#2196f3': '#BBDEFB', '#ff5722': '#FFCCBC',
    '#4caf50': '#C8E6C9', '#8bc34a': '#DCEDC8', '#ffc107': '#FFECB3',
    '#3f51b5': '#C5CAE9', '#607d8b': '#CFD8DC', '#ff9800': '#FFE0B2'
  };

  return lightColorMap[color] || color;
};

const gameModeTabs = ['SUGGESTED', 'BLITZ', 'PUZZLE', 'MEMORY', 'CLASSICAL'];

const dailyChallenges = [
  {
    id: 1,
    title: 'DAILY PUZZLE',
    date: 'Coming Soon',
    icon: Puzzle,
    completed: false,
    comingSoon: true
  },
  // {
  //   id: 2,
  //   title: 'Div Contests',
  //   date: 'Coming Soon',
  //   icon: Award,
  //   completed: false,
  //   hasArrow: true,
  //   comingSoon: true
  // },
  {
    id: 2,
    title: 'Contests',
    date: 'Coming Soon',
    icon: Globe,
    completed: false,
    hasArrow: true,
    comingSoon: true
  }
];

function Home() {
  const { user, isAuthenticated } = useUser();
  const { createRoom, joinRoom, error, clearError, loading } = useGame();
  const { stats, leaderboard, loading: statsLoading, error: statsError, processLoginReward } = useStats();
  const { playClick, playSuccess, playError, playNotification } = useAudio();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedGameTab, setSelectedGameTab] = useState('SUGGESTED');
  const [leaderboardIndex, setLeaderboardIndex] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedGameInfo, setSelectedGameInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dailyReward, setDailyReward] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  // Track if daily reward has been processed to prevent duplicate calls
  const hasProcessedReward = useRef(false);

  // Handle both authenticated and guest users
  const userStats = {
    competers: stats?.globalStats?.totalUsers || stats?.stats?.totalCompeters || 0,
    gamesPlayed: isAuthenticated
      ? (stats?.stats?.totalGamesPlayed || 0)
      : (stats?.globalStats?.totalGamesPlayed || 0),
    level: user?.level || 1,
    xp: user?.currentLevelXP || 0,
    currency: stats?.stats?.currency?.coins || 0,
    username: user?.username || (isAuthenticated ? 'User' : ''),
    ratings: {
      ranked: user?.ranked?.elo || '',
      blitz: user?.blitz?.elo || '',
      classical: user?.classical?.elo || '',
      puzzle: user?.puzzle?.elo || ''
    }
  };

  // Use real leaderboard data from backend
  const leaderboardUsers = leaderboard || [];

  const handleGameModeClick = (gameMode) => {
    if (gameMode.locked) {
      playError();
      return;
    }

    playClick();
    createClickEffect(event);

    if (gameMode.route) {
      // Check if this is a ranked game that requires login
      if (gameMode.route === '/ranked') {
        if (!isAuthenticated) {
          playNotification();
          alert('Please login to play ranked games and compete for ELO ratings!');
          navigate('/auth');
          return;
        }
      }

      // For solo challenges, allow anonymous but warn about no score saving
      if (gameMode.route === '/solo-challenge' ||
        gameMode.route?.includes('/game/')) {
        if (!isAuthenticated) {
          playNotification();
          const continueAsGuest = window.confirm(
            'You are not logged in. You can play as a guest, but your scores will not be saved to the leaderboard.\n\nWould you like to continue as a guest?'
          );

          if (!continueAsGuest) {
            navigate('/auth');
            return;
          }
        }
      }

      playSuccess();
      navigate(gameMode.route);
    }
  };

  const handleGameInfo = (gameMode, e) => {
    e.preventDefault();
    e.stopPropagation();
    playClick();
    setSelectedGameInfo(gameMode);
    setShowInfoModal(true);
  };

  const handleLeaderboardScroll = (direction) => {
    playClick();
    if (direction === 'left' && leaderboardIndex > 0) {
      setLeaderboardIndex(leaderboardIndex - 1);
    } else if (direction === 'right' && leaderboardIndex < leaderboardUsers.length - 5) {
      setLeaderboardIndex(leaderboardIndex + 1);
    }
  };

  const toggleSidebar = () => {
    playClick();
    setSidebarOpen(!sidebarOpen);
  };

  // Mobile state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check authentication and show paywall after 3 seconds
  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setShowPaywall(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Process daily login reward for authenticated users - only once per session
  useEffect(() => {
    const processReward = async () => {
      // Only process if authenticated and not already processed
      if (isAuthenticated && !hasProcessedReward.current) {
        hasProcessedReward.current = true;

        try {
          const reward = await processLoginReward();
          if (reward && reward.xpEarned > 0) {
            playSuccess();
            setDailyReward(reward);
            // Show reward notification for 3 seconds
            setTimeout(() => setDailyReward(null), 3000);
          }
        } catch (error) {
          console.error('Error processing daily reward:', error);
        }
      }
    };

    processReward();

    // Reset the flag when user logs out
    if (!isAuthenticated) {
      hasProcessedReward.current = false;
    }
  }, [isAuthenticated, processLoginReward]);

  // Paywall Overlay Component
  const PaywallOverlay = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      padding: '20px'
    }}>
      <div style={{
        background: 'var(--doodle-paper)',
        border: '4px solid var(--doodle-ink)',
        borderRadius: '30px',
        padding: '40px 30px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '8px 8px 0 var(--doodle-blue)',
        transform: 'rotate(-1deg)',
        position: 'relative'
      }}>
        {/* Doodie Avatar */}
        <div style={{
          width: '150px',
          height: '150px',
          margin: '0 auto 20px',
          animation: 'bounce 2s infinite'
        }}>
          <img
            src="/doodie.png"
            alt="Doodie"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.1))'
            }}
          />
        </div>

        {/* Message */}
        <h2 style={{
          fontSize: '2rem',
          color: 'var(--doodle-accent)',
          marginBottom: '15px',
          transform: 'rotate(1deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          Woopsie! <TargetIcon size={32} style={{ verticalAlign: 'middle' }} />
        </h2>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--doodle-ink)',
          marginBottom: '10px',
          lineHeight: '1.6'
        }}>
          I think you're not logged in...
        </p>

        <p style={{
          fontSize: '1rem',
          color: 'var(--doodle-secondary)',
          marginBottom: '30px',
          opacity: 0.8
        }}>
          Join the fun and unlock all the awesome features! 🚀
        </p>

        {/* Login Button */}
        <button
          onClick={() => navigate('/auth')}
          style={{
            background: 'var(--doodle-green)',
            color: 'white',
            border: '3px solid var(--doodle-ink)',
            borderRadius: '20px',
            padding: '15px 40px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '4px 4px 0 var(--doodle-ink)',
            transition: 'all 0.2s ease',

            display: 'inline-flex',
            alignItems: 'center',
            marginRight: '10px',
            transform: 'rotate(-1deg)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05) rotate(0deg)';
            e.target.style.boxShadow = '6px 6px 0 var(--doodle-ink)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1) rotate(-1deg)';
            e.target.style.boxShadow = '4px 4px 0 var(--doodle-ink)';
          }}
        >
          <Unlock color='orange' /> Login Now
        </button>

        {/* Browse as Guest */}
        <button
          onClick={() => setShowPaywall(false)}
          style={{
            background: 'transparent',
            color: 'var(--doodle-secondary)',
            border: '2px solid var(--doodle-secondary)',
            borderRadius: '20px',
            padding: '12px 30px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            cursor: 'pointer',

            marginTop: '15px',
            display: 'inline-block'
          }}
        >
          <RemoveRedEyeSharp /> Browse as Guest
        </button>

        {/* Decorative doodles */}
        <div style={{
          position: 'absolute',
          top: '-15px',
          right: '20px',
          fontSize: '2rem',
          transform: 'rotate(15deg)'
        }}>⭐</div>
        <div style={{
          position: 'absolute',
          bottom: '-10px',
          left: '30px',
          fontSize: '1.5rem',
          transform: 'rotate(-20deg)'
        }}>💡</div>
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </div>
  );

  // Mobile View
  if (isMobile) {
    return (
      <>
        <Helmet>
          <title>CompeteHub Arena – Play 5v5 Rooms, Ranked Duels &amp; Learning Games</title>
          <meta
            name="description"
            content="Enter the CompeteHub arena to join 5v5 custom rooms, ranked multiplayer duels, science strategy games and endless runner quiz modes. Learn JEE, NEET &amp; GATE concepts while you play."
          />
          <meta
            name="keywords"
            content="5v5 quiz rooms, multiplayer learning games, JEE NEET GATE practice, knowledge battles, CompeteHub home, quiz arena"
          />
        </Helmet>
        <div style={{
          minHeight: '100vh',
          background: 'var(--doodle-bg)',

          // paddingLeft: '60px' // Space for hamburger button
        }}>
          {/* Paywall Overlay */}
          {showPaywall && <PaywallOverlay />}

          {/* Sidebar */}
          {/* <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} /> */}

          {/* Hamburger Button */}
          {/* <HamburgerButton onClick={toggleSidebar} /> */}
          {/* Mobile Header */}
          <header className="header-main" style={{
            padding: '10px 15px',
            background: 'var(--doodle-paper)',
            borderBottom: '3px solid var(--doodle-ink)',
          }}>
            <UserStats userStats={userStats} isAuthenticated={isAuthenticated} />
          </header>

          {/* Mobile User Carousel */}
          <div style={{ padding: '5px 15px', background: 'var(--doodle-paper)', borderBottom: '2px solid var(--doodle-ink)' }}>
            <LeaderboardCarousel
              leaderboardUsers={leaderboardUsers}
              userStats={userStats}
              leaderboardIndex={leaderboardIndex}
              onLeaderboardScroll={handleLeaderboardScroll}
              isAuthenticated={isAuthenticated}
            />
          </div>

          {/* Mobile Hero Banner */}
          {/* <div
          style={{
            background: 'var(--doodle-paper)',
            border: '3px solid var(--doodle-ink)',
            borderRadius: '20px',
            padding: '25px 15px',
            textAlign: 'center',
            marginBottom: '25px',
            boxShadow: '4px 4px 0 var(--doodle-blue)',
             
            transform: 'rotate(-0.5deg)',
          }}
        >
          <h1
            style={{
              margin: '0 0 10px 0',
              fontSize: '1.6rem',
              color: 'var(--doodle-blue)',
              textShadow: '1px 1px 0 var(--doodle-purple)',
              transform: 'rotate(0.5deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <StarsIcon /> EXPLORE COMPETEHUB GAMES! <StarsIcon />
          </h1>

          <p
            style={{
              margin: '0 0 20px 0',
              fontSize: '1rem',
              color: 'var(--doodle-ink)',
              opacity: 0.9,
            }}
          >
            Master concepts through multiplayer knowledge battles 🎯
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              style={{
                background: 'var(--doodle-green)',
                color: 'white',
                border: '2px solid var(--doodle-ink)',
                padding: '10px 22px',
                borderRadius: '20px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '2px 2px 0 var(--doodle-ink)',
                transition: 'all 0.2s ease',
                 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05) rotate(1deg)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1) rotate(0deg)')}
            >
              <Rocket /> GET STARTED
            </button>
          </div>

        </div> */}


          {/* Mobile Category Buttons */}
          <div style={{ padding: '0 15px 20px', margin: '15px' }}>
            {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <button style={{
              background: 'var(--doodle-green)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <Puzzle size={24} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>PUZZLE</div>
            </button>

            <button style={{
              background: 'var(--doodle-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer'
            }}>
              <Zap size={24} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>BLITZ</div>
            </button>
          </div> */}

            {/* Mobile Game Mode Tabs */}
            {/* <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
              {gameModeTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedGameTab(tab)}
                  style={{
                    padding: '6px 12px',
                    border: selectedGameTab === tab ? '2px solid var(--doodle-green)' : '2px solid var(--doodle-ink)',
                    background: selectedGameTab === tab ? 'var(--doodle-green)' : 'var(--doodle-paper)',
                    color: selectedGameTab === tab ? 'white' : 'var(--doodle-ink)',
                    borderRadius: '15px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div> */}

            {/* Mobile Game Modes Grid */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                margin: '0 0 15px 0',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: 'var(--doodle-ink)',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}>
                <TargetIcon /> KNOWLEDGE BATTLES
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px',
                width: '100%'
              }}>
                {gameModes.map((gameMode) => {
                  const doodieImage = gameImageMap[gameMode.id] || '/doodie.png';
                  const accentColor = lightenColor(gameMode.color, gameMode.locked);

                  return (
                    <div
                      key={gameMode.id}
                      onClick={() => handleGameModeClick(gameMode)}
                      style={{
                        background: gameMode.locked
                          ? 'linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%)'
                          : 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                        border: '3px solid var(--doodle-ink)',
                        borderRadius: '20px',
                        padding: '0',
                        cursor: gameMode.locked ? 'not-allowed' : 'pointer',
                        opacity: gameMode.locked ? 0.7 : 1,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.2s ease',

                        overflow: 'hidden',
                        boxShadow: '4px 4px 0 rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* Doodie Image Container */}
                      <div style={{
                        width: '100%',
                        height: '140px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        borderBottom: `3px solid ${accentColor}`,
                        background: `linear-gradient(to bottom, ${accentColor}22, ${accentColor}11)`
                      }}>
                        <img
                          src={doodieImage}
                          alt={gameMode.title}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
                          }}
                        />
                      </div>

                      {/* Badge */}
                      {gameMode.badge && (
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          background: 'var(--doodle-accent)',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '12px',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                          zIndex: 5
                        }}>
                          {gameMode.badge}
                        </div>
                      )}

                      {/* Content Section */}
                      <div style={{
                        padding: '15px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          {/* Icon */}
                          <div style={{
                            color: accentColor,
                            flexShrink: 0
                          }}>
                            {gameMode.icon ?
                              React.createElement(gameMode.icon, { size: 20 }) :
                              <Users size={20} />
                            }
                          </div>

                          {/* Title */}
                          <h4 style={{
                            margin: 0,
                            fontSize: '0.95rem',
                            fontWeight: 'bold',

                            color: gameMode.locked ? '#666' : '#333',
                            flex: 1,
                            textAlign: 'left',
                            lineHeight: 1.2
                          }}>
                            {gameMode.title}
                          </h4>
                        </div>

                        {/* Subtitle */}
                        <p style={{
                          margin: 0,
                          fontSize: '0.8rem',

                          color: '#666',
                          lineHeight: 1.4,
                          textAlign: 'left'
                        }}>
                          {gameMode.subtitle}
                        </p>
                      </div>

                      {/* Status Indicators */}
                      {gameMode.locked && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: 'rgba(0,0,0,0.8)',
                          borderRadius: '50%',
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10
                        }}>
                          <Lock size={20} color="white" />
                        </div>
                      )}

                      {gameMode.status === 'coming-soon' && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '20px',
                          zIndex: 8
                        }}>
                          <div style={{
                            background: 'var(--doodle-orange)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            boxShadow: '3px 3px 0 rgba(0,0,0,0.2)'
                          }}>
                            COMING SOON
                          </div>
                        </div>
                      )}

                      {/* Info Button */}
                      <button
                        onClick={(e) => handleGameInfo(gameMode, e)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '2px solid var(--doodle-ink)',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'var(--doodle-ink)',
                          boxShadow: '2px 2px 0 rgba(0,0,0,0.1)',
                          zIndex: 10
                        }}
                      >
                        <Info size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>


        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>CompeteHub Arena – Multiplayer Knowledge Battles &amp; Exam Games</title>
        <meta
          name="description"
          content="Browse all CompeteHub game modes including 5v5 custom rooms, ranked ladder, science strategy games and experimental AI arenas. Designed for students preparing for JEE, NEET &amp; GATE."
        />
        <meta
          name="keywords"
          content="knowledge battle games, multiplayer learning platform, 5v5 quiz arena, ranked quiz mode, exam prep games, CompeteHub home"
        />
      </Helmet>
      <div style={{
        minHeight: '100vh',
        background: 'var(--doodle-bg)',

        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflowX: 'hidden'
      }}>
        {/* Paywall Overlay */}
        {showPaywall && <PaywallOverlay />}

        {/* Sidebar */}
        {/* <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} /> */}

        {/* Hamburger Button */}
        {/* <HamburgerButton onClick={toggleSidebar} /> */}

        <div style={{ display: 'flex', flex: 1, width: '100%', overflowX: 'hidden' }}>
          {/* Main Content Area */}
          <main style={{
            flex: 1,
            padding: '20px',
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden'
          }}>
            {/* Daily Reward Notification */}
            {dailyReward && (
              <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: 'linear-gradient(135deg, #4caf50, #45a049)',
                color: 'white',
                padding: '15px 20px',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                zIndex: 1000,

                animation: 'slideIn 0.3s ease-out',
                border: '3px solid #fff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '1.5rem' }}>🎉</div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      Daily Login Bonus!
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      +{dailyReward.xpEarned} XP
                      {dailyReward.streakBonus && ' (Streak Bonus!)'}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                      {dailyReward.currentStreak} day streak • Level {dailyReward.level}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Carousel */}
            <LeaderboardCarousel
              leaderboardUsers={leaderboardUsers}
              userStats={userStats}
              leaderboardIndex={leaderboardIndex}
              onLeaderboardScroll={handleLeaderboardScroll}
              isAuthenticated={isAuthenticated}
            />

            {/* Game Mode Tabs */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', fontWeight: 'bold' }}>Knowledge Battles</h3>
              {/* <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {gameModeTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedGameTab(tab)}
                  style={{
                    padding: '8px 16px',
                    border: selectedGameTab === tab ? '2px solid var(--doodle-green)' : '2px solid var(--doodle-ink)',
                    background: selectedGameTab === tab ? 'var(--doodle-green)' : 'var(--doodle-paper)',
                    color: selectedGameTab === tab ? 'white' : 'var(--doodle-ink)',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                     
                  }}
                >
                  {tab}
                </button>
              ))}
            </div> */}
            </div>

            {/* Game Modes Grid */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '15px',
              marginBottom: '30px',
              width: '100%',
              maxWidth: '100%',
              justifyContent: 'flex-start'
            }}>
              {gameModes.map((gameMode) => (
                <GameModeCard
                  key={gameMode.id}
                  gameMode={gameMode}
                  onGameModeClick={handleGameModeClick}
                  onGameInfo={handleGameInfo}
                />
              ))}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside style={{
            width: '250px',
            minWidth: '250px',
            background: 'transparent', /* Changed to transparent */
            padding: '20px',
            flexShrink: 0
          }}>
            {/* User Stats */}
            <div className="doodle-sticky-note blue" style={{
              marginBottom: '20px',
              position: 'relative',
              backgroundImage: 'none'
            }}>
              
              <UserStats userStats={userStats} isAuthenticated={isAuthenticated} />
            </div>

            {/* Ratings Panel */}
            <div className="doodle-sticky-note pink" style={{
              padding: '10px',
              position: 'relative',
              backgroundImage: 'none'
            }}>
              <img
                src="/note1.png"
                alt=""
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 0,
                  width: '1500px',
                  height: '200px',
                  objectFit: 'cover',
                  zIndex: -1,
                  pointerEvents: 'none'
                }}
              />
              <h3 style={{
                margin: '30px 0 0 15px',
                fontSize: '0.9rem',
                padding: '10px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: 'var(--doodle-secondary)'
              }}>
                RATINGS
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { label: 'RANKED', rating: userStats.ratings.ranked, icon: Crown, color: 'var(--doodle-accent)', featured: true },
                  // { label: 'BLITZ', rating: userStats.ratings.blitz, icon: Zap, color: 'var(--doodle-green)' },
                  // { label: 'CLASSICAL', rating: userStats.ratings.classical, icon: Brain, color: 'var(--doodle-blue)' },
                  // { label: 'PUZZLE', rating: userStats.ratings.puzzle, icon: Puzzle, color: 'var(--doodle-purple)' }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: item.featured ? '15px' : '10px',
                    borderRadius: '10px',
                    // border: item.featured ? '3px solid var(--doodle-accent)' : '2px solid var(--doodle-ink)',
                    // background: item.featured ? 'rgba(255,255,255,0.5)' : 'transparent',
                    position: 'relative'
                  }}>
                    {/* {item.featured && (
                      <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '10px',
                      background: 'var(--doodle-accent)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '0.6rem',
                      fontWeight: 'bold'
                      }}>
                      MAIN
                      </div>
                    )} */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <item.icon size={16} style={{ color: item.color }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{item.label}</span>
                    </div>
                    <span style={{
                      fontSize: item.featured ? '1.1rem' : '0.9rem',
                      fontWeight: 'bold',
                      color: item.color
                    }}>
                      {item.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Challenges */}
            {/* <div className="doodle-sticky-note" style={{
                  marginBottom: '30px',
                  position: 'relative',
                  backgroundImage: 'none'
                }}>
                  <img 
                  src="/note3.png" 
                  alt="" 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: -1,
                    pointerEvents: 'none'
                  }}
                  />
                  <DailyChallenges dailyChallenges={dailyChallenges} />
                </div> */}
            <br /><br />
            {/* Mobile App Download */}
            <div className="doodle-sticky-note green" style={{
              position: 'relative',
              backgroundImage: 'none'
            }}>
              <img
                src="/note4.png"
                alt=""
                style={{
                  position: 'absolute',
                  top: 2,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: -1,
                  pointerEvents: 'none'
                }}
              />
              <h3 style={{
                margin: '0 0 15px 0',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                textAlign: 'center',
                // color: 'var(--doodle-secondary)'
              }}>
                DOWNLOAD APP
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0 10px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  cursor: 'not-allowed'
                }}>
                  <span><AppleIcon /></span>
                  <span>App Store - Coming Soon</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0 10px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  cursor: 'not-allowed'
                }}>
                  <span><PlayIcon /></span>
                  <span>Google Play - Coming Soon</span>
                </div>
                <span style={{ color: 'gray', fontSize: '0.7rem', padding: '10px', marginLeft: '10px', marginBottom: '20px' }}>We have swapped the icons to annoy users</span>
              </div>
            </div>
          </aside>
        </div>

        {/* Game Info Modal */}
        <GameInfoModal
          showInfoModal={showInfoModal}
          selectedGameInfo={selectedGameInfo}
          onClose={() => setShowInfoModal(false)}
        />
      </div>
    </>
  );
}

export default Home;
