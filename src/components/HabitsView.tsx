import { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store';
import { HABIT_COLORS, type HabitColor, type HabitIcon } from '../types';
import { Plus, Flame, Check, Trash2, X, Star, Heart, Zap, BookOpen, Dumbbell, Droplets, Music, Sun, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

// ── Motivational quotes ───────────────────────────────────────────────────────
const QUOTES = [
  { text: 'Маленькие шаги каждый день приводят к большим результатам.', author: 'Лао-цзы' },
  { text: 'Успех — это сумма маленьких усилий, повторяемых день за днём.', author: 'Роберт Кольер' },
  { text: 'Не важно, как медленно ты идёшь, главное — не останавливаться.', author: 'Конфуций' },
  { text: 'Дисциплина — это мост между целями и достижениями.', author: 'Джим Рон' },
  { text: 'Каждый день — это новый шанс стать лучше, чем вчера.', author: '' },
  { text: 'Привычки — это архитектура нашей жизни.', author: '' },
  { text: 'Ты ближе к цели, чем думаешь. Продолжай!', author: '' },
  { text: 'Победа над собой — самая великая из побед.', author: 'Платон' },
  { text: 'Сила воли — это мышца. Чем больше тренируешь, тем сильнее становится.', author: '' },
  { text: 'Один день без привычки — это просто день. Один год — это жизнь.', author: '' },
  { text: 'Твои действия сегодня — это твоя жизнь завтра.', author: '' },
  { text: 'Постоянство — ключ к мастерству.', author: '' },
  { text: 'Каждое выполненное дело делает тебя сильнее.', author: '' },
  { text: 'Не ищи мотивацию — создавай привычку.', author: '' },
  { text: 'Серия дней — это не просто цифра. Это твой характер.', author: '' },
];

function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

// ── Motivation toast ──────────────────────────────────────────────────────────
function MotivationToast({ habitTitle, onClose }: { habitTitle: string; onClose: () => void }) {
  const quote = useMemo(() => getRandomQuote(), []);
  const [visible, setVisible] = useState(false);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 400);
  }, [onClose]);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 30);
    const t2 = setTimeout(close, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [close]);

  const toast = (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: `translateX(-50%) translateY(${visible ? 0 : 40}px) scale(${visible ? 1 : 0.95})`,
      opacity: visible ? 1 : 0,
      transition: 'transform .4s cubic-bezier(.34,1.56,.64,1), opacity .35s ease',
      zIndex: 9999, width: '100%', maxWidth: 380, padding: '0 16px',
      pointerEvents: 'auto',
    }}>
      <div style={{
        borderRadius: 24, overflow: 'hidden',
        background: 'rgba(255,248,253,.98)',
        border: '1.5px solid rgba(255,182,215,.45)',
        boxShadow: '0 24px 60px rgba(200,150,180,.3), 0 4px 20px rgba(147,213,240,.2)',
      }}>
        {/* Top strip */}
        <div style={{ height: 4, background: 'linear-gradient(90deg,#ffb6d9,#93d5f0)' }} />

        <div style={{ padding: '16px 20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,rgba(255,182,215,.3),rgba(147,213,240,.3))' }}>
                <Sparkles style={{ width: 18, height: 18, color: '#e879b8' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#5a3a5a' }}>Отлично!</div>
                <div style={{ fontSize: 11, color: '#b090b0', marginTop: 1 }}>«{habitTitle}» выполнено</div>
              </div>
            </div>
            <button onClick={close}
              style={{ width: 28, height: 28, borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8a0c0' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,182,215,.18)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Quote */}
          <div style={{ padding: '12px 14px', borderRadius: 16, background: 'linear-gradient(135deg,rgba(255,182,215,.12),rgba(147,213,240,.12))', border: '1px solid rgba(255,182,215,.25)' }}>
            <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.55, color: '#5a3a5a', margin: 0 }}>
              «{quote.text}»
            </p>
            {quote.author && (
              <p style={{ fontSize: 11, color: '#b090b0', marginTop: 6, textAlign: 'right', margin: '6px 0 0' }}>
                — {quote.author}
              </p>
            )}
          </div>

          {/* Timer bar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
            <div style={{ height: 3, borderRadius: 99, overflow: 'hidden', width: 60, background: 'rgba(255,182,215,.2)' }}>
              <div style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#ffb6d9,#93d5f0)', animation: 'quote-timer 4.5s linear forwards' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(toast, document.body);
}

// ── helpers ───────────────────────────────────────────────────────────────────
function dateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

const DAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const MONTHS_RU  = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

const ICON_MAP: Record<HabitIcon, React.ReactNode> = {
  star:      <Star      className="w-4 h-4" />,
  heart:     <Heart     className="w-4 h-4" />,
  zap:       <Zap       className="w-4 h-4" />,
  book:      <BookOpen  className="w-4 h-4" />,
  dumbbell:  <Dumbbell  className="w-4 h-4" />,
  droplets:  <Droplets  className="w-4 h-4" />,
  music:     <Music     className="w-4 h-4" />,
  sun:       <Sun       className="w-4 h-4" />,
};

const ICON_OPTIONS: HabitIcon[] = ['star','heart','zap','book','dumbbell','droplets','music','sun'];
const COLOR_OPTIONS: HabitColor[] = ['pink','blue','green','orange','purple','cyan','red'];

// ── streak calc ───────────────────────────────────────────────────────────────
function calcStreak(completions: string[]): number {
  const set = new Set(completions);
  const today = new Date(); today.setHours(0,0,0,0);
  let streak = 0;
  let d = new Date(today);
  while (set.has(dateStr(d))) { streak++; d = addDays(d, -1); }
  return streak;
}

// ── HabitForm modal ───────────────────────────────────────────────────────────
function HabitForm({ onClose }: { onClose: () => void }) {
  const { addHabit } = useStore();
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [color, setColor]       = useState<HabitColor>('pink');
  const [icon, setIcon]         = useState<HabitIcon>('star');
  const [loading, setLoading]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await addHabit(title.trim(), desc.trim(), color, icon);
    setLoading(false);
    onClose();
  };

  const hex = HABIT_COLORS[color];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(100,50,80,.25)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-md rounded-3xl overflow-hidden ani-scale"
        style={{ background: 'rgba(255,248,253,.97)', border: '1.5px solid rgba(255,182,215,.3)', boxShadow: '0 32px 80px rgba(200,150,180,.25)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,182,215,.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: `${hex}25`, color: hex }}>
              {ICON_MAP[icon]}
            </div>
            <span className="text-[16px] font-black" style={{ color: '#5a3a5a' }}>Новая привычка</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{ color: '#c8a0c0' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,182,215,.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-[12px] font-bold mb-1.5 block" style={{ color: '#b090b0' }}>Название</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required
              placeholder="Например: Читать 30 минут"
              className="w-full px-4 py-3 rounded-2xl text-[14px] font-medium outline-none transition-all"
              style={{ background: '#fdf6fb', border: '1.5px solid #f0e0ee', color: '#5a3a5a' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#ffb6d9'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(255,182,215,.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#f0e0ee'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>

          {/* Description */}
          <div>
            <label className="text-[12px] font-bold mb-1.5 block" style={{ color: '#b090b0' }}>Описание (необязательно)</label>
            <input value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Зачем эта привычка?"
              className="w-full px-4 py-3 rounded-2xl text-[14px] font-medium outline-none transition-all"
              style={{ background: '#fdf6fb', border: '1.5px solid #f0e0ee', color: '#5a3a5a' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#ffb6d9'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(255,182,215,.12)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#f0e0ee'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>

          {/* Icon */}
          <div>
            <label className="text-[12px] font-bold mb-2 block" style={{ color: '#b090b0' }}>Иконка</label>
            <div className="flex gap-2 flex-wrap">
              {ICON_OPTIONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: icon === ic ? `${hex}25` : 'rgba(240,220,235,.3)',
                    color: icon === ic ? hex : '#c8a0c0',
                    border: icon === ic ? `1.5px solid ${hex}60` : '1.5px solid transparent',
                    transform: icon === ic ? 'scale(1.1)' : 'scale(1)',
                  }}>
                  {ICON_MAP[ic]}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-[12px] font-bold mb-2 block" style={{ color: '#b090b0' }}>Цвет</label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{
                    background: HABIT_COLORS[c],
                    transform: color === c ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: color === c ? `0 4px 12px ${HABIT_COLORS[c]}80` : 'none',
                    outline: color === c ? `2px solid ${HABIT_COLORS[c]}` : 'none',
                    outlineOffset: 2,
                  }} />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading || !title.trim()}
            className="w-full py-4 rounded-2xl text-[15px] font-bold transition-all duration-200 mt-2"
            style={{
              background: 'linear-gradient(135deg,#ffb6d9,#93d5f0)',
              color: '#fff',
              opacity: !title.trim() ? 0.5 : 1,
              boxShadow: title.trim() ? '0 8px 24px rgba(255,182,215,.4)' : 'none',
              cursor: !title.trim() ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (title.trim()) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            {loading ? 'Создаём...' : 'Создать привычку'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── HabitCard ─────────────────────────────────────────────────────────────────
function HabitCard({ habit, weekDays }: { habit: import('../types').Habit; weekDays: Date[] }) {
  const { toggleHabitDate, deleteHabit } = useStore();
  const [confirmDel, setConfirmDel] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const hex   = HABIT_COLORS[habit.color];
  const streak = useMemo(() => calcStreak(habit.completions), [habit.completions]);
  const completionSet = useMemo(() => new Set(habit.completions), [habit.completions]);
  const todayKey = dateStr(new Date());
  const doneToday = completionSet.has(todayKey);

  const handleToggleToday = useCallback(async () => {
    const wasDone = completionSet.has(todayKey);
    await toggleHabitDate(habit.id, todayKey);
    // show quote only when marking as done (not undoing)
    if (!wasDone) setShowToast(true);
  }, [completionSet, todayKey, toggleHabitDate, habit.id]);

  // completion rate for shown week
  const weekDone = weekDays.filter(d => completionSet.has(dateStr(d))).length;
  const weekPct  = Math.round(weekDone / weekDays.length * 100);

  return (
    <>
    <div className="rounded-3xl overflow-hidden transition-all duration-200 ani-up h-full"
      style={{ background: 'rgba(255,255,255,.92)', border: `1.5px solid ${hex}35`, boxShadow: `0 6px 28px rgba(200,150,180,.1), 0 0 0 0 ${hex}` }}>
      {/* Color top strip */}
      <div className="h-1.5" style={{ background: `linear-gradient(90deg,${hex},${hex}60)` }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${hex}20`, color: hex, boxShadow: `0 4px 12px ${hex}30` }}>
              <span className="scale-125">{ICON_MAP[habit.icon]}</span>
            </div>
            <div>
              <div className="text-[17px] font-black leading-tight" style={{ color: '#5a3a5a' }}>{habit.title}</div>
              {habit.description && (
                <div className="text-[12px] mt-0.5" style={{ color: '#b090b0' }}>{habit.description}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Streak badge */}
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(249,115,22,.1)', border: '1px solid rgba(249,115,22,.2)' }}>
                <Flame className="w-4 h-4" style={{ color: '#f97316' }} />
                <span className="text-[14px] font-black" style={{ color: '#f97316' }}>{streak}</span>
                <span className="text-[10px] font-semibold" style={{ color: '#f97316' }}>дней</span>
              </div>
            )}
            {/* Delete */}
            {confirmDel ? (
              <div className="flex items-center gap-1">
                <button onClick={() => deleteHabit(habit.id)}
                  className="px-2.5 py-1.5 rounded-xl text-[12px] font-bold transition-all"
                  style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444' }}>
                  Удалить
                </button>
                <button onClick={() => setConfirmDel(false)}
                  className="px-2.5 py-1.5 rounded-xl text-[12px] font-bold transition-all"
                  style={{ background: 'rgba(200,160,192,.1)', color: '#c8a0c0' }}>
                  Отмена
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDel(true)}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                style={{ color: '#d4b8cc' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#d4b8cc'; (e.currentTarget as HTMLElement).style.background = ''; }}>
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Week tracker row */}
        <div className="flex gap-2 mb-4">
          {weekDays.map((d, i) => {
            const key  = dateStr(d);
            const done = completionSet.has(key);
            const isToday = key === todayKey;
            const isFuture = d > new Date();
            return (
              <button key={i} onClick={() => !isFuture && toggleHabitDate(habit.id, key)}
                disabled={isFuture}
                className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-2xl transition-all duration-200"
                style={{
                  background: done ? `${hex}22` : isToday ? 'rgba(255,182,215,.1)' : 'rgba(240,220,235,.25)',
                  border: isToday ? `1.5px solid ${hex}60` : '1.5px solid transparent',
                  cursor: isFuture ? 'default' : 'pointer',
                  opacity: isFuture ? 0.35 : 1,
                }}
                onMouseEnter={e => { if (!isFuture) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px ${hex}25`; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                <span className="text-[10px] font-bold" style={{ color: isToday ? hex : '#c8a0c0' }}>
                  {DAYS_SHORT[(d.getDay() + 6) % 7]}
                </span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{
                    background: done ? hex : 'transparent',
                    border: done ? 'none' : `2px solid ${isToday ? hex + '80' : 'rgba(200,160,192,.35)'}`,
                    boxShadow: done ? `0 3px 10px ${hex}50` : 'none',
                  }}>
                  {done && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </div>
                <span className="text-[10px] font-medium" style={{ color: isToday ? hex : '#c8a0c0' }}>{d.getDate()}</span>
              </button>
            );
          })}
        </div>

        {/* Progress bar + today button */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold" style={{ color: '#b090b0' }}>Неделя</span>
              <span className="text-[11px] font-bold" style={{ color: hex }}>{weekDone}/{weekDays.length}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: `${hex}18` }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${weekPct}%`, background: `linear-gradient(90deg,${hex},${hex}aa)` }} />
            </div>
          </div>
          <button onClick={handleToggleToday}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-200 shrink-0"
            style={{
              background: doneToday ? `${hex}20` : 'linear-gradient(135deg,#ffb6d9,#93d5f0)',
              color: doneToday ? hex : '#fff',
              border: doneToday ? `1.5px solid ${hex}40` : 'none',
              boxShadow: doneToday ? 'none' : '0 4px 14px rgba(255,182,215,.4)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
            {doneToday
              ? <><Check className="w-4 h-4" strokeWidth={3} /> Выполнено</>
              : <><Check className="w-4 h-4" strokeWidth={3} /> Сегодня</>}
          </button>
        </div>
      </div>
    </div>

    {showToast && (
      <MotivationToast habitTitle={habit.title} onClose={() => setShowToast(false)} />
    )}
    </>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export function HabitsView() {
  const { habits } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week

  // Build 7 days for current week (Mon–Sun) + offset
  const weekDays = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const dow = today.getDay(); // 0=Sun
    const monday = addDays(today, (dow === 0 ? -6 : 1 - dow) + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [weekOffset]);

  const weekLabel = useMemo(() => {
    const first = weekDays[0], last = weekDays[6];
    if (first.getMonth() === last.getMonth())
      return `${first.getDate()}–${last.getDate()} ${MONTHS_RU[first.getMonth()]}`;
    return `${first.getDate()} ${MONTHS_RU[first.getMonth()]} – ${last.getDate()} ${MONTHS_RU[last.getMonth()]}`;
  }, [weekDays]);

  const totalStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(h => calcStreak(h.completions)));
  }, [habits]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-10 h-[64px] shrink-0"
        style={{ borderBottom: '1px solid rgba(240,168,208,.18)' }}>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[20px] font-black" style={{ color: '#5a3a5a' }}>Привычки</h1>
            <p className="text-[12px]" style={{ color: '#b090b0' }}>ежедневные цели</p>
          </div>
          {totalStreak > 0 && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl"
              style={{ background: 'rgba(249,115,22,.1)', border: '1px solid rgba(249,115,22,.2)' }}>
              <Flame className="w-4 h-4" style={{ color: '#f97316' }} />
              <span className="text-[13px] font-black" style={{ color: '#f97316' }}>{totalStreak}</span>
              <span className="text-[11px]" style={{ color: '#f97316' }}>макс. серия</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Week nav */}
          <div className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-2xl"
            style={{ background: 'rgba(255,182,215,.1)', border: '1px solid rgba(255,182,215,.2)' }}>
            <button onClick={() => setWeekOffset(v => v - 1)}
              className="w-6 h-6 flex items-center justify-center rounded-lg transition-all"
              style={{ color: '#c8a0c0' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#c06090'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#c8a0c0'; }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[12px] font-semibold px-1" style={{ color: '#9070a0' }}>{weekLabel}</span>
            <button onClick={() => setWeekOffset(v => Math.min(v + 1, 0))} disabled={weekOffset >= 0}
              className="w-6 h-6 flex items-center justify-center rounded-lg transition-all"
              style={{ color: weekOffset >= 0 ? '#e0c8d8' : '#c8a0c0' }}
              onMouseEnter={e => { if (weekOffset < 0) (e.currentTarget as HTMLElement).style.color = '#c06090'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = weekOffset >= 0 ? '#e0c8d8' : '#c8a0c0'; }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-[13px] font-bold transition-all duration-200"
            style={{ background: 'linear-gradient(135deg,#ffb6d9,#93d5f0)', color: '#fff', boxShadow: '0 4px 16px rgba(255,182,215,.4)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(255,182,215,.5)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(255,182,215,.4)'; }}>
            <Plus className="w-4 h-4" /> Добавить
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-6">
        {habits.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-6 ani-up">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,rgba(255,182,215,.25),rgba(147,213,240,.25))', border: '2px solid rgba(255,182,215,.35)' }}>
              <Flame className="w-12 h-12" style={{ color: '#ffb6d9' }} />
            </div>
            <div className="text-center">
              <div className="text-[22px] font-black mb-2" style={{ color: '#5a3a5a' }}>Нет привычек</div>
              <div className="text-[15px] mb-8" style={{ color: '#b090b0' }}>
                Добавь ежедневные привычки и следи<br/>за серией дней подряд
              </div>
              <button onClick={() => setFormOpen(true)}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-[15px] font-bold transition-all duration-200 mx-auto"
                style={{ background: 'linear-gradient(135deg,#ffb6d9,#93d5f0)', color: '#fff', boxShadow: '0 8px 24px rgba(255,182,215,.4)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(255,182,215,.5)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(255,182,215,.4)'; }}>
                <Plus className="w-5 h-5" /> Создать первую привычку
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {habits.map((h, i) => (
              <div key={h.id} style={{ animationDelay: `${i * 50}ms` }}>
                <HabitCard habit={h} weekDays={weekDays} />
              </div>
            ))}
            {/* Add new card */}
            <button onClick={() => setFormOpen(true)}
              className="rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-200 min-h-[160px] ani-up"
              style={{
                background: 'rgba(255,255,255,.5)',
                border: '2px dashed rgba(255,182,215,.4)',
                animationDelay: `${habits.length * 50}ms`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ffb6d9'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,182,215,.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,182,215,.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.5)'; }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,rgba(255,182,215,.2),rgba(147,213,240,.2))', border: '1.5px solid rgba(255,182,215,.3)' }}>
                <Plus className="w-6 h-6" style={{ color: '#ffb6d9' }} />
              </div>
              <span className="text-[14px] font-bold" style={{ color: '#c8a0c0' }}>Добавить привычку</span>
            </button>
          </div>
        )}
      </div>

      {formOpen && <HabitForm onClose={() => setFormOpen(false)} />}
    </div>
  );
}
