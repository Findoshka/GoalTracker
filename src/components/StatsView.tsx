import { useMemo } from 'react';
import { useStore } from '../store';
import { GOAL_COLORS } from '../types';
import { Flame, CheckCircle2, Target, TrendingUp, Star, Award } from 'lucide-react';

// ── helpers ───────────────────────────────────────────────────────────────────
function dateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const MONTHS_RU = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const DAYS_RU   = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

// ── main component ────────────────────────────────────────────────────────────
export function StatsView() {
  const { goals, inbox } = useStore();

  // ── collect all tasks ──────────────────────────────────────────────────────
  const allGoalTasks = useMemo(() => {
    const tasks: { completed: boolean; createdAt?: string; dueDate?: string }[] = [];
    for (const g of goals)
      for (const ms of g.monthlyStages)
        for (const wg of ms.weeklyGoals)
          for (const t of wg.tasks)
            tasks.push(t);
    return tasks;
  }, [goals]);

  const allInbox = inbox;

  // ── global numbers ─────────────────────────────────────────────────────────
  const totalTasks   = allGoalTasks.length + allInbox.length;
  const doneTasks    = allGoalTasks.filter(t => t.completed).length + allInbox.filter(t => t.completed).length;
  const totalGoals   = goals.length;
  const doneGoals    = goals.filter(g => {
    const all = g.monthlyStages.flatMap(ms => ms.weeklyGoals.flatMap(wg => wg.tasks));
    return all.length > 0 && all.every(t => t.completed);
  }).length;
  const completionPct = totalTasks === 0 ? 0 : Math.round(doneTasks / totalTasks * 100);

  // ── activity grid: last 84 days (12 weeks) ─────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // count completed tasks per day using createdAt as proxy (tasks completed = marked done)
  // Since we don't store completedAt, we use dueDate or createdAt as activity signal
  // We'll use: if task is completed and has dueDate → count on dueDate
  //            if task is completed and no dueDate → count on createdAt date
  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    const add = (dateKey: string) => { map[dateKey] = (map[dateKey] ?? 0) + 1; };

    for (const t of allGoalTasks) {
      if (!t.completed) continue;
      const key = t.dueDate ?? (t.createdAt ? t.createdAt.slice(0, 10) : null);
      if (key) add(key);
    }
    for (const t of allInbox) {
      if (!t.completed) continue;
      const key = t.dueDate ?? t.createdAt.slice(0, 10);
      add(key);
    }
    return map;
  }, [allGoalTasks, allInbox]);

  // build 84-day grid starting from Monday 12 weeks ago
  const gridStart = useMemo(() => {
    const d = addDays(today, -83);
    // align to Monday
    const dow = d.getDay(); // 0=Sun
    const offset = dow === 0 ? -6 : 1 - dow;
    return addDays(d, offset);
  }, [today]);

  const gridDays = useMemo(() => {
    return Array.from({ length: 84 }, (_, i) => {
      const d = addDays(gridStart, i);
      const key = dateStr(d);
      return { date: d, key, count: activityMap[key] ?? 0 };
    });
  }, [gridStart, activityMap]);

  const maxActivity = Math.max(1, ...gridDays.map(d => d.count));

  // ── streak ─────────────────────────────────────────────────────────────────
  const streak = useMemo(() => {
    let s = 0;
    const d = new Date(today);
    while (true) {
      const key = dateStr(d);
      if ((activityMap[key] ?? 0) === 0) break;
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [activityMap, today]);

  const bestStreak = useMemo(() => {
    let best = 0, cur = 0;
    for (const day of gridDays) {
      if (day.count > 0) { cur++; best = Math.max(best, cur); }
      else cur = 0;
    }
    return best;
  }, [gridDays]);

  // ── last 7 days bar chart ──────────────────────────────────────────────────
  const week7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i - 6);
      const key = dateStr(d);
      return { label: DAYS_RU[(d.getDay() + 6) % 7], count: activityMap[key] ?? 0, isToday: i === 6 };
    });
  }, [activityMap, today]);
  const maxWeek = Math.max(1, ...week7.map(d => d.count));

  // ── goals progress list ────────────────────────────────────────────────────
  const goalStats = useMemo(() => goals.map(g => {
    const all  = g.monthlyStages.flatMap(ms => ms.weeklyGoals.flatMap(wg => wg.tasks));
    const done = all.filter(t => t.completed).length;
    const pct  = all.length === 0 ? 0 : Math.round(done / all.length * 100);
    return { id: g.id, title: g.title, color: g.color, total: all.length, done, pct };
  }), [goals]);

  // ── month comparison (last 3 months) ──────────────────────────────────────
  const monthBars = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (2 - i), 1);
      const y = d.getFullYear(), m = d.getMonth();
      const label = MONTHS_RU[m];
      let count = 0;
      for (const day of gridDays) {
        if (day.date.getFullYear() === y && day.date.getMonth() === m) count += day.count;
      }
      return { label, count, isCurrent: i === 2 };
    });
  }, [gridDays, today]);
  const maxMonth = Math.max(1, ...monthBars.map(m => m.count));

  // ── ring helper ────────────────────────────────────────────────────────────
  const Ring = ({ pct, size, stroke, color, bg }: { pct: number; size: number; stroke: number; color: string; bg: string }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = circ * pct / 100;
    return (
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray .8s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-10 h-[64px] shrink-0"
        style={{ borderBottom: '1px solid rgba(240,168,208,.18)' }}>
        <div>
          <h1 className="text-[20px] font-black" style={{ color: '#5a3a5a' }}>Статистика</h1>
          <p className="text-[12px]" style={{ color: '#b090b0' }}>твой прогресс за всё время</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl ani-scale"
            style={{ background: 'linear-gradient(135deg,rgba(255,182,215,.2),rgba(147,213,240,.2))', border: '1.5px solid rgba(255,182,215,.35)' }}>
            <Flame className="w-5 h-5" style={{ color: '#f97316' }} />
            <span className="text-[15px] font-black" style={{ color: '#5a3a5a' }}>{streak}</span>
            <span className="text-[12px] font-semibold" style={{ color: '#b090b0' }}>дней подряд</span>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 md:px-10 py-6 space-y-6">

        {/* ── Top KPI cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Выполнено задач', value: doneTasks, sub: `из ${totalTasks}`, color: '#ffb6d9', bg: 'rgba(255,182,215,.12)' },
            { icon: <Flame        className="w-5 h-5" />, label: 'Серия дней',      value: streak,    sub: `рекорд ${bestStreak}`, color: '#f97316', bg: 'rgba(249,115,22,.1)' },
            { icon: <Target       className="w-5 h-5" />, label: 'Целей всего',     value: totalGoals, sub: `${doneGoals} завершено`, color: '#93d5f0', bg: 'rgba(147,213,240,.12)' },
            { icon: <Star         className="w-5 h-5" />, label: 'Прогресс',        value: `${completionPct}%`, sub: 'общий', color: '#c084fc', bg: 'rgba(192,132,252,.12)' },
          ].map((c, i) => (
            <div key={i} className="rounded-3xl p-4 flex flex-col gap-3 ani-up"
              style={{ background: 'rgba(255,255,255,.85)', border: '1.5px solid rgba(255,182,215,.2)', boxShadow: '0 4px 20px rgba(200,150,180,.08)', animationDelay: `${i * 60}ms` }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: c.bg, color: c.color }}>
                {c.icon}
              </div>
              <div>
                <div className="text-[26px] font-black leading-none" style={{ color: '#5a3a5a' }}>{c.value}</div>
                <div className="text-[11px] font-semibold mt-0.5" style={{ color: '#b090b0' }}>{c.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: '#c8a0c0' }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Activity grid + week chart ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Activity heatmap */}
          <div className="rounded-3xl p-5 ani-up"
            style={{ background: 'rgba(255,255,255,.85)', border: '1.5px solid rgba(255,182,215,.2)', boxShadow: '0 4px 20px rgba(200,150,180,.08)' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4" style={{ color: '#ffb6d9' }} />
              <span className="text-[14px] font-bold" style={{ color: '#5a3a5a' }}>Активность (12 недель)</span>
            </div>
            {/* Day labels */}
            <div className="flex gap-1 mb-1 ml-0">
              <div className="w-6 shrink-0" />
              {DAYS_RU.map(d => (
                <div key={d} className="flex-1 text-center text-[9px] font-semibold" style={{ color: '#c8a0c0' }}>{d}</div>
              ))}
            </div>
            {/* Grid: 12 rows (weeks) × 7 cols (days) */}
            <div className="space-y-1">
              {Array.from({ length: 12 }, (_, wi) => {
                const weekDays = gridDays.slice(wi * 7, wi * 7 + 7);
                const firstOfWeek = weekDays[0]?.date;
                const showLabel = wi === 0 || (firstOfWeek && firstOfWeek.getDate() <= 7);
                return (
                  <div key={wi} className="flex gap-1 items-center">
                    <div className="w-6 shrink-0 text-[9px] font-semibold text-right pr-1" style={{ color: '#c8a0c0' }}>
                      {showLabel && firstOfWeek ? MONTHS_RU[firstOfWeek.getMonth()] : ''}
                    </div>
                    {weekDays.map((day, di) => {
                      const intensity = day.count === 0 ? 0 : Math.ceil(day.count / maxActivity * 4);
                      const isToday = day.key === dateStr(today);
                      const colors = ['rgba(240,220,235,.4)', 'rgba(255,182,215,.35)', 'rgba(255,182,215,.6)', 'rgba(255,150,200,.8)', '#ffb6d9'];
                      return (
                        <div key={di} title={`${day.key}: ${day.count} задач`}
                          className="flex-1 aspect-square rounded-[4px] transition-all duration-200 cursor-default"
                          style={{
                            background: colors[intensity],
                            outline: isToday ? '2px solid #93d5f0' : 'none',
                            outlineOffset: '1px',
                          }} />
                      );
                    })}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-3 justify-end">
              <span className="text-[10px]" style={{ color: '#c8a0c0' }}>меньше</span>
              {['rgba(240,220,235,.4)', 'rgba(255,182,215,.35)', 'rgba(255,182,215,.6)', 'rgba(255,150,200,.8)', '#ffb6d9'].map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-[3px]" style={{ background: c }} />
              ))}
              <span className="text-[10px]" style={{ color: '#c8a0c0' }}>больше</span>
            </div>
          </div>

          {/* Last 7 days bar chart */}
          <div className="rounded-3xl p-5 ani-up"
            style={{ background: 'rgba(255,255,255,.85)', border: '1.5px solid rgba(255,182,215,.2)', boxShadow: '0 4px 20px rgba(200,150,180,.08)', animationDelay: '80ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4" style={{ color: '#93d5f0' }} />
              <span className="text-[14px] font-bold" style={{ color: '#5a3a5a' }}>Последние 7 дней</span>
            </div>
            <div className="flex items-end gap-2 h-[140px]">
              {week7.map((d, i) => {
                const pct = d.count / maxWeek * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="text-[11px] font-bold" style={{ color: d.count > 0 ? '#5a3a5a' : 'transparent' }}>{d.count}</div>
                    <div className="w-full flex items-end" style={{ height: 100 }}>
                      <div className="w-full rounded-t-xl transition-all duration-700"
                        style={{
                          height: `${Math.max(pct, d.count > 0 ? 8 : 3)}%`,
                          background: d.isToday
                            ? 'linear-gradient(180deg,#ffb6d9,#93d5f0)'
                            : 'rgba(255,182,215,.4)',
                          boxShadow: d.isToday ? '0 4px 16px rgba(255,182,215,.4)' : 'none',
                          animationDelay: `${i * 60}ms`,
                        }} />
                    </div>
                    <div className="text-[11px] font-semibold" style={{ color: d.isToday ? '#c06090' : '#c8a0c0' }}>{d.label}</div>
                  </div>
                );
              })}
            </div>
            {/* Month comparison */}
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(240,168,208,.2)' }}>
              <div className="text-[11px] font-semibold mb-2" style={{ color: '#b090b0' }}>По месяцам</div>
              <div className="flex gap-3">
                {monthBars.map((m, i) => (
                  <div key={i} className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold" style={{ color: m.isCurrent ? '#c06090' : '#c8a0c0' }}>{m.label}</span>
                      <span className="text-[11px] font-bold" style={{ color: '#5a3a5a' }}>{m.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(240,220,235,.5)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${m.count / maxMonth * 100}%`,
                          background: m.isCurrent ? 'linear-gradient(90deg,#ffb6d9,#93d5f0)' : 'rgba(255,182,215,.5)',
                        }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Goals progress ── */}
        {goalStats.length > 0 && (
          <div className="rounded-3xl p-5 ani-up"
            style={{ background: 'rgba(255,255,255,.85)', border: '1.5px solid rgba(255,182,215,.2)', boxShadow: '0 4px 20px rgba(200,150,180,.08)' }}>
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-4 h-4" style={{ color: '#c084fc' }} />
              <span className="text-[14px] font-bold" style={{ color: '#5a3a5a' }}>Прогресс по целям</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalStats.map((g, i) => {
                const hex = GOAL_COLORS[g.color];
                return (
                  <div key={g.id} className="flex items-center gap-4 p-3 rounded-2xl ani-up"
                    style={{ background: `${hex}0d`, border: `1px solid ${hex}25`, animationDelay: `${i * 50}ms` }}>
                    {/* Ring */}
                    <div className="relative shrink-0 w-14 h-14 flex items-center justify-center">
                      <Ring pct={g.pct} size={56} stroke={5} color={hex} bg={`${hex}25`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[13px] font-black" style={{ color: hex }}>{g.pct}%</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold truncate mb-1" style={{ color: '#5a3a5a' }}>{g.title}</div>
                      <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: `${hex}20` }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${g.pct}%`, background: hex }} />
                      </div>
                      <div className="text-[11px]" style={{ color: '#b090b0' }}>
                        {g.done} из {g.total} задач выполнено
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalTasks === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 ani-up">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgba(255,182,215,.2),rgba(147,213,240,.2))', border: '1.5px solid rgba(255,182,215,.3)' }}>
              <TrendingUp className="w-8 h-8" style={{ color: '#ffb6d9' }} />
            </div>
            <div className="text-center">
              <div className="text-[16px] font-bold mb-1" style={{ color: '#5a3a5a' }}>Пока нет данных</div>
              <div className="text-[13px]" style={{ color: '#b090b0' }}>Добавь цели и задачи, чтобы видеть статистику</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
