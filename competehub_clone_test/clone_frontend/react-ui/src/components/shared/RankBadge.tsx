import { RANK_TIERS, getRankFromElo } from '../../lib/constants';
import { cn } from '../../lib/utils';

interface RankBadgeProps {
  elo?: number;
  size?: 'sm' | 'md' | 'lg';
  showElo?: boolean;
  className?: string;
}

export default function RankBadge({ elo = 1200, size = 'md', showElo = false }: RankBadgeProps) {
  const rank = getRankFromElo(elo);
  const { color, icon } = RANK_TIERS[rank];

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        sizeClasses[size]
      )}
      style={{
        color,
        borderColor: `${color}50`,
        background: `${color}15`,
      }}
    >
      <span>{icon}</span>
      <span>{rank}</span>
      {showElo && <span className="opacity-70">{elo}</span>}
    </span>
  );
}
