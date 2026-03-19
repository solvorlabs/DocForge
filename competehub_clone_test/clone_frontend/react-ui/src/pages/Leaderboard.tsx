import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, TrendingUp, Users, Sword } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { progressionApi, gameApi } from '../lib/api';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import RankBadge from '../components/shared/RankBadge';
import type { LeaderboardEntry } from '../types';
import { cn } from '../lib/utils';
import { GlitchText } from '../components/reactbits/GlitchText';
import { GradientText } from '../components/reactbits/GradientText';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';
import { Particles } from '../components/reactbits/Particles';
import { Noise } from '../components/reactbits/Noise';
import { DotGrid } from '../components/reactbits/DotGrid';

const GAME_MODES = [
  { id: 'overall', label: 'Overall' },
  { id: 'boss-mode', label: 'Boss Mode' },
  { id: 'numerical-speed-race', label: 'Speed Race' },
  { id: 'dragon-out', label: 'Dragon Out' },
  { id: 'equation-builder', label: 'Equation Builder' },
  { id: 'crossword', label: 'Crossword' },
  { id: 'endless-runner', label: 'Runner' },
];

function Medal3D({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const isTop3 = rank <= 3;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.03 }}
      className={cn(
        "flex items-center gap-4 px-4 py-3 rounded-xl border transition-all",
        isTop3
          ? "border-primary/30 bg-primary/5"
          : "border-border hover:border-primary/20 hover:bg-muted/30"
      )}
    >
      {/* Rank */}
      <div className="w-10 text-center flex-shrink-0">
        <Medal3D rank={rank} />
      </div>

      {/* Avatar */}
      <Avatar size="md">
        <AvatarFallback emoji={entry.avatar || '🧑‍💻'} />
      </Avatar>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{entry.username}</p>
        {entry.eloRating && <RankBadge elo={entry.eloRating} size="sm" />}
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6 text-sm">
        {entry.wins !== undefined && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Wins</p>
            <p className="font-semibold text-foreground">{entry.wins}</p>
          </div>
        )}
        {entry.winRate !== undefined && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="font-semibold text-emerald-400">{entry.winRate}%</p>
          </div>
        )}
        {entry.gamesPlayed !== undefined && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Games</p>
            <p className="font-semibold text-foreground">{entry.gamesPlayed}</p>
          </div>
        )}
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-muted-foreground">Score</p>
        <p className={cn("font-bold text-lg", isTop3 ? "gradient-text" : "text-foreground")}>
          {entry.score.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const [tab, setTab] = useState('ranked');
  const [soloMode, setSoloMode] = useState('overall');

  const rankedQuery = useQuery({
    queryKey: ['ranked-leaderboard'],
    queryFn: () => progressionApi.getLeaderboard('ranked', 50) as Promise<{ leaderboard: LeaderboardEntry[] }>,
    enabled: tab === 'ranked',
  });

  const soloQuery = useQuery({
    queryKey: ['solo-leaderboard', soloMode],
    queryFn: () => gameApi.getLeaderboard(soloMode, 50) as Promise<{ leaderboard: LeaderboardEntry[] }>,
    enabled: tab === 'solo',
  });

  const entries = tab === 'ranked'
    ? (rankedQuery.data?.leaderboard || [])
    : (soloQuery.data?.leaderboard || []);

  const isLoading = tab === 'ranked' ? rankedQuery.isLoading : soloQuery.isLoading;

  // Mock data for display
  const mockEntries: LeaderboardEntry[] = Array.from({ length: 20 }, (_, i) => ({
    rank: i + 1,
    username: `Player${i + 1}`,
    score: Math.floor(2000 - i * 80 + Math.random() * 50),
    wins: Math.floor(50 - i * 2),
    losses: Math.floor(10 + i * 1.5),
    gamesPlayed: Math.floor(60 + i * 3),
    winRate: Math.floor(80 - i * 2),
    eloRating: Math.floor(2000 - i * 80),
    avatar: ['🧑‍💻', '👩‍🔬', '🧑‍🎓', '👨‍🚀'][i % 4],
  }));

  const displayEntries = entries.length > 0 ? entries : mockEntries;

  return (
    <div className="min-h-screen p-4 md:p-6 relative">
      <DotGrid dotSize={3} gap={32} baseColor="rgba(252,238,9,0.08)" activeColor="#FCEE09" proximity={100} />
      <Noise opacity={0.02} />
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 animate-neon-pulse-violet">
              <Trophy className="h-6 w-6 text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold">
              <GlitchText speed={0.5} enableShadows={false} enableOnHover>Leaderboard</GlitchText>
            </h1>
          </div>
          <p className="text-muted-foreground">
            <GradientText colors={['#FCEE09', '#f59e0b', '#ef4444', '#FCEE09']} animationSpeed={4} className="text-sm">
              See how you rank against the best
            </GradientText>
          </p>
        </motion.div>

        {/* Platform stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: <Users className="h-4 w-4" />, label: 'Competitors', value: '50K+', color: 'text-primary', spot: 'rgba(252,238,9,0.12)' },
            { icon: <Sword className="h-4 w-4" />, label: 'Battles Today', value: '2.4K', color: 'text-blue-400', spot: 'rgba(59,130,246,0.12)' },
            { icon: <TrendingUp className="h-4 w-4" />, label: 'Active Now', value: '342', color: 'text-emerald-400', spot: 'rgba(16,185,129,0.12)' },
          ].map((s) => (
            <SpotlightCard key={s.label} className="game-card p-3 text-center" spotlightColor={s.spot}>
              <div className={cn("flex justify-center mb-1", s.color)}>{s.icon}</div>
              <div className={cn("text-xl font-bold", s.color)}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </SpotlightCard>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="ranked" className="flex-1 gap-2">
              <Trophy className="h-3.5 w-3.5" /> Ranked 1v1
            </TabsTrigger>
            <TabsTrigger value="solo" className="flex-1 gap-2">
              <Star className="h-3.5 w-3.5" /> Solo Challenges
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Solo mode selector */}
        {tab === 'solo' && (
          <div className="flex flex-wrap gap-2 mb-4">
            {GAME_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setSoloMode(m.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                  soloMode === m.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/30"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Top 3 podium */}
        {displayEntries.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-6 py-6">
            {[displayEntries[1], displayEntries[0], displayEntries[2]].map((entry, i) => {
              const positions = [2, 1, 3];
              const heights = ['h-24', 'h-32', 'h-20'];
              const pos = positions[i];
              return (
                <motion.div
                  key={entry.username}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <Avatar size="lg">
                    <AvatarFallback emoji={entry.avatar || '🧑‍💻'} />
                  </Avatar>
                  <p className="text-sm font-semibold text-foreground">{entry.username}</p>
                  <p className="text-xs text-muted-foreground">{entry.score.toLocaleString()}</p>
                  <div
                    className={cn("w-20 rounded-t-xl flex items-center justify-center", heights[i])}
                    style={{
                      background: pos === 1
                        ? 'linear-gradient(to top, oklch(0.78 0.18 80 / 0.3), oklch(0.78 0.18 80 / 0.1))'
                        : pos === 2
                        ? 'linear-gradient(to top, oklch(0.6 0 0 / 0.3), oklch(0.6 0 0 / 0.1))'
                        : 'linear-gradient(to top, oklch(0.6 0.18 30 / 0.3), oklch(0.6 0.18 30 / 0.1))',
                      border: '1px solid oklch(0.35 0.04 280 / 0.4)',
                    }}
                  >
                    <span className="text-2xl">{pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉'}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {displayEntries.map((entry, i) => (
              <LeaderboardRow key={entry.username} entry={entry} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

