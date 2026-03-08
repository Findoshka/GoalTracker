import type { BigGoal, MonthlyStage, WeeklyGoal } from './types';

let counter = Date.now();
export function uid(): string {
  return (counter++).toString(36) + Math.random().toString(36).slice(2, 7);
}

export function calcWeeklyProgress(week: WeeklyGoal): number {
  if (week.tasks.length === 0) return 0;
  const done = week.tasks.filter((t) => t.completed).length;
  return Math.round((done / week.tasks.length) * 100);
}

export function calcMonthlyProgress(stage: MonthlyStage): number {
  if (stage.weeklyGoals.length === 0) return 0;
  const total = stage.weeklyGoals.reduce(
    (sum, w) => sum + calcWeeklyProgress(w),
    0,
  );
  return Math.round(total / stage.weeklyGoals.length);
}

export function calcGoalProgress(goal: BigGoal): number {
  if (goal.monthlyStages.length === 0) return 0;
  const total = goal.monthlyStages.reduce(
    (sum, s) => sum + calcMonthlyProgress(s),
    0,
  );
  return Math.round(total / goal.monthlyStages.length);
}

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель',
  'Май', 'Июнь', 'Июль', 'Август',
  'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export function monthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? '';
}

export function getWeeksInMonth(month: number, year: number): number {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const dayOfWeek = first.getDay() === 0 ? 7 : first.getDay();
  const totalDays = last.getDate();
  return Math.ceil((totalDays + dayOfWeek - 1) / 7);
}

// ── Cute completion sound via Web Audio API ───────────────────────────────────
let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!_audioCtx) _audioCtx = new AudioContext();
  return _audioCtx;
}

// Plays a soft two-note "ding-ding" — gentle and cute like a tiny bell
export function playMeow(volume = 0.15) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Helper: play one soft bell note
    const bell = (freq: number, startAt: number, dur: number, vol: number) => {
      // Sine + a touch of triangle for warmth
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = freq;

      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = freq * 2.756; // inharmonic partial — bell-like

      const g1 = ctx.createGain();
      g1.gain.setValueAtTime(0, startAt);
      g1.gain.linearRampToValueAtTime(vol, startAt + 0.008);
      g1.gain.exponentialRampToValueAtTime(vol * 0.3, startAt + dur * 0.4);
      g1.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);

      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0, startAt);
      g2.gain.linearRampToValueAtTime(vol * 0.18, startAt + 0.008);
      g2.gain.exponentialRampToValueAtTime(0.0001, startAt + dur * 0.5);

      osc1.connect(g1); g1.connect(ctx.destination);
      osc2.connect(g2); g2.connect(ctx.destination);

      osc1.start(startAt); osc1.stop(startAt + dur + 0.05);
      osc2.start(startAt); osc2.stop(startAt + dur + 0.05);
    };

    // Two ascending notes — cheerful little "ding ding!"
    bell(880, now,        0.55, volume);       // A5
    bell(1174, now + 0.13, 0.6,  volume * 0.85); // D6

    // Tiny sparkle shimmer on top
    const shimmer = ctx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(2637, now + 0.12);
    shimmer.frequency.exponentialRampToValueAtTime(3136, now + 0.22);
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0, now + 0.12);
    sg.gain.linearRampToValueAtTime(volume * 0.06, now + 0.15);
    sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    shimmer.connect(sg); sg.connect(ctx.destination);
    shimmer.start(now + 0.12); shimmer.stop(now + 0.4);

  } catch {
    // silently ignore if audio not supported
  }
}
