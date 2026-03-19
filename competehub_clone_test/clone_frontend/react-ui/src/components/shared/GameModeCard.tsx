import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Lock, Play, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import type { GameMode } from '../../types';
import { GlareHover } from '../reactbits/GlareHover';

interface GameModeCardProps {
  mode: GameMode;
  compact?: boolean;
}

const difficultyColors: Record<string, string> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'red',
  All: 'purple',
};

export default function GameModeCard({ mode, compact = false }: GameModeCardProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <GlareHover glareOpacity={0.1} glareSize={60}>
        <motion.div
          whileHover={{ scale: mode.available ? 1.02 : 1 }}
          className={cn(
            "game-card p-4 cursor-pointer relative overflow-hidden",
            !mode.available && "opacity-60"
          )}
          onClick={() => mode.available && navigate(mode.route)}
        >
          <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${mode.color}`} />
          <div className="flex items-center gap-3">
            <span className="text-2xl">{mode.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">{mode.title}</h3>
              <p className="text-xs text-muted-foreground">{mode.players} players</p>
            </div>
            {!mode.available && <Lock className="h-4 w-4 text-muted-foreground" />}
            {mode.available && <ArrowRight className="h-4 w-4 text-primary" />}
          </div>
        </motion.div>
      </GlareHover>
    );
  }

  return (
    <GlareHover glareOpacity={0.1} glareSize={55}>
      <motion.div
        whileHover={{ scale: mode.available ? 1.01 : 1 }}
        whileTap={{ scale: mode.available ? 0.99 : 1 }}
        className={cn(
          "game-card relative overflow-hidden cursor-pointer group",
          !mode.available && "opacity-70"
        )}
      >
        {/* Top gradient bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${mode.color}`} />

        {/* Not available overlay */}
        {!mode.available && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 rounded-xl">
            <Badge variant="outline" className="gap-1.5 border-border bg-background/80">
              <Lock className="h-3 w-3" /> Coming Soon
            </Badge>
          </div>
        )}

        {/* Card image */}
        {mode.image && (
          <div className="relative h-36 overflow-hidden rounded-t-xl">
            <img
              src={mode.image}
              alt={mode.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 doodle-card-img"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent" />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{mode.icon}</span>
              <div>
                <h3 className="font-bold text-foreground leading-tight">{mode.title}</h3>
                {mode.players && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{mode.players}</span>
                  </div>
                )}
              </div>
            </div>
            <Badge variant={difficultyColors[mode.difficulty] as Parameters<typeof Badge>[0]['variant']}>
              {mode.difficulty}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{mode.description}</p>

          {/* Features */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {mode.features.slice(0, 3).map((f) => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {f}
              </span>
            ))}
          </div>

          {/* Play button */}
          {mode.available && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(mode.route)}
              className={`w-full py-2 px-4 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 bg-gradient-to-r ${mode.color} hover:opacity-90 transition-opacity`}
            >
              <Play className="h-3.5 w-3.5" /> Play Now
            </motion.button>
          )}
        </div>
      </motion.div>
    </GlareHover>
  );
}
