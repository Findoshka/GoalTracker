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
