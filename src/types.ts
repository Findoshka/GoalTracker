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

export type ViewMode = 'inbox' | 'today' | 'plans' | 'calendar' | 'goal-detail';

export const GOAL_COLORS: Record<GoalColor, string> = {
  blue:   '#7ec8e3',
  red:    '#f472b6',
  green:  '#86efac',
  orange: '#fda4af',
  purple: '#c084fc',
  cyan:   '#67e8f9',
  pink:   '#f9a8d4',
};
