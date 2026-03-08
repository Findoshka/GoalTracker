import { create } from 'zustand';
import type { BigGoal, GoalColor, Habit, HabitColor, HabitIcon, InboxTask, ViewMode } from './types';
import { goalsApi, inboxApi, habitsApi } from './api';

// Map API response (snake_case ids) to frontend types
function mapGoal(g: Record<string, unknown>): BigGoal {
  return {
    id: g.id as string,
    title: g.title as string,
    description: (g.description as string) ?? '',
    color: (g.color as GoalColor) ?? 'blue',
    deadline: (g.deadline as string) ?? '',
    createdAt: g.createdAt as string,
    monthlyStages: ((g.monthlyStages as Record<string, unknown>[]) ?? []).map(ms => ({
      id: ms.id as string,
      title: ms.title as string,
      month: ms.month as number,
      year: ms.year as number,
      weeklyGoals: ((ms.weeklyGoals as Record<string, unknown>[]) ?? []).map(wg => ({
        id: wg.id as string,
        title: wg.title as string,
        weekNumber: wg.weekNumber as number,
        tasks: ((wg.tasks as Record<string, unknown>[]) ?? []).map(t => ({
          id: t.id as string,
          title: t.title as string,
          completed: t.completed as boolean,
          dueDate: (t.dueDate as string | undefined) ?? undefined,
        })),
      })),
    })),
  };
}

function mapInbox(t: Record<string, unknown>): InboxTask {
  return {
    id: t.id as string,
    title: t.title as string,
    completed: t.completed as boolean,
    dueDate: (t.dueDate as string | undefined) ?? undefined,
    createdAt: t.createdAt as string,
  };
}

function mapHabit(h: Record<string, unknown>): Habit {
  const completions = ((h.completions as { date: string }[]) ?? []).map(c => c.date);
  return {
    id: h.id as string,
    title: h.title as string,
    description: (h.description as string) ?? '',
    color: (h.color as Habit['color']) ?? 'pink',
    icon: (h.icon as Habit['icon']) ?? 'star',
    completions,
    createdAt: h.createdAt as string,
  };
}

interface AppState {
  goals: BigGoal[];
  inbox: InboxTask[];
  habits: Habit[];
  view: ViewMode;
  activeGoalId: string | null;
  initialized: boolean;

  // Bootstrap — load data from API
  loadAll: () => Promise<void>;
  clearAll: () => void;

  setView: (v: ViewMode, goalId?: string) => void;

