import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sword, X, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useUser } from '../contexts/UserContext';
import RankBadge from '../components/shared/RankBadge';
import { Aurora } from '../components/reactbits/Aurora';
import { Noise } from '../components/reactbits/Noise';
import { GlitchText } from '../components/reactbits/GlitchText';
import { ElectricBorder } from '../components/reactbits/ElectricBorder';
import { ClickSpark } from '../components/reactbits/ClickSpark';
import { Lightning } from '../components/reactbits/Lightning';
import { GradientText } from '../components/reactbits/GradientText';

export default function RankedSearch() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searching, setSearching] = useState(false);
  const [waitTime, setWaitTime] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (searching) {
      timer = setInterval(() => setWaitTime(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [searching]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-background grid-bg-intense flex items-center justify-center p-6 relative overflow-hidden">
      {/* Aurora background */}
      <Aurora
        colorStops={['#3b0764', '#7c3aed', '#ef4444', '#0e7490']}
        amplitude={1.0}
        speed={0.7}
        style={{ opacity: 0.5 }}
      />
      <div className="absolute inset-0 scanlines opacity-30" />
      <Noise opacity={0.03} />

      {/* Lightning corners */}
      {searching && (
        <>
          <div className="absolute top-0 left-0 w-48 h-full opacity-20 pointer-events-none">
            <Lightning hue={270} speed={0.5} intensity={0.8} size={0.8} />
          </div>
          <div className="absolute top-0 right-0 w-48 h-full opacity-20 pointer-events-none">
            <Lightning hue={10} speed={0.4} intensity={0.6} size={0.7} />
          </div>
        </>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center relative z-10"
      >
        <div className="game-card p-8 relative overflow-hidden">
          <Noise opacity={0.025} />
          {!searching ? (
            <>
              <motion.div
                className="text-5xl mb-4"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              >
                ⚔️
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">
                <GlitchText speed={0.5} enableShadows={false} enableOnHover>Find a Match</GlitchText>
              </h2>
              <p className="text-muted-foreground mb-2">
                Current ELO:{' '}
                <span className="text-foreground font-semibold font-mono">
                  {user?.eloRating || 1200}
                </span>
              </p>
              <RankBadge elo={user?.eloRating || 1200} size="md" className="mb-6" />
              <ClickSpark sparkColor="#a855f7" sparkCount={14}>
                <ElectricBorder color="#a855f7" speed={3} borderRadius={8}>
                  <Button
                    className="w-full h-12 gradient-primary border-0 gap-2 glow-primary"
                    onClick={() => setSearching(true)}
                  >
                    <Sword className="h-4 w-4" /> Start Matchmaking
                  </Button>
                </ElectricBorder>
              </ClickSpark>
              <Button variant="ghost" className="w-full mt-2" onClick={() => navigate('/ranked')}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              {/* Animated search rings */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-primary/15 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-primary/25 animate-ping" style={{ animationDelay: '0.25s' }} />
                <div className="absolute inset-4 rounded-full border-2 border-primary/40 animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute inset-6 rounded-full border-2 border-primary/60 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center text-4xl animate-float">
                  ⚔️
                </div>
              </div>
              <h2 className="text-xl font-bold mb-1">
                <GradientText colors={['#a855f7', '#ef4444', '#06b6d4', '#a855f7']} animationSpeed={2}>
                  Searching for opponent...
                </GradientText>
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(waitTime)}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Matching near ELO <span className="text-primary font-semibold">{user?.eloRating || 1200}</span>
              </p>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => { setSearching(false); setWaitTime(0); }}
              >
                <X className="h-4 w-4" /> Cancel Search
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
