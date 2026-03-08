import { useState } from 'react';
import { Check, Zap, CalendarDays, X } from 'lucide-react';
import { GOAL_COLORS, type GoalColor } from '../types';
import { useStore } from '../store';
import { Modal } from './Modal';

interface Props { open: boolean; onClose: () => void }

const colors = Object.keys(GOAL_COLORS) as GoalColor[];

export function GoalForm({ open, onClose }: Props) {
  const addGoal = useStore((s) => s.addGoal);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState<GoalColor>('blue');
  const [deadline, setDeadline] = useState('');
  const [titleFocus, setTitleFocus] = useState(false);

  const reset = () => { setTitle(''); setDesc(''); setColor('blue'); setDeadline(''); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal(title.trim(), desc.trim(), color, deadline);
    reset(); onClose();
  };

  const hex = GOAL_COLORS[color];

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={submit} style={{ overflow: 'visible' }}>

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,rgba(249,168,212,.4),rgba(126,200,227,.3))', border: '1px solid rgba(249,168,212,.4)', boxShadow: '0 4px 16px rgba(249,168,212,.3)' }}>
            <Zap className="w-4 h-4" style={{ color: '#e88cc4' }} />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-bold leading-none" style={{ color: '#5a2a4a' }}>Новая цель</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#d4a0c0' }}>Большой шаг начинается с малого</p>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Title & desc ── */}
        <div className="px-5 pb-4 space-y-2">
          <div className="rounded-2xl px-4 py-3 transition-all duration-200"
            style={{
              background: titleFocus ? 'rgba(249,168,212,.06)' : 'rgba(255,255,255,.6)',
              border: titleFocus ? `1px solid ${hex}55` : '1px solid rgba(240,168,208,.25)',
              boxShadow: titleFocus ? `0 0 0 3px ${hex}12` : 'none',
            }}>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              onFocus={() => setTitleFocus(true)} onBlur={() => setTitleFocus(false)}
              autoFocus placeholder="Название цели..." maxLength={80}
              className="w-full text-[15px] font-bold bg-transparent outline-none block"
              style={{ color: '#5a2a4a' }} />
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Описание (необязательно)"
              className="w-full text-[12px] bg-transparent outline-none block mt-1"
              style={{ color: '#c4a0b8' }} />
          </div>

          {/* ── Color picker ── */}
          <div className="rounded-2xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,.6)', border: '1px solid rgba(240,168,208,.2)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[.1em] mb-2.5" style={{ color: '#d4a0c0' }}>Цвет цели</p>
            <div className="flex items-center gap-2">
              {colors.map(c => {
                const h = GOAL_COLORS[c];
                const active = color === c;
                return (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className="relative w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200"
                    style={{
                      backgroundColor: h,
                      boxShadow: active ? `0 0 0 2px #fdf6fa, 0 0 0 4px ${h}, 0 0 14px ${h}66` : `0 2px 8px ${h}44`,
                      transform: active ? 'scale(1.15)' : 'scale(1)',
                    }}>
                    {active && <Check className="w-3.5 h-3.5 text-white drop-shadow" strokeWidth={3} />}
                  </button>
                );
              })}
              <div className="ml-auto flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hex, boxShadow: `0 0 6px ${hex}` }} />
                <span className="text-[11px] font-semibold" style={{ color: '#c4a0b8' }}>{hex}</span>
              </div>
            </div>
          </div>

          {/* ── Deadline ── */}
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,.6)', border: '1px solid rgba(240,168,208,.2)' }}>
            <CalendarDays className="w-4 h-4 shrink-0" style={{ color: '#d4a0c0' }} />
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[.1em] mb-0.5" style={{ color: '#d4a0c0' }}>Дедлайн</p>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                className="text-[13px] font-semibold bg-transparent outline-none cursor-pointer [color-scheme:light] transition-colors"
                style={{ color: deadline ? hex : '#d4a0c0' }} />
            </div>
            {deadline && (
              <button type="button" onClick={() => setDeadline('')}
                className="w-5 h-5 flex items-center justify-center rounded-lg transition-all"
                style={{ color: '#d4a0c0' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c0628f'; (e.currentTarget as HTMLElement).style.background = 'rgba(249,168,212,.15)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#d4a0c0'; (e.currentTarget as HTMLElement).style.background = ''; }}>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 pb-5 pt-1 gap-3">
          <button type="button" onClick={() => { reset(); onClose(); }} className="btn btn-secondary flex-1">
            Отмена
          </button>
          <button type="submit" disabled={!title.trim()} className="btn flex-1"
            style={{
              background: `linear-gradient(135deg, ${hex}, ${hex}cc)`,
              boxShadow: `0 4px 24px ${hex}45`,
              color: '#fff',
              border: `1px solid ${hex}40`,
            }}>
            Создать цель
          </button>
        </div>

      </form>
    </Modal>
  );
}
