export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  weekNumber: number;
  tasks: Task[];
}

export interface MonthlyStage {
  id: string;
  title: string;
  month: number;
  year: number;
  weeklyGoals: WeeklyGoal[];
}

export interface BigGoal {
  id: string;
  title: string;
  description: string;
  color: GoalColor;
  createdAt: string;
  deadline: string;
  monthlyStages: MonthlyStage[];
}

export interface InboxTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export type GoalColor = 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'cyan' | 'pink';

export type ViewMode = 'inbox' | 'today' | 'plans' | 'calendar' | 'goal-detail' | 'stats' | 'habits';

export type HabitColor = 'pink' | 'blue' | 'green' | 'orange' | 'purple' | 'cyan' | 'red';
export type HabitIcon  = 'star' | 'heart' | 'zap' | 'book' | 'dumbbell' | 'droplets' | 'music' | 'sun';

export interface Habit {
  id: string;
  title: string;
  description: string;
  color: HabitColor;
  icon: HabitIcon;
  completions: string[]; // array of YYYY-MM-DD strings
  createdAt: string;
}

export const HABIT_COLORS: Record<HabitColor, string> = {
  pink:   '#ffb6d9',
  blue:   '#93d5f0',
  green:  '#86efac',
  orange: '#fda4af',
  purple: '#c084fc',
  cyan:   '#67e8f9',
  red:    '#f472b6',
};

export const GOAL_COLORS: Record<GoalColor, string> = {
  blue:   '#7ec8e3',
  red:    '#f472b6',
  green:  '#86efac',
  orange: '#fda4af',
  purple: '#c084fc',
  cyan:   '#67e8f9',
  pink:   '#f9a8d4',
};
