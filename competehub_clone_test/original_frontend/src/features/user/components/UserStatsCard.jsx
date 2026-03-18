/**
 * UserStatsCard Component
 * Displays comprehensive game statistics and allows users to share them
 */

import React, { useState, useEffect, useRef } from 'react';
import { Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import axios from 'axios';

const UserStatsCard = ({ userId }) => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchUserStats();
    }
  }, [userId]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/leaderboard/user-stats/${userId}`);
      setUserStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      setDownloading(true);
      
      // Capture the card as image
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#f8f9fa',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `competehub-stats-${userStats?.username || 'player'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Failed to generate share image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="text-center p-8 text-gray-500">
        No stats available yet. Start playing games to see your stats!
      </div>
    );
  }

  const gameIcons = {
    equationBuilder: '🧮',
    dragonOut: '🐉',
    endlessRunner: '🏃',
    crossword: '📝',
    bossMode: '👹',
    numericalSpeedRace: '⚡'
  };

  const gameNames = {
    equationBuilder: 'Equation Builder',
    dragonOut: 'Dragon Out',
    endlessRunner: 'Endless Runner',
    crossword: 'Crossword',
    bossMode: 'Boss Mode',
    numericalSpeedRace: 'Speed Race'
  };

  const { username, level, rank, overallStats, gameStats } = userStats;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {downloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Generating...
            </>
          ) : (
            <>
              <Download size={18} />
              Download Stats
            </>
          )}
        </button>
      </div>

      {/* Stats Card (This will be captured) */}
      <div
        ref={cardRef}
        className="bg-white rounded-2xl shadow-xl p-8 border-4 border-gray-800"
        style={{
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8 border-b-4 border-gray-800 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎮 CompeteHub Stats
          </h1>
          <p className="text-2xl font-semibold text-blue-600">
            {username}
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{level}</div>
              <div className="text-sm text-gray-600">Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{rank}</div>
              <div className="text-sm text-gray-600">Rank</div>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-xl p-4 text-center border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-600">
              {overallStats?.gamesPlayed || 0}
            </div>
            <div className="text-sm text-gray-700 font-medium">Games Played</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center border-2 border-green-200">
            <div className="text-3xl font-bold text-green-600">
              {overallStats?.gamesWon || 0}
            </div>
            <div className="text-sm text-gray-700 font-medium">Games Won</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center border-2 border-purple-200">
            <div className="text-3xl font-bold text-purple-600">
              {overallStats?.winRate || 0}%
            </div>
            <div className="text-sm text-gray-700 font-medium">Win Rate</div>
          </div>
        </div>

        {/* Game Breakdown */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            📊 Game Breakdown
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(gameStats || {}).map(([gameKey, stats]) => {
              if (!stats || stats.gamesPlayed === 0) return null;
              
              return (
                <div
                  key={gameKey}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border-2 border-gray-300 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{gameIcons[gameKey]}</span>
                    <h3 className="font-bold text-gray-800">
                      {gameNames[gameKey]}
                    </h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Played:</span>
                      <span className="font-semibold text-gray-800">
                        {stats.gamesPlayed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Won:</span>
                      <span className="font-semibold text-green-600">
                        {stats.gamesWon}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Win Rate:</span>
                      <span className="font-semibold text-purple-600">
                        {stats.winRate || 0}%
                      </span>
                    </div>
                    {stats.highScore > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">High Score:</span>
                        <span className="font-semibold text-blue-600">
                          {stats.highScore}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center text-gray-500 text-sm">
          <p>🎯 Keep playing to improve your stats!</p>
          <p className="mt-1">www.competehub.com</p>
        </div>
      </div>

      {/* Info Text */}
      <div className="mt-4 text-center text-gray-600 text-sm">
        Click "Download Stats" to save and share your achievements! 🎉
      </div>
    </div>
  );
};

export default UserStatsCard;
