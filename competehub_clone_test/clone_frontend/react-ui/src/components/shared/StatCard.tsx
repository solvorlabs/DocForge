import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  trend?: { value: number; label: string };
  className?: string;
}

export default function StatCard({ label, value, icon, color = 'text-primary', trend, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("game-card p-4", className)}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        {icon && <span className={cn("text-lg", color)}>{icon}</span>}
      </div>
      <p className={cn("text-2xl font-bold", color)}>{value}</p>
      {trend && (
        <p className={cn(
          "text-xs mt-1",
          trend.value >= 0 ? "text-emerald-400" : "text-red-400"
        )}>
          {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)} {trend.label}
        </p>
      )}
    </motion.div>
  );
}
