import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Plus, Check, GripVertical } from 'lucide-react';
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor,
  useSensor, useSensors, useDroppable, useDraggable,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { useStore } from '../store';
import { monthName, playMeow } from '../utils';
import { GOAL_COLORS } from '../types';

type CalTask =
  | { kind: 'inbox'; id: string; title: string; color: string; completed: boolean; dueDate: string }
  | { kind: 'goal'; goalId: string; stageId: string; weekId: string; taskId: string; title: string; color: string; completed: boolean; dueDate: string };

// ── Draggable task chip ───────────────────────────────────────────────────────
function DraggableTask({ t, onToggle }: { t: CalTask; onToggle: () => void }) {
  const id = t.kind === 'inbox' ? `inbox-${t.id}` : `goal-${t.taskId}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data: { task: t } });

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-1 group/task rounded-[5px] transition-all duration-150"
      style={{
        backgroundColor: `${t.color}18`,
        border: `1px solid ${t.color}28`,
        opacity: isDragging ? 0.3 : t.completed ? 0.45 : 1,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* drag handle */}
      <button
        {...listeners} {...attributes}
        className="shrink-0 ml-0.5 opacity-0 group-hover/task:opacity-60 transition-opacity cursor-grab active:cursor-grabbing"
        style={{ color: t.color, padding: '2px 1px', touchAction: 'none' }}
        tabIndex={-1}
      >
        <GripVertical className="w-2.5 h-2.5" />
      </button>
      <button
        className="shrink-0 w-[14px] h-[14px] rounded-[3px] flex items-center justify-center transition-all duration-150"
        style={{
          background: t.completed ? t.color : 'transparent',
          border: `1.5px solid ${t.completed ? t.color : `${t.color}70`}`,
        }}
        onClick={e => { e.stopPropagation(); onToggle(); }}
      >
        {t.completed && <Check className="w-2 h-2" style={{ color: '#fff', strokeWidth: 3 }} />}
      </button>
      <span
        className="text-[10px] font-semibold py-[3px] pr-1.5 truncate flex-1 transition-all duration-150"
        style={{ color: t.color, textDecoration: t.completed ? 'line-through' : 'none' }}
      >
        {t.title}
      </span>
    </div>
  );
}

// ── Droppable day cell wrapper ────────────────────────────────────────────────
function DroppableCell({ date, children, isOver }: { date: string; children: React.ReactNode; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: `day-${date}`, data: { date } });
  return (
    <div ref={setNodeRef} className="flex-1 overflow-hidden space-y-[3px]"
      style={{
        minHeight: 24,
        borderRadius: 6,
        background: isOver ? 'rgba(249,168,212,.12)' : 'transparent',
        border: isOver ? '1.5px dashed rgba(249,168,212,.6)' : '1.5px solid transparent',
        transition: 'all .15s',
      }}>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function CalendarView() {
  const { inbox, goals, addInboxTask, toggleInboxTask, toggleTask, updateInboxTask, rescheduleTask } = useStore();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [addingCell, setAddingCell] = useState<string | null>(null);
  const [cellDraft, setCellDraft] = useState('');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [draggingTask, setDraggingTask] = useState<CalTask | null>(null);
  const [overDate, setOverDate] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const prev = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); };

  const commitCell = (date: string) => {
    if (cellDraft.trim()) addInboxTask(cellDraft.trim(), date);
    setCellDraft(''); setAddingCell(null);
  };

  const tasksByDate = useMemo(() => {
    const map: Record<string, CalTask[]> = {};
    inbox.forEach(t => {
      if (t.dueDate) {
        if (!map[t.dueDate]) map[t.dueDate] = [];
        map[t.dueDate].push({ kind: 'inbox', id: t.id, title: t.title, color: '#a78bfa', completed: t.completed, dueDate: t.dueDate });
      }
    });
    goals.forEach(g => {
      const c = GOAL_COLORS[g.color];
      g.monthlyStages.forEach(ms => ms.weeklyGoals.forEach(wg => wg.tasks.forEach(t => {
        if (t.dueDate) {
          if (!map[t.dueDate]) map[t.dueDate] = [];
          map[t.dueDate].push({ kind: 'goal', goalId: g.id, stageId: ms.id, weekId: wg.id, taskId: t.id, title: t.title, color: c, completed: t.completed, dueDate: t.dueDate });
        }
      })));
    });
    return map;
  }, [inbox, goals]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDow = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const cells: Array<{ day: number; date: string; isCurrentMonth: boolean }> = [];
  const prevMonthLast = new Date(year, month - 1, 0).getDate();
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  for (let i = startDow - 1; i > 0; i--) {
    const d = prevMonthLast - i + 1;
    cells.push({ day: d, date: dateStr(prevYear, prevMonth, d), isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, date: dateStr(year, month, d), isCurrentMonth: true });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, date: dateStr(nextYear, nextMonth, d), isCurrentMonth: false });
    }
  }

  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const dayHeaders = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // ── DnD handlers ─────────────────────────────────────────────────────────────
  const handleDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as { task: CalTask } | undefined;
    if (data?.task) setDraggingTask(data.task);
  };

  const handleDragOver = (e: { over: { data: { current?: { date?: string } } } | null }) => {
    const date = e.over?.data?.current?.date ?? null;
    setOverDate(date);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setDraggingTask(null);
    setOverDate(null);
    const task = (e.active.data.current as { task: CalTask } | undefined)?.task;
    const targetDate = (e.over?.data?.current as { date?: string } | undefined)?.date;
    if (!task || !targetDate || task.dueDate === targetDate) return;

    if (task.kind === 'inbox') {
      updateInboxTask(task.id, { dueDate: targetDate });
    } else {
      rescheduleTask(task.goalId, task.stageId, task.weekId, task.taskId, targetDate);
    }
  };

  const makeToggle = (t: CalTask) => () => {
    if (!t.completed) playMeow();
    if (t.kind === 'inbox') toggleInboxTask(t.id);
    else toggleTask(t.goalId, t.stageId, t.weekId, t.taskId);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver as never} onDragEnd={handleDragEnd}>
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background:'#fdf6fa' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 h-[52px] shrink-0"
        style={{ borderBottom:'1px solid rgba(240,168,208,.2)', background:'rgba(255,248,253,.95)' }}>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,rgba(126,200,227,.3),rgba(249,168,212,.2))', border:'1px solid rgba(126,200,227,.35)' }}>
            <CalendarDays className="w-4 h-4" style={{ color:'#7ec8e3' }} />
          </div>
          <h1 className="text-[16px] md:text-[18px] font-bold" style={{ color:'#7a3a5e' }}>{monthName(month)} {year}</h1>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          <div className="hidden md:flex rounded-xl overflow-hidden" style={{ border:'1px solid rgba(240,168,208,.25)', background:'rgba(255,255,255,.7)' }}>
            {['День', 'Неделя', 'Месяц', '4 Дня'].map(lbl => (
              <button key={lbl}
                className="px-3 py-1.5 text-[12px] font-bold transition-all duration-200"
                style={lbl === 'Месяц'
                  ? { background:'linear-gradient(135deg,#f0a8d0,#a8d8ea)', color:'#fff', boxShadow:'inset 0 1px 0 rgba(255,255,255,.3)' }
                  : { color:'#d4a0c0' }}>
                {lbl}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-0.5 rounded-xl p-0.5" style={{ background:'rgba(255,255,255,.7)', border:'1px solid rgba(240,168,208,.25)' }}>
            <button onClick={prev} className="btn btn-ghost btn-icon btn-sm" style={{ width:30, height:30, padding:5, color:'#d4a0c0' }}><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={goToday} className="btn btn-ghost btn-sm" style={{ padding:'4px 10px', fontSize:12, color:'#c0628f' }}>Сегодня</button>
            <button onClick={next} className="btn btn-ghost btn-icon btn-sm" style={{ width:30, height:30, padding:5, color:'#d4a0c0' }}><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 shrink-0"
        style={{ borderBottom:'1px solid rgba(240,168,208,.15)', background:'rgba(255,248,253,.8)' }}>
        {dayHeaders.map((d, i) => (
          <div key={d} className="text-center py-2 md:py-2.5 text-[10px] md:text-[11px] font-bold uppercase tracking-[.12em]"
            style={{ color: i >= 5 ? '#e88cc4' : '#d4a0c0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 grid overflow-hidden" style={{ gridTemplateRows:`repeat(${weeks.length}, 1fr)` }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7" style={{ borderBottom:'1px solid rgba(240,168,208,.12)' }}>
            {week.map(cell => {
              const isToday = cell.date === todayStr;
              const isSelected = selectedDay === cell.date;
              const isWeekend = new Date(cell.date).getDay() === 0 || new Date(cell.date).getDay() === 6;
              const tasks = tasksByDate[cell.date] || [];
              const isAdding = addingCell === cell.date;
              const isDayOver = overDate === cell.date && cell.isCurrentMonth;

              return (
                <div key={cell.date}
                  className="relative flex flex-col p-1 md:p-2 group/cell cursor-pointer transition-colors duration-150"
                  style={{
                    borderRight: '1px solid rgba(240,168,208,.1)',
                    opacity: !cell.isCurrentMonth ? 0.3 : 1,
                    background: isDayOver
                      ? 'rgba(249,168,212,.15)'
                      : isSelected ? 'rgba(249,168,212,.13)'
                      : isToday ? 'rgba(249,168,212,.08)'
                      : isWeekend && cell.isCurrentMonth ? 'rgba(249,168,212,.03)'
                      : undefined,
                  }}
                  onClick={() => {
                    if (!cell.isCurrentMonth) return;
                    if (window.innerWidth < 768) {
                      setSelectedDay(isSelected ? null : cell.date);
                    } else {
                      if (!isAdding) { setAddingCell(cell.date); setCellDraft(''); }
                    }
                  }}>

                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] flex items-center justify-center rounded-full text-[11px] md:text-[12px] font-bold transition-all"
                      style={isToday
                        ? { background:'linear-gradient(135deg,#f0a8d0,#a8d8ea)', color:'#fff', boxShadow:'0 0 10px rgba(240,168,208,.5)' }
                        : { color:'#c4a0b8' }}>
                      {cell.day}
                    </div>

                    {/* Add button — desktop only */}
                    {cell.isCurrentMonth && !isAdding && (
                      <button
                        onClick={e => { e.stopPropagation(); setAddingCell(cell.date); setCellDraft(''); }}
                        className="absolute top-1 right-1 w-4 h-4 rounded-md hidden md:flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all"
                        style={{ color:'#c0628f' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(249,168,212,.2)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>
                        <Plus className="w-3 h-3" />
                      </button>
                    )}

                    {/* Task dots on mobile */}
                    {tasks.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-[2px] md:hidden mt-0.5">
                        {tasks.slice(0, 3).map((t, ti) => (
                          <div key={ti} className="w-[5px] h-[5px] rounded-full" style={{ background: t.color }} />
                        ))}
                        {tasks.length > 3 && (
                          <div className="w-[5px] h-[5px] rounded-full" style={{ background: '#d4a0c0' }} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tasks — desktop only, wrapped in droppable */}
                  <div className="hidden md:flex flex-col flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>
                    <DroppableCell date={cell.date} isOver={isDayOver}>
                      {tasks.slice(0, 5).map((t, ti) => (
                        <DraggableTask key={ti} t={t} onToggle={makeToggle(t)} />
                      ))}
                      {tasks.length > 5 && (
                        <div className="text-[10px] font-bold px-1" style={{ color:'#d4a0c0' }}>+ {tasks.length - 5} ещё</div>
                      )}
                    </DroppableCell>
                  </div>

                  {isAdding && (
                    <div className="mt-1 hidden md:block" onClick={e => e.stopPropagation()}>
                      <input autoFocus value={cellDraft} onChange={e => setCellDraft(e.target.value)}
                        onBlur={() => commitCell(cell.date)}
                        onKeyDown={e => { if (e.key === 'Enter') commitCell(cell.date); if (e.key === 'Escape') { setCellDraft(''); setAddingCell(null); } }}
                        placeholder="Задача..."
                        className="w-full text-[10px] font-medium px-1.5 py-1 rounded-[6px] outline-none"
                        style={{ background:'rgba(249,168,212,.15)', border:'1px solid rgba(249,168,212,.4)', color:'#7a3a5e' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Mobile day panel */}
      {selectedDay && (
        <div className="md:hidden shrink-0 border-t px-4 py-3 max-h-[45vh] overflow-y-auto"
          style={{ borderColor:'rgba(240,168,208,.25)', background:'rgba(255,248,253,.98)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-bold" style={{ color:'#7a3a5e' }}>
              {new Date(selectedDay + 'T12:00:00').toLocaleDateString('ru-RU', { day:'numeric', month:'long' })}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAddingCell(selectedDay); setCellDraft(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all"
                style={{ background:'rgba(249,168,212,.15)', color:'#c0628f', border:'1px solid rgba(249,168,212,.25)' }}>
                <Plus className="w-3.5 h-3.5" /> Добавить
              </button>
              <button onClick={() => setSelectedDay(null)}
                className="w-7 h-7 flex items-center justify-center rounded-xl transition-all"
                style={{ color:'#d4a0c0' }}>
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
          </div>

          {(tasksByDate[selectedDay] || []).length === 0 && !addingCell && (
            <p className="text-[13px] text-center py-3" style={{ color:'#d4a0c0' }}>Нет задач на этот день</p>
          )}

          <div className="space-y-2">
            {(tasksByDate[selectedDay] || []).map((t, ti) => (
              <div key={ti}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                style={{ background:`${t.color}12`, border:`1px solid ${t.color}28`, opacity: t.completed ? 0.55 : 1 }}>
                <button
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150"
                  style={{ background: t.completed ? t.color : 'transparent', border:`2px solid ${t.completed ? t.color : `${t.color}60`}` }}
                  onClick={() => makeToggle(t)()}>
                  {t.completed && <Check className="w-3 h-3" style={{ color:'#fff', strokeWidth:3 }} />}
                </button>
                <span className="flex-1 text-[13px] font-semibold"
                  style={{ color: t.color, textDecoration: t.completed ? 'line-through' : 'none' }}>
                  {t.title}
                </span>
              </div>
            ))}

            {addingCell === selectedDay && (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl ani-scale"
                style={{ background:'rgba(249,168,212,.1)', border:'1.5px solid rgba(249,168,212,.35)' }}>
                <div className="w-5 h-5 rounded-full border-2 shrink-0" style={{ borderColor:'rgba(232,140,196,.4)' }} />
                <input autoFocus value={cellDraft} onChange={e => setCellDraft(e.target.value)}
                  onBlur={() => { commitCell(selectedDay); }}
                  onKeyDown={e => { if (e.key === 'Enter') commitCell(selectedDay); if (e.key === 'Escape') { setCellDraft(''); setAddingCell(null); } }}
                  placeholder="Новая задача..."
                  className="flex-1 bg-transparent text-[13px] font-medium outline-none"
                  style={{ color:'#4a1a3a' }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {/* Drag overlay */}
    <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(.18,1,.22,1)' }}>
      {draggingTask && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl shadow-xl"
          style={{
            background: 'rgba(255,248,253,.97)',
            border: `1.5px solid ${draggingTask.color}60`,
            boxShadow: `0 10px 28px ${draggingTask.color}30, 0 4px 12px rgba(0,0,0,.08)`,
            maxWidth: 220,
            cursor: 'grabbing',
          }}>
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: draggingTask.color }} />
          <span className="text-[12px] font-semibold truncate" style={{ color: '#5a2a4a' }}>
            {draggingTask.title}
          </span>
        </div>
      )}
    </DragOverlay>
    </DndContext>
  );
}
