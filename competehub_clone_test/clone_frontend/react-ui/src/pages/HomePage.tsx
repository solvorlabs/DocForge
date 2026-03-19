import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Sword, Star, Zap, Users, ChevronRight, Flame } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { GAME_MODES } from '../lib/constants';
import GameModeCard from '../components/shared/GameModeCard';
import StatCard from '../components/shared/StatCard';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { ClickSpark } from '../components/reactbits/ClickSpark';
import { ShinyText } from '../components/reactbits/ShinyText';
import { DotGrid } from '../components/reactbits/DotGrid';
import { GlitchText } from '../components/reactbits/GlitchText';
import { DecryptedText } from '../components/reactbits/DecryptedText';
import { GradientText } from '../components/reactbits/GradientText';
import { ElectricBorder } from '../components/reactbits/ElectricBorder';
import { Noise } from '../components/reactbits/Noise';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function HomePage() {
  const { user, getProgression } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    getProgression().catch(() => {});
  }, []);

  const xpForNext = user ? Math.floor(100 * Math.pow(1.5, (user.level || 1) - 1)) : 100;
  const xpPercent = user ? Math.min(100, ((user.xp || 0) / xpForNext) * 100) : 0;

  const coreGames = GAME_MODES.filter(m => m.category === 'core');
  const puzzleGames = GAME_MODES.filter(m => m.category === 'puzzle');
  const battleGames = GAME_MODES.filter(m => m.category === 'battle');
  const speedGames = GAME_MODES.filter(m => m.category === 'speedrun');

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 relative">
      {/* Interactive dot grid background */}
      <DotGrid
        dotSize={3}
        gap={28}
        baseColor="rgba(252,238,9,0.12)"
        activeColor="#FCEE09"
        proximity={120}
        style={{ zIndex: 0 }}
      />
      {/* Noise overlay */}
      <Noise opacity={0.02} />

      <div className="relative z-10">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Welcome back,{' '}
                <ShinyText text={user?.username || 'Warrior'} className="text-3xl font-bold" speed={4} />{' '}
                <span className="animate-float inline-block">👋</span>
              </h1>
              <p className="text-muted-foreground">
                <DecryptedText
                  text="Ready to dominate today?"
                  animateOn="view"
                  speed={3}
                  revealDirection="start"
                />
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="purple" className="gap-1 animate-neon-pulse-violet">
                <Zap className="h-3 w-3" /> Level {user?.level || 1}
              </Badge>
              <Badge variant="gold" className="gap-1">
                <Trophy className="h-3 w-3" /> {user?.wins || 0} Wins
              </Badge>
            </div>
          </div>

          {/* XP bar */}
          {user && (
            <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Level {user.level} Progress</span>
                <span className="font-mono text-primary">{user.xp} / {xpForNext} XP</span>
              </div>
              <Progress value={xpPercent} max={100} color="linear-gradient(90deg, oklch(0.93 0.21 103), oklch(0.62 0.28 20))" />
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
        >
          <motion.div variants={item}>
            <StatCard label="Total Wins" value={user?.wins || 0} icon={<Trophy className="h-5 w-5" />} color="text-yellow-400" />
          </motion.div>
          <motion.div variants={item}>
            <StatCard label="Games Played" value={user?.gamesPlayed || 0} icon={<Sword className="h-5 w-5" />} color="text-primary" />
          </motion.div>
          <motion.div variants={item}>
            <StatCard
              label="Win Rate"
              value={user && user.gamesPlayed ? `${Math.round((user.wins / user.gamesPlayed) * 100)}%` : '0%'}
              icon={<Star className="h-5 w-5" />}
              color="text-emerald-400"
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard label="Total XP" value={`${user?.totalXP || 0} XP`} icon={<Zap className="h-5 w-5" />} color="text-blue-400" />
          </motion.div>
        </motion.div>

        {/* Quick Access */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-bold">
              <GradientText colors={['#FCEE09', '#ef4444', '#FCEE09']} animationSpeed={3}>Quick Play</GradientText>
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ClickSpark sparkColor="#FCEE09" sparkCount={10}>
              <ElectricBorder color="#FCEE09" speed={4} borderRadius={8}>
                <Button
                  className="h-auto py-4 flex-col gap-2 gradient-primary border-0 w-full"
                  onClick={() => navigate('/custom-rooms')}
                >
                  <Users className="h-5 w-5" />
                  <span className="text-xs">5v5 Battle</span>
                </Button>
              </ElectricBorder>
            </ClickSpark>
            <ClickSpark sparkColor="#eab308" sparkCount={10}>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-400 w-full"
                onClick={() => navigate('/ranked')}
              >
                <Trophy className="h-5 w-5" />
                <span className="text-xs">Ranked</span>
              </Button>
            </ClickSpark>
            <ClickSpark sparkColor="#34d399" sparkCount={10}>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-400 w-full"
                onClick={() => navigate('/solo-challenge')}
              >
                <Star className="h-5 w-5" />
                <span className="text-xs">Solo</span>
              </Button>
            </ClickSpark>
          </div>
        </div>

        {/* Core Modes */}
        <GameSection title="Core Modes" icon={<Sword className="h-4 w-4" />} onSeeAll={() => navigate('/custom-rooms')}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coreGames.map((mode) => (
              <GameModeCard key={mode.id} mode={mode} />
            ))}
          </div>
        </GameSection>

        {/* Battle Games */}
        <GameSection title="Battle Games" icon={<span>⚔️</span>} onSeeAll={() => {}}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {battleGames.map((mode) => (
              <GameModeCard key={mode.id} mode={mode} />
            ))}
          </div>
        </GameSection>

        {/* Puzzle Games */}
        <GameSection title="Puzzle Games" icon={<span>🧩</span>} onSeeAll={() => {}}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {puzzleGames.map((mode) => (
              <GameModeCard key={mode.id} mode={mode} />
            ))}
          </div>
        </GameSection>

        {/* Speed Games */}
        <GameSection title="Speedrun" icon={<span>⚡</span>} onSeeAll={() => {}}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {speedGames.map((mode) => (
              <GameModeCard key={mode.id} mode={mode} />
            ))}
          </div>
        </GameSection>

        {/* Daily challenge banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-6 rounded-2xl relative overflow-hidden cursor-pointer"
          style={{ background: 'linear-gradient(135deg, oklch(0.93 0.21 103 / 0.15), oklch(0.62 0.28 20 / 0.15))' }}
          onClick={() => navigate('/solo-challenge')}
        >
          <div className="absolute inset-0 grid-bg-intense opacity-20" />
          <Noise opacity={0.025} />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg animate-float inline-block">🔥</span>
                <span
                  className="text-sm font-semibold animate-neon-pulse-red"
                  style={{ color: 'oklch(0.72 0.28 20)', textShadow: '0 0 8px oklch(0.62 0.28 20 / 0.5)' }}
                >
                  <GlitchText speed={0.4} enableShadows={false} enableOnHover>Daily Challenge</GlitchText>
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                <DecryptedText text="Complete 5 JEE questions" animateOn="view" speed={2} />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Earn 500 bonus XP today!</p>
            </div>
            <div className="flex-shrink-0">
              <ClickSpark sparkColor="#ef4444" sparkCount={10}>
                <Button className="gradient-red-violet border-0 gap-1 glow-red">
                  Play Now <ChevronRight className="h-4 w-4" />
                </Button>
              </ClickSpark>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function GameSection({ title, icon, children, onSeeAll }: { title: string; icon: React.ReactNode; children: React.ReactNode; onSeeAll: () => void }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
        <button
          onClick={onSeeAll}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          See all <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      {children}
    </div>
  );
}
