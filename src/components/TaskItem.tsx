import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { InlineEdit } from './InlineEdit';
import type { Task, GoalColor } from '../types';
import { GOAL_COLORS } from '../types';

interface Props { task: Task; goalId: string; stageId: string; weekId: string; color: GoalColor }

export function TaskItem({ task, goalId, stageId, weekId, color }: Props) {
  const { toggleTask, updateTask, deleteTask } = useStore();
  const hex = GOAL_COLORS[color];
  const [pop, setPop] = useState(false);

  const toggle = () => {
    setPop(true);
    toggleTask(goalId, stageId, weekId, task.id);
    setTimeout(() => setPop(false), 350);
  };

  return (
    <div className="flex items-center gap-[10px] group/t h-[34px] px-1 -mx-1 rounded-xl transition-all hover:bg-pink-50/60">
      <button onClick={toggle}
        className={`w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${pop ? 'ani-check' : ''}`}
        style={{
          borderColor: task.completed ? hex : 'rgba(217,125,186,.3)',
          backgroundColor: task.completed ? hex : 'transparent',
          boxShadow: task.completed ? `0 0 6px ${hex}66` : 'none',
        }}>
        {task.completed && <Check className="w-[9px] h-[9px] text-white" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <InlineEdit value={task.title} onSave={(v) => updateTask(goalId, stageId, weekId, task.id, v)}
          className={`text-[13px] font-medium ${task.completed ? 'line-through' : ''}`}
          style={{ color: task.completed ? '#d4b8cc' : '#6a3050' }} />
      </div>
      <button onClick={() => deleteTask(goalId, stageId, weekId, task.id)}
        className="p-1 rounded-lg opacity-0 group-hover/t:opacity-100 transition-all"
        style={{ color: '#d4a0c0' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#d4a0c0'; (e.currentTarget as HTMLElement).style.background = ''; }}>
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
