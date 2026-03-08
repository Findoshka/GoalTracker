import { GOAL_COLORS, type GoalColor } from '../types';

interface Props {
  progress: number;
  color: GoalColor;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  glow?: boolean;
}

export function ProgressBar({ progress, color, size = 'md', showLabel = false, glow = false }: Props) {
  const h = size === 'sm' ? 'h-[3px]' : size === 'lg' ? 'h-[8px]' : 'h-[5px]';
  const hex = GOAL_COLORS[color];
  const pct = Math.min(progress, 100);

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 rounded-full overflow-hidden ${h}`} style={{ background: 'rgba(200,150,180,.15)' }}>
        <div className={`${h} rounded-full ani-bar transition-all`}
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${hex}, ${hex}dd)`,
            boxShadow: glow ? `0 0 10px ${hex}88` : undefined,
            minWidth: pct > 0 ? 6 : 0,
          }} />
      </div>
      {showLabel && (
        <span className="text-[11px] font-bold tabular-nums shrink-0" style={{ color: hex, minWidth: 32, textAlign: 'right' }}>{pct}%</span>
      )}
    </div>
  );
}
