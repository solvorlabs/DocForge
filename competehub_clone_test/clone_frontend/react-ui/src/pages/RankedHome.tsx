import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, ChevronRight, Sword, History } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { rankedApi } from '../lib/api';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import RankBadge from '../components/shared/RankBadge';
import { getRankFromElo, RANK_TIERS } from '../lib/constants';
import type { RankedMatch } from '../types';
import { SpotlightCard } from '../components/reactbits/SpotlightCard';
import { GlitchText } from '../components/reactbits/GlitchText';
import { GradientText } from '../components/reactbits/GradientText';
import { Lightning } from '../components/reactbits/Lightning';
import { ElectricBorder } from '../components/reactbits/ElectricBorder';
import { ClickSpark } from '../components/reactbits/ClickSpark';
import { Noise } from '../components/reactbits/Noise';

export default function RankedHome() {
  const navigate = useNavigate();
  const { user } = useUser();
  const elo = user?.eloRating || 1200;
  const rank = getRankFromElo(elo);
  const { color, icon } = RANK_TIERS[rank];

  const historyQuery = useQuery({
    queryKey: ['ranked-history'],
    queryFn: () => rankedApi.getHistory(10) as Promise<{ matches: RankedMatch[] }>,
  });

  const matches: RankedMatch[] = historyQuery.data?.matches || Array.from({ length: 5 }, (_, i) => ({
    _id: String(i),
    opponent: `Player${i + 1}`,
    opponentElo: 1200 + i * 50,
    result: i % 3 === 0 ? 'loss' : 'win',
    eloChange: i % 3 === 0 ? -18 : 22,
    date: new Date(Date.now() - i * 86400000).toISOString(),
  }));

  const wins = matches.filter(m => m.result === 'win').length;
  const losses = matches.filter(m => m.result === 'loss').length;
  const winRate = matches.length ? Math.round((wins / matches.length) * 100) : 0;

  return (
    <div className="min-h-screen p-4 md:p-6 relative">
      {/* Lightning bg effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <Lightning hue={55} speed={0.25} intensity={0.4} size={0.6} />
      </div>
      <Noise opacity={0.025} />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold mb-1">
            <GlitchText speed={0.4} enableShadows={false} enableOnHover>Ranked Mode</GlitchText>
          </h1>
          <p className="text-muted-foreground">
            <GradientText colors={['#FCEE09', '#f59e0b', '#ef4444', '#FCEE09']} animationSpeed={4} className="text-sm">
              Climb the competitive ladder
            </GradientText>
          </p>
        </motion.div>

        {/* Rank Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
        <SpotlightCard className="game-card p-6 relative overflow-hidden" spotlightColor="rgba(252,238,9,0.12)">
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

          <div className="flex items-center gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border-2"
              style={{ borderColor: `${color}50`, background: `${color}15` }}
            >
              {icon}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-black" style={{ color }}>{elo}</span>
                <span className="text-muted-foreground text-sm">ELO Rating</span>
              </div>
              <RankBadge elo={elo} size="lg" />
              <div className="flex gap-4 mt-3 text-sm">
                <div><span className="text-emerald-400 font-bold">{wins}W</span> <span className="text-muted-foreground text-xs">wins</span></div>
                <div><span className="text-red-400 font-bold">{losses}L</span> <span className="text-muted-foreground text-xs">losses</span></div>
                <div><span className="text-foreground font-bold">{winRate}%</span> <span className="text-muted-foreground text-xs">win rate</span></div>
              </div>
            </div>
          </div>
        </SpotlightCard>
        </motion.div>

        {/* Find Match Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <ClickSpark sparkColor="#FCEE09" sparkCount={16}>
            <ElectricBorder color="#FCEE09" speed={3} borderRadius={8}>
              <Button
                className="w-full h-14 text-base gap-3 glow-primary"
                style={{ background: 'linear-gradient(135deg, oklch(0.93 0.21 103), oklch(0.62 0.28 20))', border: 'none', color: 'white' }}
                onClick={() => navigate('/ranked/search')}
              >
                <Sword className="h-5 w-5" />
                Find Match
                <ChevronRight className="h-5 w-5" />
              </Button>
            </ElectricBorder>
          </ClickSpark>
        </motion.div>

        {/* Rank Tiers */}
        <div className="game-card p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-3">Rank Tiers</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(RANK_TIERS).map(([tier, info]) => (
              <div
                key={tier}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${rank === tier ? 'border-primary/50 bg-primary/10' : 'border-border bg-muted/30'}`}
              >
                <span>{info.icon}</span>
                <span className="font-medium" style={{ color: info.color }}>{tier}</span>
                <span className="text-xs text-muted-foreground ml-auto">{info.min}+</span>
              </div>
            ))}
          </div>
        </div>

        {/* Match History */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Recent Matches</h3>
          </div>
          <div className="space-y-2">
            {historyQuery.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
            ) : (
              matches.map((match) => (
                <div key={match._id} className="game-card p-4 flex items-center gap-4">
                  {match.result === 'win'
                    ? <TrendingUp className="h-5 w-5 text-emerald-400 shrink-0" />
                    : <TrendingDown className="h-5 w-5 text-red-400 shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">vs {match.opponent}</p>
                    <p className="text-xs text-muted-foreground">{new Date(match.date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={match.result === 'win' ? 'success' : 'red'}>
                    {match.result === 'win' ? 'Win' : 'Loss'}
                  </Badge>
                  <div className={`text-sm font-bold ${match.eloChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {match.eloChange >= 0 ? '+' : ''}{match.eloChange}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
