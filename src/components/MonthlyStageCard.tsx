import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store';
import { calcMonthlyProgress, monthName } from '../utils';
import { ProgressBar } from './ProgressBar';
import { InlineEdit } from './InlineEdit';
import { AddInline } from './AddInline';
import { WeeklyGoalCard } from './WeeklyGoalCard';
import type { MonthlyStage, GoalColor } from '../types';
import { GOAL_COLORS } from '../types';

interface Props { stage: MonthlyStage; goalId: string; color: GoalColor; extraBadge?: string }

export function MonthlyStageCard({ stage, goalId, color, extraBadge }: Props) {
  const { updateMonthlyStage, deleteMonthlyStage, addWeeklyGoal } = useStore();
  const [exp, setExp] = useState(true);
  const progress = calcMonthlyProgress(stage);
  const hex = GOAL_COLORS[color];
  const nextW = stage.weeklyGoals.length > 0
    ? Math.max(...stage.weeklyGoals.map(w => w.weekNumber)) + 1
    : 1;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,.9)',
        border: `1.5px solid ${hex}28`,
        boxShadow: `0 2px 16px ${hex}12`,
      }}>

      {/* Colored top stripe */}
      <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg,${hex},${hex}40,transparent)` }} />

      <div className="px-4 pt-3.5 pb-3">

        {/* Header row */}
        <div className="flex items-center gap-2 group/m">

          {/* Expand toggle */}
          <button onClick={() => setExp(!exp)} className="btn btn-ghost btn-icon btn-sm shrink-0"
            style={{ width: 26, height: 26, padding: 4, color: '#c4a0b8' }}>
            {exp ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {/* Month badge */}
          <div className="flex items-center gap-2 shrink-0 px-2.5 py-1 rounded-xl"
            style={{ background: `${hex}18`, border: `1px solid ${hex}28` }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hex, boxShadow: `0 0 5px ${hex}` }} />
            <span className="text-[13px] font-black" style={{ color: hex }}>
              {monthName(stage.month)} {stage.year}
            </span>
          </div>

          {/* Description — most visible part */}
          <div className="flex-1 min-w-0 ml-1">
            <InlineEdit
              value={stage.title}
              onSave={(v) => updateMonthlyStage(goalId, stage.id, v)}
              className="text-[13px] font-semibold"
              style={{ color: '#5a2a4a' }}
              placeholder="Описание этапа..." />
          </div>

          {/* Task badge */}
          {extraBadge && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
              style={{ background: `${hex}15`, color: hex, border: `1px solid ${hex}28` }}>
              {extraBadge}
            </span>
          )}

          {/* Progress */}
          <div className="w-[100px] shrink-0 flex items-center gap-2">
            <ProgressBar progress={progress} color={color} size="sm" showLabel />
          </div>

          {/* Delete */}
          <button onClick={() => deleteMonthlyStage(goalId, stage.id)}
            className="btn btn-ghost btn-icon btn-sm shrink-0 opacity-0 group-hover/m:opacity-100"
            style={{ width: 26, height: 26, padding: 4, color: '#d4b8cc' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#d4b8cc'; (e.currentTarget as HTMLButtonElement).style.background = ''; }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expanded content */}
        {exp && (
          <div className="mt-3 space-y-0.5">
            {stage.weeklyGoals.length === 0 ? (
              <div className="ml-8 mb-2">
                <AddInline placeholder="Описание цели недели..." label="Добавить неделю"
                  onAdd={(v) => addWeeklyGoal(goalId, stage.id, v, nextW)} />
              </div>
            ) : (
              <>
                {stage.weeklyGoals.map(w => (
                  <WeeklyGoalCard key={w.id} week={w} goalId={goalId} stageId={stage.id} color={color} />
                ))}
                <div className="ml-8 mt-1">
                  <AddInline placeholder="Описание цели недели..." label="Добавить неделю"
                    onAdd={(v) => addWeeklyGoal(goalId, stage.id, v, nextW)} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
