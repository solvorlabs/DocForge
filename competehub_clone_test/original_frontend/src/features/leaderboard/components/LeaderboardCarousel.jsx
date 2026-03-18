import React from 'react';
import { ChevronLeft, ChevronRight, Trophy, Crown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LeaderboardCarousel.css';

const LeaderboardCarousel = ({
  leaderboardUsers,
  userStats,
  leaderboardIndex,
  onLeaderboardScroll,
  isAuthenticated = true
}) => {
  const navigate = useNavigate();

  const getAvatarEmoji = (avatar) => {
    const avatarMap = {
      default: '👤',
      brain: '🧠',
      trophy: '🏆',
      lightning: '⚡',
      book: '📚',
      star: '⭐'
    };
    return avatarMap[avatar] || '👤';
  };

  const getPlayerAvatar = (player) => {
    const avatar = player.avatar || 'default';

    if (avatar === 'default') {
      // Show first letter of username for default avatar
      return (player.username || player.name || '?')[0]?.toUpperCase();
    } else {
      // Show emoji for other avatars
      return (player.username || player.name || '?')[0]?.toUpperCase();
      // return getAvatarEmoji(avatar);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Crown size={16} style={{ color: '#FFD700' }} />;
      case 1: return <Trophy size={16} style={{ color: '#C0C0C0' }} />;
      case 2: return <Trophy size={16} style={{ color: '#CD7F32' }} />;
      default: return <Star size={16} style={{ color: 'var(--doodle-accent)' }} />;
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0: return '#FFD700';
      case 1: return '#C0C0C0';
      case 2: return '#CD7F32';
      default: return 'var(--doodle-accent)';
    }
  };

  return (
    <div className="leaderboard-carousel">
      {/* Header */}
      <div className="leaderboard-header">
        <h2 className="leaderboard-title">
          <Trophy size={20} style={{ marginRight: '8px' }} />
          Top Players
        </h2>
        <div className="scroll-controls">
          <button
            className="scroll-button"
            onClick={() => onLeaderboardScroll('left')}
            disabled={leaderboardIndex <= 0}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="scroll-button"
            onClick={() => onLeaderboardScroll('right')}
            disabled={leaderboardIndex >= leaderboardUsers.length - 5}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="leaderboard-scroll-container" style={{ paddingTop: '10px' }}>
        {/* Current User - Only show if authenticated */}
        {isAuthenticated && userStats.username && (
          <div className="player-card current-user">
            <div className="doodle-decoration doodle-decoration-1">👑</div>
            <div className="doodle-decoration doodle-decoration-2">⭐</div>

            <div className="player-avatar current-user-avatar">
              {/* {userStats.avatar === 'default' 
                ? (userStats.username[0]?.toUpperCase() || 'G')
                : getAvatarEmoji(userStats.avatar || 'default')
              } */}
              {userStats.username[0]?.toUpperCase()}
            </div>
            <div className="player-info">
              <div className="player-name current-user-name">YOU</div>
              <div className="player-rating current-user-rating">
                {userStats.ratings?.ranked || 'Unranked'}
              </div>
            </div>
            {/* <div className="rank-badge current-user-badge">
              <Crown size={12} />
            </div> */}
          </div>
        )}

        {/* Other Players */}
        {leaderboardUsers.slice(leaderboardIndex, leaderboardIndex + 7).map((player, index) => (
          <div key={player.userId || player.id} className="player-card">
            {/* <div className="doodle-decoration doodle-decoration-1">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'}
            </div> */}

            <div className="player-avatar" style={{ borderColor: getRankColor(index) }}>
              {getPlayerAvatar(player)}
            </div>
            <div className="player-info">
              <div className="player-name">
                {player.username || player.name}
              </div>
              <div className="player-rating">
                {player.elo || player.rating}
              </div>
            </div>
            {/* <div className="rank-badge" style={{ background: getRankColor(index) }}>
              {getRankIcon(index)}
            </div> */}
          </div>
        ))}

        {/* See More Button */}
        <div
          className="see-more-card"
          onClick={() => navigate('/leaderboard')}
        >
          <div className="see-more-icon">
            <ChevronRight size={20} />
          </div>
          <div className="see-more-text">SEE MORE</div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardCarousel;
