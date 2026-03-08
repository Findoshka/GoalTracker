import { useState } from 'react';
import { Star, Plus, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { TaskRow } from './TaskRow';
import { GOAL_COLORS } from '../types';

export function TodayView() {
  const { inbox, goals, addInboxTask, toggleInboxTask, deleteInboxTask, toggleTask, deleteTask } = useStore();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const _td = new Date();
  const todayStr = `${_td.getFullYear()}-${String(_td.getMonth()+1).padStart(2,'0')}-${String(_td.getDate()).padStart(2,'0')}`;

  const commit = () => {
    if (draft.trim()) { addInboxTask(draft.trim(), todayStr); setDraft(''); }
    setAdding(false);
  };

  type TItem = { type: 'inbox'; id: string; title: string; completed: boolean; date: string }
    | { type: 'goal'; goalId: string; stageId: string; weekId: string; taskId: string; title: string; completed: boolean; date: string; goalName: string; goalColor: string };

  const overdue: TItem[] = [];
  const today: TItem[] = [];

  inbox.forEach(t => {
    if (!t.dueDate) return;
    if (t.dueDate === todayStr) today.push({ type: 'inbox', id: t.id, title: t.title, completed: t.completed, date: t.dueDate });
    else if (t.dueDate < todayStr && !t.completed) overdue.push({ type: 'inbox', id: t.id, title: t.title, completed: t.completed, date: t.dueDate });
  });
  goals.forEach(g => {
    g.monthlyStages.forEach(ms => ms.weeklyGoals.forEach(wg => wg.tasks.forEach(t => {
      if (!t.dueDate) return;
      const item: TItem = { type: 'goal', goalId: g.id, stageId: ms.id, weekId: wg.id, taskId: t.id, title: t.title, completed: t.completed, date: t.dueDate, goalName: g.title, goalColor: GOAL_COLORS[g.color] };
      if (t.dueDate === todayStr) today.push(item);
      else if (t.dueDate < todayStr && !t.completed) overdue.push(item);
    })));
  });

  const handleToggle = (item: TItem) => item.type === 'inbox' ? toggleInboxTask(item.id) : toggleTask(item.goalId, item.stageId, item.weekId, item.taskId);
  const handleDelete = (item: TItem) => item.type === 'inbox' ? deleteInboxTask(item.id) : deleteTask(item.goalId, item.stageId, item.weekId, item.taskId);

  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('ru-RU', { weekday: 'long' });
  const dayNum = now.getDate();
  const monthLabel = now.toLocaleDateString('ru-RU', { month: 'long' });

  const isEmpty = today.length === 0 && overdue.length === 0 && !adding;

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#fdf6fa' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-10 h-[56px] md:h-[64px] shrink-0"
        style={{ borderBottom: '1px solid rgba(240,168,208,.18)', background: 'rgba(255,250,253,.97)' }}>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,rgba(249,168,212,.35),rgba(253,211,77,.2))', border: '1px solid rgba(249,168,212,.4)' }}>
          <Star className="w-4 h-4 fill-current" style={{ color: '#e88cc4' }} />
        </div>
        <div>
          <h1 className="text-[18px] font-black leading-none" style={{ color: '#4a1a3a' }}>Сегодня</h1>
          <span className="text-[12px] capitalize" style={{ color: '#c4a0b8' }}>{dayNum} {monthLabel}, {dayOfWeek}</span>
        </div>
        {(overdue.length + today.length) > 0 && (
          <span className="ml-auto text-[12px] font-bold px-3 py-1 rounded-full"
            style={{ background: 'rgba(249,168,212,.15)', color: '#c0628f', border: '1px solid rgba(249,168,212,.22)' }}>
            {today.length} на сегодня
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">

        {/* Empty state */}
        {isEmpty && (
          <div className="h-full flex flex-col items-center justify-center gap-3 ani-up">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-2"
              style={{
                background: 'linear-gradient(135deg,rgba(249,168,212,.18),rgba(253,211,77,.1))',
                border: '1.5px solid rgba(249,168,212,.25)',
                boxShadow: '0 8px 32px rgba(249,168,212,.12)',
              }}>
              <Star className="w-9 h-9" style={{ color: 'rgba(232,140,196,.45)' }} />
            </div>
            <p className="text-[16px] font-bold" style={{ color: '#c4a0b8' }}>Нет задач на сегодня</p>
            <p className="text-[13px]" style={{ color: '#dbb8cc' }}>Добавьте задачу на {dayNum} {monthLabel}</p>
            <button onClick={() => setAdding(true)} className="btn btn-primary btn-sm mt-2">
              <Plus className="w-3.5 h-3.5" /> Добавить задачу
            </button>
          </div>
        )}

        {/* Content */}
        {!isEmpty && (
          <div className="max-w-[680px] w-full mx-auto px-4 md:px-6 py-4 md:py-6 space-y-5">

            {/* Overdue */}
            {overdue.length > 0 && (
              <div className="rounded-2xl overflow-hidden ani-up"
                style={{ background: 'rgba(251,113,133,.05)', border: '1px solid rgba(251,113,133,.18)' }}>
                <div className="flex items-center gap-2 px-5 py-3"
                  style={{ borderBottom: '1px solid rgba(251,113,133,.1)' }}>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-[13px] font-bold text-rose-400">Просроченные</span>
                  <span className="ml-auto text-[11px] font-bold text-rose-400/50">{overdue.length}</span>
                </div>
                <div className="px-5 py-2 space-y-1">
                  {overdue.map((item, i) => (
                    <TaskRow key={i} title={item.title} completed={item.completed}
                      meta={new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      goalColor={item.type === 'goal' ? item.goalColor : '#fb7185'}
                      goalName={item.type === 'goal' ? item.goalName : undefined}
                      onToggle={() => handleToggle(item)} onDelete={() => handleDelete(item)} />
                  ))}
                </div>
              </div>
            )}

            {/* Today section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-4 h-4 fill-current" style={{ color: '#e88cc4' }} />
                <span className="text-[15px] font-bold capitalize" style={{ color: '#7a3a5e' }}>{dayNum} {dayOfWeek}</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(240,168,208,.25)' }} />
              </div>

              <div className="space-y-1.5">
                {today.map((item, i) => (
                  <div key={i} className={`ani-up stagger-${Math.min(i + 1, 5)}`}>
                    <TaskRow title={item.title} completed={item.completed} highlight
                      goalColor={item.type === 'goal' ? item.goalColor : '#e88cc4'}
                      goalName={item.type === 'goal' ? item.goalName : undefined}
                      onToggle={() => handleToggle(item)} onDelete={() => handleDelete(item)} />
                  </div>
                ))}

                {adding && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl ani-scale"
                    style={{ background: 'rgba(249,168,212,.08)', border: '1.5px solid rgba(249,168,212,.3)' }}>
                    <div className="w-[18px] h-[18px] rounded-full border-2 shrink-0" style={{ borderColor: 'rgba(232,140,196,.4)' }} />
                    <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
                      onBlur={commit}
                      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(''); setAdding(false); } }}
                      placeholder="Новая задача на сегодня..."
                      className="flex-1 bg-transparent text-[14px] font-medium outline-none"
                      style={{ color: '#4a1a3a' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar — only when has content */}
      {!isEmpty && (
        <div className="shrink-0 px-4 md:px-10 py-3 md:py-4"
          style={{ borderTop: '1px solid rgba(240,168,208,.15)', background: 'rgba(255,250,253,.97)' }}>
          <button onClick={() => setAdding(true)} className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> На сегодня
          </button>
        </div>
      )}
    </div>
  );
}
