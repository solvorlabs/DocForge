// pages/Profile.jsx
import React from 'react';
import { useUser } from '../../../app/providers/UserContext';
import { useStats } from '../../progression/hooks/useStats';
import { motion } from 'framer-motion';
import { User, Trophy, Star, Flame, ArrowLeftCircle } from 'lucide-react';
import UserStatsCard from '../components/UserStatsCard';

const Profile = () => {
  const { user } = useUser();
  const { stats, loading } = useStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-doodle">
        ✏️ Loading your awesome profile...
      </div>
    );
  }

  return (
    <main
      className="min-h-screen bg-[#fffdf5] py-12 px-6 flex flex-col items-center relative overflow-hidden"
      style={{
        backgroundImage: "url('/doodle-bg.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: 'contain',
      }}
    >
      {/* Header */}
      <motion.h1
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-5xl font-handwritten text-[#222] mb-10 flex items-center gap-3"
      >
        <User className="text-[#4b3df5]" size={40} /> Your Profile
      </motion.h1>

      <div className="grid gap-8 w-full max-w-6xl md:grid-cols-3">
        {/* Personal Info Card */}
        <motion.div
          whileHover={{ rotate: -1, scale: 1.02 }}
          className="bg-[#d8e9ff] border-4 border-black rounded-3xl p-8 shadow-doodle"
        >
          <h2 className="font-handwritten text-2xl mb-4 text-[#1b1b1b] flex items-center gap-2">
            🧑‍🎓 Personal Info
          </h2>
          <div className="font-doodle text-[#333] text-lg space-y-2">
            <p><strong>Username:</strong> {user?.username || 'Anonymous'}</p>
            <p><strong>Level:</strong> {user?.level || 1}</p>
            <p><strong>Experience:</strong> {user?.xp || 0} XP</p>
            <p><strong>Exam Target:</strong> {user?.examTarget || '—'}</p>
          </div>
        </motion.div>

        {/* Game Stats Card */}
        <motion.div
          whileHover={{ rotate: 1, scale: 1.02 }}
          className="bg-[#fffbe0] border-4 border-black rounded-3xl p-8 shadow-doodle"
        >
          <h2 className="font-handwritten text-2xl mb-4 text-[#1b1b1b] flex items-center gap-2">
            🎮 Game Stats
          </h2>
          <div className="font-doodle text-[#333] text-lg space-y-2">
            <p><strong>Total Games:</strong> {stats?.stats?.totalGamesPlayed || 0}</p>
            <p><strong>1v1 Rating:</strong> {stats?.stats?.ratings?.duel1v1?.rating || 1000}</p>
            <p><strong>Solo Sessions:</strong> {stats?.stats?.gameModeStats?.soloChallenge?.sessionsCompleted || 0}</p>
            <p>
              <strong>Accuracy:</strong>{' '}
              {stats?.stats?.gameModeStats?.soloChallenge?.averageAccuracy
                ? stats.stats.gameModeStats.soloChallenge.averageAccuracy.toFixed(1)
                : 0}
              %
            </p>
          </div>
        </motion.div>

        {/* Achievements Card */}
        <motion.div
          whileHover={{ rotate: -2, scale: 1.02 }}
          className="bg-[#ffd6a5] border-4 border-black rounded-3xl p-8 shadow-doodle"
        >
          <h2 className="font-handwritten text-2xl mb-4 text-[#1b1b1b] flex items-center gap-2">
            🏆 Achievements
          </h2>
          <div className="font-doodle text-[#333] text-lg space-y-2">
            <p>🥇 First Game Completed</p>
            <p>⭐ 100 Questions Answered</p>
            <p>🔥 7-Day Streak</p>
            <p className="italic opacity-70">More badges on the way...</p>
          </div>
        </motion.div>
      </div>

      {/* Game Stats Card Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 w-full max-w-6xl"
      >
        <h2 className="text-3xl font-handwritten text-[#222] mb-6 flex items-center gap-2">
          <Trophy className="text-[#4b3df5]" size={32} /> My Game Stats
        </h2>
        <UserStatsCard userId={user?._id} />
      </motion.div>

      {/* Footer Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-16 text-center font-doodle text-gray-600"
      >
        <p className="text-lg">
          Our developers are <span className="line-through">lazy</span> "strategically relaxing" 💤
        </p>
        <p>
          Stay tuned for your progress charts, funny avatars, and friend battles!
        </p>
      </motion.div>
    </main>
  );
};

export default Profile;
