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

// ── Cat meow sound via Web Audio API ─────────────────────────────────────────
let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!_audioCtx) _audioCtx = new AudioContext();
  return _audioCtx;
}

export function playMeow(volume = 0.18) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Carrier oscillator — cat-like frequency sweep
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.linearRampToValueAtTime(780, now + 0.08);
    osc.frequency.linearRampToValueAtTime(620, now + 0.18);
    osc.frequency.linearRampToValueAtTime(480, now + 0.32);

    // Second harmonic for warmth
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1040, now);
    osc2.frequency.linearRampToValueAtTime(1560, now + 0.08);
    osc2.frequency.linearRampToValueAtTime(1240, now + 0.18);
    osc2.frequency.linearRampToValueAtTime(960, now + 0.32);

    // Gain envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.04);
    gain.gain.linearRampToValueAtTime(volume * 0.85, now + 0.15);
    gain.gain.linearRampToValueAtTime(0, now + 0.38);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(volume * 0.3, now + 0.04);
    gain2.gain.linearRampToValueAtTime(volume * 0.2, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0, now + 0.38);

    // Slight vibrato via LFO
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 6;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 12;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(ctx.destination);
    gain2.connect(ctx.destination);

    lfo.start(now);
    osc.start(now);
    osc2.start(now);
    lfo.stop(now + 0.4);
    osc.stop(now + 0.4);
    osc2.stop(now + 0.4);
  } catch {
    // silently ignore if audio not supported
  }
}
