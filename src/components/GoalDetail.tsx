import { useState } from 'react';
import { ArrowLeft, Calendar, Trash2, Plus, TrendingUp, Layers, Circle } from 'lucide-react';
import { useStore } from '../store';
import { calcGoalProgress, calcMonthlyProgress, monthName } from '../utils';
import { MonthlyStageCard } from './MonthlyStageCard';
import { AddMonthForm } from './AddMonthForm';
import { InlineEdit } from './InlineEdit';
import { GOAL_COLORS } from '../types';

export function GoalDetail() {
  const { goals, activeGoalId, setView, updateGoal, deleteGoal, addMonthlyStage } = useStore();
  const [addMonth, setAddMonth] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const goal = goals.find(g => g.id === activeGoalId);

  if (!goal) return (
    <div className="flex-1 flex items-center justify-center text-[13px]" style={{ background: '#fdf6fa', color: '#d4a0c0' }}>
      Цель не найдена
    </div>
  );

  const progress = calcGoalProgress(goal);
  const hex = GOAL_COLORS[goal.color];
  const total = goal.monthlyStages.reduce((s, ms) => s + ms.weeklyGoals.reduce((s2, wg) => s2 + wg.tasks.length, 0), 0);
  const done = goal.monthlyStages.reduce((s, ms) => s + ms.weeklyGoals.reduce((s2, wg) => s2 + wg.tasks.filter(t => t.completed).length, 0), 0);
  const sorted = [...goal.monthlyStages].sort((a, b) => a.year * 100 + a.month - (b.year * 100 + b.month));

  const circumference = 2 * Math.PI * 44;
  const strokeDash = (progress / 100) * circumference;

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#fdf6fa' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-6 h-[52px] shrink-0"
        style={{ borderBottom: '1px solid rgba(240,168,208,.2)', background: 'rgba(255,248,253,.97)' }}>
        <button onClick={() => setView('plans')} className="btn btn-ghost btn-icon btn-sm" style={{ color: '#b07aa0' }}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-[8px] h-[8px] rounded-full shrink-0" style={{ backgroundColor: hex, boxShadow: `0 0 6px ${hex}` }} />
        <span className="flex-1 truncate">
          <InlineEdit value={goal.title} onSave={(v) => updateGoal(goal.id, { title: v })}
            className="text-[15px] font-bold" style={{ color: '#5a2a4a' }} />
        </span>
        <button onClick={() => setConfirmDel(true)} className="btn btn-ghost btn-icon btn-sm" title="Удалить цель"
          style={{ color: '#d4b8cc' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,.1)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#d4b8cc'; (e.currentTarget as HTMLButtonElement).style.background = ''; }}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-full md:w-[280px] shrink-0 flex flex-col overflow-y-auto py-4 px-4 gap-4 md:py-5 border-b md:border-b-0 md:border-r"
          style={{ borderColor: 'rgba(240,168,208,.2)' }}>

          {/* Circular progress */}
          <div className="rounded-2xl p-4 md:p-5 flex md:flex-col items-center gap-4 md:gap-0"
            style={{ background: `linear-gradient(145deg, ${hex}12, rgba(255,255,255,.6))`, border: `1px solid ${hex}30` }}>
            <svg width="80" height="80" viewBox="0 0 104 104" className="-rotate-90 md:w-[104px] md:h-[104px] shrink-0">
              <circle cx="52" cy="52" r="44" fill="none" strokeWidth="7" stroke="rgba(240,168,208,.2)" />
              <circle cx="52" cy="52" r="44" fill="none" strokeWidth="7"
                stroke={hex} strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${circumference}`}
                style={{ filter: `drop-shadow(0 0 6px ${hex}99)`, transition: 'stroke-dasharray .9s cubic-bezier(.16,1,.3,1)' }} />
            </svg>
            <div className="md:mt-3 text-center">
              <div className="text-[30px] md:text-[34px] font-black leading-none tabular-nums" style={{ color: hex }}>{progress}<span className="text-[16px] md:text-[18px]">%</span></div>
              <div className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#d4a0c0' }}>общий прогресс</div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            {[
              { icon: <TrendingUp className="w-4 h-4" />, label: 'Задач', value: total > 0 ? `${done} / ${total}` : '0', sub: total > 0 ? `${Math.round(done/total*100)}% готово` : 'нет задач' },
              { icon: <Layers className="w-4 h-4" />, label: 'Этапов', value: `${sorted.length}`, sub: sorted.length === 0 ? 'добавьте первый' : `${sorted.filter(s => calcMonthlyProgress(s) === 100).length} завершено` },
              { icon: <Calendar className="w-4 h-4" />, label: 'Дедлайн', value: goal.deadline ? new Date(goal.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '—', sub: goal.deadline ? new Date(goal.deadline).getFullYear().toString() : 'не задан' },
            ].map(s => (
              <div key={s.label} className="rounded-xl px-3 py-2.5 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,.7)', border: '1px solid rgba(240,168,208,.2)' }}>
                <span className="shrink-0" style={{ color: '#d4a0c0' }}>{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#d4a0c0' }}>{s.label}</div>
                  <div className="text-[11px] truncate" style={{ color: '#c4a0b8' }}>{s.sub}</div>
                </div>
                <span className="text-[17px] font-black tabular-nums shrink-0" style={{ color: hex }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {goal.description && (
            <div className="rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,.6)', border: '1px solid rgba(240,168,208,.18)' }}>
              <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#d4a0c0' }}>Описание</div>
              <InlineEdit value={goal.description} onSave={(v) => updateGoal(goal.id, { description: v })}
                className="text-[12px] leading-relaxed" style={{ color: '#9d6e8a' }} />
            </div>
          )}

          {/* Monthly mini-chart */}
          {sorted.length > 1 && (
            <div className="rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,.6)', border: '1px solid rgba(240,168,208,.18)' }}>
              <div className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: '#d4a0c0' }}>По месяцам</div>
              <div className="flex items-end gap-1 h-[40px]">
                {sorted.map(st => {
                  const mp = calcMonthlyProgress(st);
                  return (
                    <div key={st.id} className="flex-1 flex flex-col items-center gap-0.5 group/b">
                      <div className="w-full rounded-t transition-all duration-700"
                        style={{
                          height: `${Math.max(mp, 5)}%`,
                          background: `linear-gradient(180deg, ${hex}, ${hex}55)`,
                          boxShadow: mp > 0 ? `0 0 6px ${hex}44` : 'none',
                          opacity: mp > 0 ? 1 : 0.15,
                        }} />
                      <span className="text-[8px] font-semibold transition-colors group-hover/b:opacity-100 opacity-50" style={{ color: '#c4a0b8' }}>
                        {monthName(st.month).slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 h-[44px] shrink-0"
            style={{ borderBottom: '1px solid rgba(240,168,208,.15)' }}>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold" style={{ color: '#9d6e8a' }}>Этапы</span>
              {sorted.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: 'rgba(249,168,212,.12)', color: '#c0628f' }}>
                  {sorted.length}
                </span>
              )}
            </div>
            <button onClick={() => setAddMonth(true)} className="btn btn-sm"
              style={{ background: `${hex}18`, color: hex, border: `1px solid ${hex}35`, boxShadow: `0 4px 14px ${hex}20` }}>
              <Plus className="w-3.5 h-3.5" /> Добавить этап
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full pb-10 ani-up">
                <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                  style={{ background: `${hex}10`, border: `1px dashed ${hex}30` }}>
                  <Circle className="w-7 h-7" style={{ color: `${hex}60` }} />
                </div>
                <p className="text-[14px] font-bold mb-1" style={{ color: '#d4a0c0' }}>Нет этапов</p>
                <p className="text-[12px] mb-5" style={{ color: '#e0c0d4' }}>Разбейте цель на месячные шаги</p>
                <button onClick={() => setAddMonth(true)} className="btn"
                  style={{ background: `${hex}18`, color: hex, border: `1px solid ${hex}35`, boxShadow: `0 4px 18px ${hex}25` }}>
                  <Plus className="w-4 h-4" /> Добавить первый этап
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sorted.map((st, i) => {
                  const tasksTotal = st.weeklyGoals.reduce((s, wg) => s + wg.tasks.length, 0);
                  const tasksDone = st.weeklyGoals.reduce((s, wg) => s + wg.tasks.filter(t => t.completed).length, 0);
                  return (
                    <div key={st.id} className={`ani-up stagger-${Math.min(i + 1, 5)}`}>
                      <MonthlyStageCard stage={st} goalId={goal.id} color={goal.color}
                        extraBadge={tasksTotal > 0 ? `${tasksDone}/${tasksTotal}` : undefined} />
                    </div>
                  );
                })}
                <div className="h-4" />
              </div>
            )}
          </div>

          <div className="shrink-0 px-5 py-3"
            style={{ borderTop: '1px solid rgba(240,168,208,.15)', background: 'rgba(255,248,253,.97)' }}>
            <button onClick={() => setAddMonth(true)} className="btn btn-sm"
              style={{ background: `${hex}18`, color: hex, border: `1px solid ${hex}35`, boxShadow: `0 4px 14px ${hex}18` }}>
              <Plus className="w-3.5 h-3.5" /> Новый этап
            </button>
          </div>
        </div>
      </div>

      <AddMonthForm open={addMonth} onClose={() => setAddMonth(false)}
        onAdd={(t, m, y) => addMonthlyStage(goal.id, t, m, y)} />

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 ani-fade" style={{ background: 'rgba(100,50,80,.3)', backdropFilter: 'blur(8px)' }} onClick={() => setConfirmDel(false)} />
          <div className="relative w-full max-w-[340px] rounded-2xl p-6 ani-scale"
            style={{ background: 'rgba(255,248,253,.98)', border: '1px solid rgba(248,113,113,.25)', boxShadow: '0 30px 80px rgba(100,50,80,.25)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.2)' }}>
              <Trash2 className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-[15px] font-bold mb-1" style={{ color: '#5a2a4a' }}>Удалить цель?</p>
            <p className="text-[13px] mb-5 leading-relaxed" style={{ color: '#b07aa0' }}>«{goal.title}» и все этапы будут удалены навсегда.</p>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setConfirmDel(false)} className="btn btn-secondary flex-1">Отмена</button>
              <button onClick={() => { deleteGoal(goal.id); setConfirmDel(false); }} className="btn btn-danger flex-1">Удалить навсегда</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
