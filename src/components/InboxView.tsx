import { useState } from 'react';
import { Inbox, Plus, CalendarDays } from 'lucide-react';
import { useStore } from '../store';
import { TaskRow } from './TaskRow';

export function InboxView() {
  const { inbox, addInboxTask, toggleInboxTask, deleteInboxTask, updateInboxTask } = useStore();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftDate, setDraftDate] = useState('');
  const count = inbox.filter(t => !t.completed).length;

  const commit = () => {
    if (draft.trim()) { addInboxTask(draft.trim(), draftDate || undefined); setDraft(''); setDraftDate(''); }
    setAdding(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#fdf6fa' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-10 h-[56px] md:h-[64px] shrink-0"
        style={{ borderBottom: '1px solid rgba(240,168,208,.18)', background: 'rgba(255,250,253,.97)' }}>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,rgba(249,168,212,.35),rgba(126,200,227,.25))', border: '1px solid rgba(249,168,212,.4)' }}>
          <Inbox className="w-4 h-4" style={{ color: '#e88cc4' }} />
        </div>
        <h1 className="text-[18px] font-black" style={{ color: '#4a1a3a' }}>Входящие</h1>
        {count > 0 && (
          <span className="text-[12px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(249,168,212,.15)', color: '#c0628f' }}>
            {count} задач
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">

        {/* Empty state — full height centered */}
        {inbox.length === 0 && !adding && (
          <div className="h-full flex flex-col items-center justify-center gap-3 ani-up">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-2"
              style={{
                background: 'linear-gradient(135deg,rgba(249,168,212,.18),rgba(126,200,227,.12))',
                border: '1.5px solid rgba(249,168,212,.25)',
                boxShadow: '0 8px 32px rgba(249,168,212,.12)',
              }}>
              <Inbox className="w-9 h-9" style={{ color: 'rgba(232,140,196,.45)' }} />
            </div>
            <p className="text-[16px] font-bold" style={{ color: '#c4a0b8' }}>Нет входящих задач</p>
            <p className="text-[13px]" style={{ color: '#dbb8cc' }}>Нажмите кнопку ниже, чтобы добавить задачу</p>
            <button onClick={() => setAdding(true)} className="btn btn-primary btn-sm mt-2">
              <Plus className="w-3.5 h-3.5" /> Новая задача
            </button>
          </div>
        )}

        {/* Task list */}
        {(inbox.length > 0 || adding) && (
          <div className="max-w-[680px] w-full mx-auto px-4 md:px-6 py-4 md:py-6 space-y-1.5">
            {inbox.map((t, i) => (
              <div key={t.id} className={`ani-up stagger-${Math.min(i + 1, 5)}`}>
                <TaskRow
                  title={t.title} completed={t.completed}
                  meta={t.dueDate ? new Date(t.dueDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : undefined}
                  dueDate={t.dueDate}
                  onToggle={() => toggleInboxTask(t.id)}
                  onDelete={() => deleteInboxTask(t.id)}
                  onDateChange={(date) => updateInboxTask(t.id, { dueDate: date || undefined })} />
              </div>
            ))}

            {adding && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl ani-scale"
                style={{ background: 'rgba(249,168,212,.08)', border: '1.5px solid rgba(249,168,212,.3)' }}>
                <div className="w-[18px] h-[18px] rounded-full border-2 shrink-0" style={{ borderColor: 'rgba(232,140,196,.4)' }} />
                <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(''); setDraftDate(''); setAdding(false); } }}
                  placeholder="Новая задача..."
                  className="flex-1 bg-transparent text-[14px] font-medium outline-none"
                  style={{ color: '#4a1a3a' }} />
                <CalendarDays className="w-3.5 h-3.5 shrink-0" style={{ color: '#d4a0c0' }} />
                <input type="date" value={draftDate} onChange={e => setDraftDate(e.target.value)}
                  className="text-[12px] bg-transparent outline-none cursor-pointer [color-scheme:light] w-[100px]"
                  style={{ color: '#c0628f' }} />
                <button onClick={commit} className="btn btn-primary btn-sm btn-icon shrink-0">↵</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom bar — only when has tasks */}
      {(inbox.length > 0 || adding) && (
        <div className="shrink-0 px-4 md:px-10 py-3 md:py-4"
          style={{ borderTop: '1px solid rgba(240,168,208,.15)', background: 'rgba(255,250,253,.97)' }}>
          <button onClick={() => setAdding(true)} className="btn btn-primary btn-sm">
            <Plus className="w-3.5 h-3.5" /> Новая задача
          </button>
        </div>
      )}
    </div>
  );
}
