import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store';
import { calcWeeklyProgress } from '../utils';
import { ProgressBar } from './ProgressBar';
import { InlineEdit } from './InlineEdit';
import { AddInline } from './AddInline';
import { TaskItem } from './TaskItem';
import type { WeeklyGoal, GoalColor } from '../types';
import { GOAL_COLORS } from '../types';

interface Props { week: WeeklyGoal; goalId: string; stageId: string; color: GoalColor }

export function WeeklyGoalCard({ week, goalId, stageId, color }: Props) {
  const { updateWeeklyGoal, deleteWeeklyGoal, addTask } = useStore();
  const [exp, setExp] = useState(true);
  const progress = calcWeeklyProgress(week);
  const hex = GOAL_COLORS[color];
  const done = week.tasks.filter(t => t.completed).length;

  return (
    <div className="ml-4 pl-4 relative" style={{ borderLeft: `2px solid ${hex}35` }}>
      {/* Timeline dot */}
      <div className="absolute -left-[5px] top-[14px] w-2.5 h-2.5 rounded-full border-2"
        style={{ backgroundColor: '#fdf6fa', borderColor: hex, boxShadow: `0 0 6px ${hex}55` }} />

      <div className="flex items-center gap-2 min-h-[36px] py-1 group/w rounded-xl px-1 transition-colors"
        style={{}}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(249,168,212,.06)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>

        <button onClick={() => setExp(!exp)} className="btn btn-ghost btn-icon btn-sm shrink-0"
          style={{ width: 24, height: 24, padding: 3, color: '#c4a0b8' }}>
          {exp ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {/* Week label */}
        <span className="text-[11px] font-black uppercase tracking-wider shrink-0 px-2 py-0.5 rounded-lg"
          style={{ color: hex, background: `${hex}18`, minWidth: 52, textAlign: 'center' }}>
          Нед {week.weekNumber}
        </span>

        {/* Title — main visible text */}
        <div className="flex-1 min-w-0">
          <InlineEdit value={week.title} onSave={(v) => updateWeeklyGoal(goalId, stageId, week.id, v)}
            className="text-[14px] font-semibold" style={{ color: '#4a1a3a' }} />
        </div>

        {/* Task count */}
        <span className="text-[12px] font-bold tabular-nums shrink-0 px-2 py-0.5 rounded-lg"
          style={{ color: done > 0 ? hex : '#c4a0b8', background: done > 0 ? `${hex}15` : 'rgba(200,160,184,.08)' }}>
          {done}/{week.tasks.length}
        </span>

        {/* Progress bar */}
        <div className="w-[64px] shrink-0">
          <ProgressBar progress={progress} color={color} size="sm" />
        </div>

        {/* Delete */}
        <button onClick={() => deleteWeeklyGoal(goalId, stageId, week.id)}
          className="btn btn-ghost btn-icon btn-sm opacity-0 group-hover/w:opacity-100 shrink-0"
          style={{ width: 22, height: 22, padding: 3, color: '#d4b8cc' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#d4b8cc'; (e.currentTarget as HTMLButtonElement).style.background = ''; }}>
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {exp && (
        <div className="ml-5 pb-2 space-y-0.5">
          {week.tasks.map(t => (
            <TaskItem key={t.id} task={t} goalId={goalId} stageId={stageId} weekId={week.id} color={color} />
          ))}
          <AddInline placeholder="Добавить задачу..." onAdd={(v) => addTask(goalId, stageId, week.id, v)} />
        </div>
      )}
    </div>
  );
}
