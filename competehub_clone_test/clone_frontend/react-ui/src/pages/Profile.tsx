import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Sword, Zap, Calendar, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import StatCard from '../components/shared/StatCard';
import RankBadge from '../components/shared/RankBadge';
import { getXpForLevel } from '../lib/constants';
import { GlitchText } from '../components/reactbits/GlitchText';
import { GradientText } from '../components/reactbits/GradientText';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';
import { Particles } from '../components/reactbits/Particles';
import { ElectricBorder } from '../components/reactbits/ElectricBorder';
import { ClickSpark } from '../components/reactbits/ClickSpark';

export default function Profile() {
  const { user, getProfile, getProgression, progression } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    getProfile().catch(() => {});
    getProgression().catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const xpForNext = getXpForLevel(user.level);
  const xpPercent = Math.min(100, (user.xp / xpForNext) * 100);
  const winRate = user.gamesPlayed ? Math.round((user.wins / user.gamesPlayed) * 100) : 0;

  const achievements = user.achievements || [
    { id: '1', title: 'First Blood', description: 'Win your first game', icon: '⚔️' },
    { id: '2', title: 'Scholar', description: 'Answer 100 questions', icon: '📚' },
    { id: '3', title: 'Speed Demon', description: 'Answer in under 5 seconds', icon: '⚡' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 relative">
      <Particles
        particleCount={80}
        particleSpread={20}
        speed={0.3}
        particleColors={['#FCEE09', '#ef4444', '#06b6d4']}
        particleBaseSize={60}
        alphaParticles
        style={{ zIndex: 0, opacity: 0.4 }}
      />
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="game-card p-6 mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar size="xl">
                <AvatarFallback emoji={user.avatar} className="text-4xl" />
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-white border-2 border-background">
                {user.level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    <GlitchText speed={0.4} enableShadows={false} enableOnHover>{user.username}</GlitchText>
                  </h1>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                  {user.examTarget && (
                    <Badge variant="purple" className="mt-1">{user.examTarget}</Badge>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/settings')} className="gap-1.5">
                  <Settings className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </div>

              {/* XP Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Level {user.level}</span>
                  <span>{user.xp} / {xpForNext} XP to Level {user.level + 1}</span>
                </div>
                <Progress value={xpPercent} color="linear-gradient(90deg, oklch(0.93 0.21 103), oklch(0.58 0.24 255))" className="h-2" />
              </div>

              {/* Rank */}
              {user.eloRating && (
                <div className="mt-3">
                  <RankBadge elo={user.eloRating} size="md" showElo />
                </div>
              )}
            </div>
          </div>

          {/* Member since */}
          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          <StatCard label="Total Wins" value={user.wins} icon={<Trophy className="h-4 w-4" />} color="text-yellow-400" />
          <StatCard label="Win Rate" value={`${winRate}%`} icon={<Star className="h-4 w-4" />} color="text-emerald-400" />
          <StatCard label="Games Played" value={user.gamesPlayed} icon={<Sword className="h-4 w-4" />} color="text-primary" />
          <StatCard label="Total XP" value={`${user.totalXP || 0}`} icon={<Zap className="h-4 w-4" />} color="text-blue-400" />
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="achievements">
          <TabsList className="mb-4">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="history">Game History</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((a, i) => (
                <SpotlightCard
                  key={a.id}
                  className="game-card p-4 flex items-center gap-3"
                  spotlightColor="rgba(252,238,9,0.12)"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl border border-primary/20">
                    {a.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                    {a.earnedAt && <p className="text-xs text-primary mt-0.5">{new Date(a.earnedAt).toLocaleDateString()}</p>}
                  </div>
                </SpotlightCard>
              ))}

              {/* Locked achievements */}
              {Array.from({ length: 6 - achievements.length }).map((_, i) => (
                <div key={`locked-${i}`} className="game-card p-4 flex items-center gap-3 opacity-40">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">🔒</div>
                  <div>
                    <p className="font-semibold text-muted-foreground">???</p>
                    <p className="text-xs text-muted-foreground">Keep playing to unlock</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="game-card p-4 flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${i % 3 !== 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">5v5 Team Battle</p>
                    <p className="text-xs text-muted-foreground">{i + 1} days ago</p>
                  </div>
                  <Badge variant={i % 3 !== 0 ? 'success' : 'red'}>{i % 3 !== 0 ? 'Win' : 'Loss'}</Badge>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">+{i % 3 !== 0 ? 25 : 0} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