  // Habits
  addHabit: (title: string, description: string, color: HabitColor, icon: HabitIcon) => Promise<void>;
  updateHabit: (id: string, patch: Partial<Pick<Habit, 'title' | 'description' | 'color' | 'icon'>>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitDate: (id: string, date: string) => Promise<void>;

  // Inbox
  addInboxTask: (title: string, dueDate?: string) => Promise<void>;
  toggleInboxTask: (id: string) => Promise<void>;
  deleteInboxTask: (id: string) => Promise<void>;
  updateInboxTask: (id: string, patch: Partial<Pick<InboxTask, 'title' | 'dueDate'>>) => Promise<void>;

  // Goals
  addGoal: (title: string, description: string, color: GoalColor, deadline: string) => Promise<void>;
  updateGoal: (id: string, patch: Partial<Pick<BigGoal, 'title' | 'description' | 'color' | 'deadline'>>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Monthly
  addMonthlyStage: (goalId: string, title: string, month: number, year: number) => Promise<void>;
  updateMonthlyStage: (goalId: string, stageId: string, title: string) => Promise<void>;
  deleteMonthlyStage: (goalId: string, stageId: string) => Promise<void>;

  // Weekly
  addWeeklyGoal: (goalId: string, stageId: string, title: string, weekNumber: number) => Promise<void>;
  updateWeeklyGoal: (goalId: string, stageId: string, weekId: string, title: string) => Promise<void>;
  deleteWeeklyGoal: (goalId: string, stageId: string, weekId: string) => Promise<void>;

  // Tasks inside goals
  addTask: (goalId: string, stageId: string, weekId: string, title: string, dueDate?: string) => Promise<void>;
  toggleTask: (goalId: string, stageId: string, weekId: string, taskId: string) => Promise<void>;
  updateTask: (goalId: string, stageId: string, weekId: string, taskId: string, title: string) => Promise<void>;
  rescheduleTask: (goalId: string, stageId: string, weekId: string, taskId: string, dueDate: string) => Promise<void>;
  deleteTask: (goalId: string, stageId: string, weekId: string, taskId: string) => Promise<void>;
  moveTask: (goalId: string, fromStageId: string, fromWeekId: string, taskId: string, toStageId: string, toWeekId: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  goals: [],
  inbox: [],
  habits: [],
  view: 'plans',
  activeGoalId: null,
  initialized: false,

  // ── Bootstrap ────────────────────────────────────────────────────────────────
  loadAll: async () => {
    const [goalsRes, inboxRes, habitsRes] = await Promise.all([
      goalsApi.list(),
      inboxApi.list(),
      habitsApi.list(),
    ]);
    set({
      goals: (goalsRes.data as Record<string, unknown>[]).map(mapGoal),
      inbox: (inboxRes.data as Record<string, unknown>[]).map(mapInbox),
      habits: (habitsRes.data as Record<string, unknown>[]).map(mapHabit),
      initialized: true,
    });
  },

  clearAll: () => set({ goals: [], inbox: [], habits: [], initialized: false, view: 'plans', activeGoalId: null }),

  setView: (v, goalId) => set({ view: v, activeGoalId: goalId ?? null }),

  // ── Habits ───────────────────────────────────────────────────────────────────
  addHabit: async (title, description, color, icon) => {
    const res = await habitsApi.create({ title, description, color, icon });
    const habit = mapHabit(res.data as Record<string, unknown>);
    set(s => ({ habits: [...s.habits, habit] }));
  },

  updateHabit: async (id, patch) => {
    const res = await habitsApi.update(id, patch);
    const updated = mapHabit(res.data as Record<string, unknown>);
    set(s => ({ habits: s.habits.map(h => h.id === id ? updated : h) }));
  },

  deleteHabit: async (id) => {
    await habitsApi.remove(id);
    set(s => ({ habits: s.habits.filter(h => h.id !== id) }));
  },

  toggleHabitDate: async (id, date) => {
    const res = await habitsApi.toggle(id, date);
    const { completed } = res.data as { completed: boolean; date: string };
    set(s => ({
      habits: s.habits.map(h => h.id !== id ? h : {
        ...h,
        completions: completed
          ? [...h.completions, date]
          : h.completions.filter(d => d !== date),
      }),
    }));
  },

  // ── Inbox ─────────────────────────────────────────────────────────────────────
  addInboxTask: async (title, dueDate) => {
    const res = await inboxApi.create({ title, dueDate });
    const task = mapInbox(res.data as Record<string, unknown>);
    set(s => ({ inbox: [...s.inbox, task] }));
  },

  toggleInboxTask: async (id) => {
    const task = get().inbox.find(t => t.id === id);
    if (!task) return;
    const res = await inboxApi.update(id, { completed: !task.completed });
    const updated = mapInbox(res.data as Record<string, unknown>);
    set(s => ({ inbox: s.inbox.map(t => t.id === id ? updated : t) }));
  },

  deleteInboxTask: async (id) => {
    await inboxApi.remove(id);
    set(s => ({ inbox: s.inbox.filter(t => t.id !== id) }));
  },

  updateInboxTask: async (id, patch) => {
    const res = await inboxApi.update(id, patch);
    const updated = mapInbox(res.data as Record<string, unknown>);
    set(s => ({ inbox: s.inbox.map(t => t.id === id ? updated : t) }));
  },

  // ── Goals ─────────────────────────────────────────────────────────────────────
  addGoal: async (title, description, color, deadline) => {
    const res = await goalsApi.create({ title, description, color, deadline: deadline || null });
    const goal = mapGoal(res.data as Record<string, unknown>);
    set(s => ({ goals: [...s.goals, goal] }));
  },

  updateGoal: async (id, patch) => {
    const res = await goalsApi.update(id, patch);
    const updated = mapGoal(res.data as Record<string, unknown>);
    set(s => ({ goals: s.goals.map(g => g.id === id ? updated : g) }));
  },

  deleteGoal: async (id) => {
    await goalsApi.remove(id);
    set(s => ({
      goals: s.goals.filter(g => g.id !== id),
      activeGoalId: s.activeGoalId === id ? null : s.activeGoalId,
      view: s.activeGoalId === id ? 'plans' as ViewMode : s.view,
    }));
  },

  // ── Monthly Stages ────────────────────────────────────────────────────────────
  addMonthlyStage: async (goalId, title, month, year) => {
    const res = await goalsApi.addStage(goalId, { title, month, year });
    const stage = res.data as Record<string, unknown>;
    set(s => ({
      goals: s.goals.map(g => g.id !== goalId ? g : {
        ...g,
        monthlyStages: [...g.monthlyStages, {
          id: stage.id as string,
          title: stage.title as string,
          month: stage.month as number,
          year: stage.year as number,
          weeklyGoals: [],
        }],
      }),
    }));
  },

  updateMonthlyStage: async (goalId, stageId, title) => {
    await goalsApi.updateStage(goalId, stageId, { title });
    set(s => ({
      goals: s.goals.map(g => g.id !== goalId ? g : {
        ...g,
        monthlyStages: g.monthlyStages.map(ms => ms.id === stageId ? { ...ms, title } : ms),
      }),
    }));
  },

  deleteMonthlyStage: async (goalId, stageId) => {
    await goalsApi.removeStage(goalId, stageId);
    set(s => ({
      goals: s.goals.map(g => g.id !== goalId ? g : {
        ...g,
        monthlyStages: g.monthlyStages.filter(ms => ms.id !== stageId),
      }),
    }));
  },

  // ── Weekly Goals ──────────────────────────────────────────────────────────────
  addWeeklyGoal: async (goalId, stageId, title, weekNumber) => {
    const res = await goalsApi.addWeek(goalId, stageId, { title, weekNumber });
    const week = res.data as Record<string, unknown>;
    set(s => ({
      goals: s.goals.map(g => g.id !== goalId ? g : {
        ...g,
        monthlyStages: g.monthlyStages.map(ms => ms.id !== stageId ? ms : {
          ...ms,
          weeklyGoals: [...ms.weeklyGoals, {
            id: week.id as string,
            title: week.title as string,
            weekNumber: week.weekNumber as number,
            tasks: [],
          }],
        }),
      }),
    }));
  },

  updateWeeklyGoal: async (goalId, stageId, weekId, title) => {
    await goalsApi.updateWeek(goalId, stageId, weekId, { title });
    set(s => ({
      goals: s.goals.map(g => g.id !== goalId ? g : {
        ...g,
        monthlyStages: g.monthlyStages.map(ms => ms.id !== stageId ? ms : {
          ...ms,
          weeklyGoals: ms.weeklyGoals.map(wg => wg.id === weekId ? { ...wg, title } : wg),
        }),
      }),
    }));
  },

  deleteWeeklyGoal: async (goalId, stageId, weekId) => {
    await goalsApi.removeWeek(goalId, stageId, weekId);
    set(s => ({
      goals: s.goals.map(g => g.id !== goalId ? g : {
        ...g,
        monthlyStages: g.monthlyStages.map(ms => ms.id !== stageId ? ms : {
          ...ms,
          weeklyGoals: ms.weeklyGoals.filter(wg => wg.id !== weekId),
        }),
      }),
    }));
  },

  // ── Tasks ─────────────────────────────────────────────────────────────────────
  addTask: async (goalId, stageId, weekId, title, dueDate) => {
    const res = await goalsApi.addTask(goalId, stageId, weekId, { title, dueDate });
    const task = res.data as Record<string, unknown>;
    set(s => ({
      goals: s.goals.map(g => g.id !== goalId ? g : {
        ...g,
        monthlyStages: g.monthlyStages.map(ms => ms.id !== stageId ? ms : {
          ...ms,
          weeklyGoals: ms.weeklyGoals.map(wg => wg.id !== weekId ? wg : {
            ...wg,
            tasks: [...wg.tasks, {
              id: task.id as string,
              title: task.title as string,
              completed: task.completed as boolean,
              dueDate: (task.dueDate as string | undefined) ?? undefined,
            }],
          }),
        }),
      }),
    }));
  },

  toggleTask: async (goalId, stageId, weekId, taskId) => {
    const goal = get().goals.find(g => g.id === goalId);
    const task = goal?.monthlyStages.find(ms => ms.id === stageId)
      ?.weeklyGoals.find(wg => wg.id === weekId)
      ?.tasks.find(t => t.id === taskId);
    if (!task) return;
    await goalsApi.updateTask(goalId, stageId, weekId, taskId, { completed: !task.completed });
    set(s => ({
      goals: s.goals.map(g => g.id !== goalId ? g : {
        ...g,
        monthlyStages: g.monthlyStages.map(ms => ms.id !== stageId ? ms : {
          ...ms,
          weeklyGoals: ms.weeklyGoals.map(wg => wg.id !== weekId ? wg : {
            ...wg,
            tasks: wg.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
          }),
        }),
      }),
    }));
  },

  updateTask: async (goalId, stageId, weekId, taskId, title) => {
    await goalsApi.updateTask(goalId, stageId, weekId, taskId, { title });
    set(s => ({
      goals: s.goals.map(g => g.id !== goalId ? g : {
        ...g,
        monthlyStages: g.monthlyStages.map(ms => ms.id !== stageId ? ms : {
          ...ms,
          weeklyGoals: ms.weeklyGoals.map(wg => wg.id !== weekId ? wg : {
            ...wg,
            tasks: wg.tasks.map(t => t.id === taskId ? { ...t, title } : t),
          }),
        }),
      }),
    }));
  },

  rescheduleTask: async (goalId, stageId, weekId, taskId, dueDate) => {
    await goalsApi.updateTask(goalId, stageId, weekId, taskId, { dueDate });
    set(s => ({
      goals: s.goals.map(g => g.id !== goalId ? g : {
        ...g,
        monthlyStages: g.monthlyStages.map(ms => ms.id !== stageId ? ms : {
          ...ms,
          weeklyGoals: ms.weeklyGoals.map(wg => wg.id !== weekId ? wg : {
            ...wg,
            tasks: wg.tasks.map(t => t.id === taskId ? { ...t, dueDate } : t),
          }),
        }),
      }),
    }));
  },

  deleteTask: async (goalId, stageId, weekId, taskId) => {
    await goalsApi.removeTask(goalId, stageId, weekId, taskId);
    set(s => ({
      goals: s.goals.map(g => g.id !== goalId ? g : {
        ...g,
        monthlyStages: g.monthlyStages.map(ms => ms.id !== stageId ? ms : {
          ...ms,
          weeklyGoals: ms.weeklyGoals.map(wg => wg.id !== weekId ? wg : {
            ...wg,
            tasks: wg.tasks.filter(t => t.id !== taskId),
          }),
        }),
      }),
    }));
  },

  moveTask: async (goalId, fromStageId, fromWeekId, taskId, _toStageId, toWeekId) => {
    // Optimistic update first for instant feel
    set(s => {
      const goal = s.goals.find(g => g.id === goalId);
      if (!goal) return s;
      const fromWeek = goal.monthlyStages.find(ms => ms.id === fromStageId)?.weeklyGoals.find(wg => wg.id === fromWeekId);
      const task = fromWeek?.tasks.find(t => t.id === taskId);
      if (!task) return s;
      return {
        goals: s.goals.map(g => g.id !== goalId ? g : {
          ...g,
          monthlyStages: g.monthlyStages.map(ms => ({
            ...ms,
            weeklyGoals: ms.weeklyGoals.map(wg => {
              if (wg.id === fromWeekId) return { ...wg, tasks: wg.tasks.filter(t => t.id !== taskId) };
              if (wg.id === toWeekId) return { ...wg, tasks: [...wg.tasks, task] };
              return wg;
            }),
          })),
        }),
      };
    });
    // Persist to backend
    await goalsApi.moveTask(goalId, taskId, toWeekId);
  },
}));
