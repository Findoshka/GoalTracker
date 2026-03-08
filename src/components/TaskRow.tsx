import { useState } from 'react';
import { Check, Trash2, CalendarDays } from 'lucide-react';

interface Props {
  title: string;
  completed: boolean;
  meta?: string;
  goalColor?: string;
  goalName?: string;
  highlight?: boolean;
  dueDate?: string;
  onToggle: () => void;
  onDelete: () => void;
  onDateChange?: (date: string) => void;
}

export function TaskRow({ title, completed, meta, goalColor, goalName, highlight, dueDate, onToggle, onDelete, onDateChange }: Props) {
  const [pop, setPop] = useState(false);
  const [editDate, setEditDate] = useState(false);

  const toggle = () => {
    setPop(true);
    onToggle();
    setTimeout(() => setPop(false), 350);
  };

  return (
    <div className={`flex items-center gap-3 group/t min-h-[42px] px-3 -mx-3 rounded-2xl transition-all duration-200
      ${highlight ? '' : 'hover:bg-pink-50/60'}`}
      style={highlight ? { background: 'rgba(249,168,212,.08)', border: '1px solid rgba(249,168,212,.2)' } : {}}>

      {/* Checkbox */}
      <button onClick={toggle}
        className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${pop ? 'ani-check' : ''}`}
        style={{
          borderColor: completed ? (goalColor || '#e88cc4') : 'rgba(217,125,186,.3)',
          backgroundColor: completed ? (goalColor || '#e88cc4') : 'transparent',
          boxShadow: completed ? `0 0 8px ${goalColor || '#e88cc4'}66` : 'none',
        }}>
        {completed && <Check className="w-[10px] h-[10px] text-white" strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className={`text-[13px] font-medium block truncate transition-all ${completed ? 'line-through' : ''}`}
          style={{ color: completed ? '#d4b8cc' : '#6a3050' }}>
          {title}
        </span>
        {(meta || goalName) && (
          <div className="flex items-center gap-2 mt-[1px]">
            {meta && <span className="text-[11px]" style={{ color: '#d4a0c0' }}>{meta}</span>}
            {goalName && (
              <span className="text-[11px] flex items-center gap-1" style={{ color: '#d4a0c0' }}>
                {goalColor && <span className="w-[5px] h-[5px] rounded-full inline-block" style={{ backgroundColor: goalColor }} />}
                {goalName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Date picker */}
      {onDateChange && (
        <div className="shrink-0">
          {editDate ? (
            <input type="date" autoFocus value={dueDate || ''} onChange={e => { onDateChange(e.target.value); setEditDate(false); }}
              onBlur={() => setEditDate(false)}
              className="text-[11px] bg-transparent outline-none cursor-pointer [color-scheme:light] w-[105px]"
              style={{ color: '#c0628f' }} />
          ) : (
            <button onClick={() => setEditDate(true)}
              className="p-1.5 rounded-lg opacity-0 group-hover/t:opacity-100 transition-all"
              style={{ color: '#d4a0c0' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c0628f'; (e.currentTarget as HTMLElement).style.background = 'rgba(249,168,212,.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#d4a0c0'; (e.currentTarget as HTMLElement).style.background = ''; }}
              title={dueDate ? `Дата: ${dueDate}` : 'Назначить дату'}>
              <CalendarDays className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Delete */}
      <button onClick={onDelete}
        className="p-1.5 rounded-lg opacity-0 group-hover/t:opacity-100 transition-all"
        style={{ color: '#d4a0c0' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#d4a0c0'; (e.currentTarget as HTMLElement).style.background = ''; }}>
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
