import { List, Plus, ChevronLeft, ChevronRight, TrendingUp, Target, CheckCircle, Circle, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store';
import { calcGoalProgress } from '../utils';
import { ProgressBar } from './ProgressBar';
import { GOAL_COLORS } from '../types';

interface Props { onNewGoal: () => void }

export function PlansView({ onNewGoal }: Props) {
  const { goals, setView } = useStore();
  const [weekOffset, setWeekOffset] = useState(0);

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const startOfWeek = new Date(baseDate);
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });
  const _td = new Date();
  const todayStr = `${_td.getFullYear()}-${String(_td.getMonth()+1).padStart(2,'0')}-${String(_td.getDate()).padStart(2,'0')}`;
  const dayNames = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

  // Global stats
  const totalGoals = goals.length;
  const doneGoals = goals.filter(g => calcGoalProgress(g) === 100).length;
  const avgProgress = totalGoals > 0
    ? Math.round(goals.reduce((s, g) => s + calcGoalProgress(g), 0) / totalGoals)
    : 0;
  const totalTasks = goals.reduce((s, g) => s + g.monthlyStages.reduce((s2, ms) => s2 + ms.weeklyGoals.reduce((s3, wg) => s3 + wg.tasks.length, 0), 0), 0);
  const doneTasks = goals.reduce((s, g) => s + g.monthlyStages.reduce((s2, ms) => s2 + ms.weeklyGoals.reduce((s3, wg) => s3 + wg.tasks.filter(t => t.completed).length, 0), 0), 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#fdf6fa' }}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 md:px-10 h-[56px] md:h-[64px] shrink-0"
        style={{ borderBottom: '1px solid rgba(240,168,208,.18)', background: 'rgba(255,250,253,.97)' }}>
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,rgba(126,200,227,.35),rgba(249,168,212,.2))', border: '1px solid rgba(126,200,227,.35)' }}>
          <List className="w-4 h-4" style={{ color: '#7ec8e3' }} />
        </div>
        <h1 className="text-[16px] md:text-[18px] font-black" style={{ color: '#4a1a3a' }}>Планы</h1>
        {totalGoals > 0 && (
          <span className="text-[11px] md:text-[12px] font-bold px-2 md:px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(126,200,227,.15)', color: '#5b9db5' }}>
            {totalGoals} {totalGoals === 1 ? 'цель' : totalGoals < 5 ? 'цели' : 'целей'}
          </span>
        )}

        {/* Week mini-nav — hidden on mobile */}
        <div className="ml-auto hidden md:flex items-center gap-1 rounded-2xl p-1"
          style={{ background: 'rgba(255,255,255,.75)', border: '1px solid rgba(240,168,208,.2)' }}>
          <button onClick={() => setWeekOffset(w => w - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-xl transition-all"
            style={{ color: '#d4a0c0' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#c0628f'; (e.currentTarget as HTMLElement).style.background='rgba(249,168,212,.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#d4a0c0'; (e.currentTarget as HTMLElement).style.background=''; }}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {days.map(d => {
            const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            const isToday = iso === todayStr;
            return (
              <button key={iso} className="flex flex-col items-center w-9 py-1 rounded-xl transition-all duration-200"
                style={isToday
                  ? { background:'linear-gradient(135deg,#f0a8d0,#a8d8ea)', color:'#fff', boxShadow:'0 2px 10px rgba(240,168,208,.4)' }
                  : { color:'#d4a0c0' }}>
                <span className="text-[9px] font-bold uppercase tracking-wide">{dayNames[d.getDay()]}</span>
                <span className="text-[14px] font-bold leading-none mt-0.5">{d.getDate()}</span>
              </button>
            );
          })}
          <button onClick={() => setWeekOffset(w => w + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-xl transition-all"
            style={{ color: '#d4a0c0' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#c0628f'; (e.currentTarget as HTMLElement).style.background='rgba(249,168,212,.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#d4a0c0'; (e.currentTarget as HTMLElement).style.background=''; }}>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Empty state ── */}
        {totalGoals === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-5 ani-up px-8">
            <div className="w-28 h-28 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg,rgba(249,168,212,.18),rgba(126,200,227,.12))',
                border: '1.5px solid rgba(249,168,212,.28)',
                boxShadow: '0 16px 48px rgba(249,168,212,.2)',
              }}>
              <Target className="w-14 h-14" style={{ color: 'rgba(232,140,196,.5)' }} />
            </div>
            <div className="text-center">
              <p className="text-[20px] font-black mb-2" style={{ color: '#c4a0b8' }}>Нет активных целей</p>
              <p className="text-[15px]" style={{ color: '#dbb8cc' }}>Добавьте первую цель и начните движение к мечте</p>
            </div>
            <button onClick={onNewGoal} className="btn btn-primary btn-lg mt-2">
              <Plus className="w-4 h-4" /> Создать первую цель
            </button>
          </div>
        )}

        {/* ── Has goals ── */}
        {totalGoals > 0 && (
          <div className="w-full px-4 py-5 md:px-10 md:py-8" style={{ maxWidth: 900, margin: '0 auto' }}>

            {/* Stats strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
              {[
                {
                  label: 'Средний прогресс',
                  value: `${avgProgress}%`,
                  sub: `${doneGoals} из ${totalGoals} завершено`,
                  color: '#e88cc4',
                  bg: 'rgba(249,168,212,.12)',
                  border: 'rgba(249,168,212,.25)',
                  icon: <Sparkles className="w-5 h-5" />,
                },
                {
                  label: 'Задачи',
                  value: `${doneTasks}`,
                  sub: `из ${totalTasks} выполнено`,
                  color: '#7ec8e3',
                  bg: 'rgba(126,200,227,.12)',
                  border: 'rgba(126,200,227,.25)',
                  icon: <CheckCircle className="w-5 h-5" />,
                },
                {
                  label: 'В работе',
                  value: `${totalGoals - doneGoals}`,
                  sub: `активных целей`,
                  color: '#c084fc',
                  bg: 'rgba(192,132,252,.1)',
                  border: 'rgba(192,132,252,.22)',
                  icon: <Circle className="w-5 h-5" />,
                },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl px-4 py-3 md:px-5 md:py-4 flex items-center gap-3 md:gap-4 ani-up"
                  style={{
                    background: s.bg,
                    border: `1.5px solid ${s.border}`,
                    animationDelay: `${i * 0.06}s`,
                  }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,255,255,.6)', color: s.color }}>
                    {s.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[22px] font-black leading-none" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[11px] font-semibold mt-0.5" style={{ color: '#b8a0b4' }}>{s.label}</div>
                    <div className="text-[11px]" style={{ color: '#cdb0c8' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Section title */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[13px] font-bold uppercase tracking-widest" style={{ color: '#d4a0c0' }}>Мои цели</span>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(240,168,208,.3),transparent)' }} />
              <button onClick={onNewGoal} className="btn btn-primary btn-sm">
                <Plus className="w-3.5 h-3.5" /> Добавить
              </button>
            </div>

            {/* Goal cards */}
            <div className="grid gap-4">
              {goals.map((goal, idx) => {
                const progress = calcGoalProgress(goal);
                const hex = GOAL_COLORS[goal.color];
                const stages = goal.monthlyStages.length;
                const gtotal = goal.monthlyStages.reduce((s, ms) => s + ms.weeklyGoals.reduce((s2, wg) => s2 + wg.tasks.length, 0), 0);
                const gdone = goal.monthlyStages.reduce((s, ms) => s + ms.weeklyGoals.reduce((s2, wg) => s2 + wg.tasks.filter(t => t.completed).length, 0), 0);

                return (
                  <button key={goal.id} onClick={() => setView('goal-detail', goal.id)}
                    className={`ani-up stagger-${Math.min(idx + 1, 5)} w-full text-left rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer`}
                    style={{
                      background: 'rgba(255,255,255,.88)',
                      border: `1.5px solid rgba(240,168,208,.2)`,
                      boxShadow: '0 4px 24px rgba(220,140,180,.1)',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.transform = 'translateY(-4px)';
                      el.style.boxShadow = `0 20px 56px rgba(220,140,180,.2), 0 0 0 1.5px ${hex}35`;
                      el.style.background = `linear-gradient(145deg,${hex}0e 0%,rgba(255,255,255,.92) 100%)`;
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.transform = '';
                      el.style.boxShadow = '0 4px 24px rgba(220,140,180,.1)';
                      el.style.background = 'rgba(255,255,255,.88)';
                    }}>

                    {/* Color bar top */}
                    <div className="h-1 w-full"
                      style={{ background: `linear-gradient(90deg,${hex},${hex}50,transparent)` }} />

                    <div className="px-4 py-4 md:px-6 md:py-5">
                      <div className="flex items-start gap-3 md:gap-5">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-[22px] font-black"
                          style={{
                            background: `linear-gradient(135deg,${hex}28,${hex}10)`,
                            color: hex,
                            border: `1.5px solid ${hex}35`,
                            boxShadow: `0 4px 16px ${hex}22`,
                          }}>
                          {goal.title.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <p className="text-[15px] md:text-[17px] font-black" style={{ color: '#4a1a3a' }}>{goal.title}</p>
                            <div className="shrink-0 text-right">
                              <span className="text-[26px] md:text-[34px] font-black tabular-nums leading-none" style={{ color: hex }}>{progress}</span>
                              <span className="text-[12px] md:text-[14px] font-bold" style={{ color: `${hex}70` }}>%</span>
                            </div>
                          </div>
                          {goal.description && (
                            <p className="text-[13px] mb-2" style={{ color: '#c4a0b8' }}>{goal.description}</p>
                          )}

                          {/* Progress bar */}
                          <ProgressBar progress={progress} color={goal.color} size="lg" glow />

                          {/* Footer row */}
                          <div className="flex flex-wrap items-center gap-2 md:gap-5 mt-3">
                            {goal.deadline && (
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                                style={{ background: `${hex}15`, color: hex, border: `1px solid ${hex}25` }}>
                                до {new Date(goal.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                            {stages > 0 && (
                              <span className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: '#b8a0b4' }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: hex }} />
                                {stages} этап{stages === 1 ? '' : stages < 5 ? 'а' : 'ов'}
                              </span>
                            )}
                            {gtotal > 0 && (
                              <span className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: '#b8a0b4' }}>
                                <TrendingUp className="w-3.5 h-3.5" />
                                {gdone} / {gtotal} задач
                              </span>
                            )}
                            <span className="ml-auto text-[11px] font-bold px-3 py-1 rounded-full"
                              style={{ background: `${hex}12`, color: hex }}>
                              {progress === 100 ? 'Завершено' : progress > 0 ? 'В процессе' : 'Не начато'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
