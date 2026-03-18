// src/components/user/PlayerProfile.jsx - Player Profile View with ELO Ratings
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Crown, Trophy, Star, User, Calendar, TrendingUp, Award, 
  ArrowLeft, Mail, Users, Target, Brain, Calculator, Zap
} from 'lucide-react';

function PlayerProfile() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlayerProfile();
  }, [playerId]);

  const fetchPlayerProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/profile/${playerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Player not found');
      }
      
      const data = await response.json();
      setPlayer(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading player profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Player Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRankColor = (rating) => {
    if (rating >= 2000) return 'text-purple-600';
    if (rating >= 1800) return 'text-yellow-600';
    if (rating >= 1600) return 'text-green-600';
    if (rating >= 1400) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getRankBadge = (rating) => {
    if (rating >= 2000) return { name: 'Grandmaster', color: 'bg-purple-500', icon: '👑' };
    if (rating >= 1800) return { name: 'Master', color: 'bg-yellow-500', icon: '🏆' };
    if (rating >= 1600) return { name: 'Expert', color: 'bg-green-500', icon: '⭐' };
    if (rating >= 1400) return { name: 'Intermediate', color: 'bg-blue-500', icon: '🎯' };
    return { name: 'Beginner', color: 'bg-gray-500', icon: '🌱' };
  };

  const eloRatings = [
    { key: 'ranked', name: 'Ranked', icon: Crown, color: '#4285f4' },
    { key: 'blitz', name: 'Blitz', icon: Zap, color: '#ff6b35' },
    { key: 'classical', name: 'Classical', icon: Brain, color: '#0f9d58' },
    { key: 'puzzle', name: 'Puzzle', icon: Target, color: '#9c27b0' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {player.profilePicture ? (
                  <img 
                    src={player.profilePicture} 
                    alt={player.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  player.username.charAt(0).toUpperCase()
                )}
              </div>
              {player.rank && (
                <div className={`absolute -bottom-2 -right-2 ${getRankBadge(player.eloRatings?.ranked?.rating || 1200).color} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg`}>
                  {getRankBadge(player.eloRatings?.ranked?.rating || 1200).icon} {getRankBadge(player.eloRatings?.ranked?.rating || 1200).name}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{player.username}</h1>
              {player.displayName && (
                <p className="text-lg text-gray-600 mb-2">{player.displayName}</p>
              )}
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span>Joined {formatDate(player.createdAt)}</span>
                </div>
                {player.lastActive && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={16} />
                    <span>Last active {formatDate(player.lastActive)}</span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{player.level || 1}</div>
                  <div className="text-sm text-gray-500">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{player.xp || 0}</div>
                  <div className="text-sm text-gray-500">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.max(...eloRatings.map(rating => player.eloRatings?.[rating.key]?.rating || 1200))}
                  </div>
                  <div className="text-sm text-gray-500">Peak ELO</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ELO Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {eloRatings.map((ratingType) => {
            const rating = player.eloRatings?.[ratingType.key] || { 
              rating: 1200, 
              gamesPlayed: 0, 
              wins: 0, 
              losses: 0, 
              draws: 0 
            };
            const winRate = rating.gamesPlayed > 0 ? Math.round((rating.wins / rating.gamesPlayed) * 100) : 0;
            const IconComponent = ratingType.icon;

            return (
              <div key={ratingType.key} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: ratingType.color + '20', color: ratingType.color }}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{ratingType.name}</h3>
                    <p className="text-sm text-gray-500">{rating.gamesPlayed} games</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getRankColor(rating.rating)}`}>
                      {rating.rating}
                    </div>
                    <div className="text-sm text-gray-500">ELO Rating</div>
                  </div>

                  {rating.gamesPlayed > 0 && (
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="font-semibold text-green-600">{rating.wins}</div>
                        <div className="text-gray-500">Wins</div>
                      </div>
                      <div>
                        <div className="font-semibold text-red-600">{rating.losses}</div>
                        <div className="text-gray-500">Losses</div>
                      </div>
                      <div>
                        <div className="font-semibold text-yellow-600">{rating.draws}</div>
                        <div className="text-gray-500">Draws</div>
                      </div>
                    </div>
                  )}

                  {rating.gamesPlayed > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-600">{winRate}%</div>
                      <div className="text-sm text-gray-500">Win Rate</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Achievements Section */}
        {player.achievements && player.achievements.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Award className="text-yellow-500" size={28} />
              Achievements
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {player.achievements.map((achievement, index) => (
                <div key={index} className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <h3 className="font-bold text-gray-800">{achievement.badgeName}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Earned {formatDate(achievement.earnedAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerProfile;