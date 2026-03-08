import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const p = (v: string | string[]) => (Array.isArray(v) ? v[0] : v);

// ─── Goals CRUD ──────────────────────────────────────────────────────────────

router.get('/', async (req: AuthRequest, res: Response) => {
  const goals = await prisma.goal.findMany({
    where: { userId: req.userId! },
    include: { monthlyStages: { include: { weeklyGoals: { include: { tasks: true } } } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(goals);
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const { title, description, color, deadline } = req.body;
  const goal = await prisma.goal.create({
    data: { userId: req.userId!, title, description: description ?? '', color: color ?? 'blue', deadline: deadline ?? null },
    include: { monthlyStages: { include: { weeklyGoals: { include: { tasks: true } } } } },
  });
  res.status(201).json(goal);
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const id = p(req.params.id);
  const goal = await prisma.goal.findFirst({ where: { id, userId: req.userId! } });
  if (!goal) { res.status(404).json({ error: 'Not found' }); return; }
  const updated = await prisma.goal.update({
    where: { id },
    data: req.body,
    include: { monthlyStages: { include: { weeklyGoals: { include: { tasks: true } } } } },
  });
  res.json(updated);
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = p(req.params.id);
  const goal = await prisma.goal.findFirst({ where: { id, userId: req.userId! } });
  if (!goal) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.goal.delete({ where: { id } });
  res.json({ ok: true });
});

// ─── Monthly Stages ──────────────────────────────────────────────────────────

router.post('/:goalId/stages', async (req: AuthRequest, res: Response) => {
  const goalId = p(req.params.goalId);
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId: req.userId! } });
  if (!goal) { res.status(404).json({ error: 'Goal not found' }); return; }
  const { title, month, year } = req.body;
  const stage = await prisma.monthlyStage.create({
    data: { goalId, title, month, year },
    include: { weeklyGoals: { include: { tasks: true } } },
  });
  res.status(201).json(stage);
});

router.patch('/:goalId/stages/:stageId', async (req: AuthRequest, res: Response) => {
  const stageId = p(req.params.stageId);
  const stage = await prisma.monthlyStage.findFirst({ where: { id: stageId, goal: { userId: req.userId! } } });
  if (!stage) { res.status(404).json({ error: 'Not found' }); return; }
  const updated = await prisma.monthlyStage.update({
    where: { id: stageId }, data: req.body,
    include: { weeklyGoals: { include: { tasks: true } } },
  });
  res.json(updated);
});

router.delete('/:goalId/stages/:stageId', async (req: AuthRequest, res: Response) => {
  const stageId = p(req.params.stageId);
  const stage = await prisma.monthlyStage.findFirst({ where: { id: stageId, goal: { userId: req.userId! } } });
  if (!stage) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.monthlyStage.delete({ where: { id: stageId } });
  res.json({ ok: true });
});

// ─── Weekly Goals ────────────────────────────────────────────────────────────

router.post('/:goalId/stages/:stageId/weeks', async (req: AuthRequest, res: Response) => {
  const stageId = p(req.params.stageId);
  const stage = await prisma.monthlyStage.findFirst({ where: { id: stageId, goal: { userId: req.userId! } } });
  if (!stage) { res.status(404).json({ error: 'Stage not found' }); return; }
  const { title, weekNumber } = req.body;
  const week = await prisma.weeklyGoal.create({
    data: { monthlyStageId: stageId, title, weekNumber },
    include: { tasks: true },
  });
  res.status(201).json(week);
});

router.patch('/:goalId/stages/:stageId/weeks/:weekId', async (req: AuthRequest, res: Response) => {
  const weekId = p(req.params.weekId);
  const week = await prisma.weeklyGoal.findFirst({ where: { id: weekId, monthlyStage: { goal: { userId: req.userId! } } } });
  if (!week) { res.status(404).json({ error: 'Not found' }); return; }
  const updated = await prisma.weeklyGoal.update({ where: { id: weekId }, data: req.body, include: { tasks: true } });
  res.json(updated);
});

router.delete('/:goalId/stages/:stageId/weeks/:weekId', async (req: AuthRequest, res: Response) => {
  const weekId = p(req.params.weekId);
  const week = await prisma.weeklyGoal.findFirst({ where: { id: weekId, monthlyStage: { goal: { userId: req.userId! } } } });
  if (!week) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.weeklyGoal.delete({ where: { id: weekId } });
  res.json({ ok: true });
});

// ─── Tasks ───────────────────────────────────────────────────────────────────

router.post('/:goalId/stages/:stageId/weeks/:weekId/tasks', async (req: AuthRequest, res: Response) => {
  const weekId = p(req.params.weekId);
  const week = await prisma.weeklyGoal.findFirst({ where: { id: weekId, monthlyStage: { goal: { userId: req.userId! } } } });
  if (!week) { res.status(404).json({ error: 'Week not found' }); return; }
  const { title, dueDate } = req.body;
  const task = await prisma.task.create({ data: { weeklyGoalId: weekId, title, dueDate: dueDate ?? null } });
  res.status(201).json(task);
});

router.patch('/:goalId/stages/:stageId/weeks/:weekId/tasks/:taskId', async (req: AuthRequest, res: Response) => {
  const taskId = p(req.params.taskId);
  const task = await prisma.task.findFirst({ where: { id: taskId, weeklyGoal: { monthlyStage: { goal: { userId: req.userId! } } } } });
  if (!task) { res.status(404).json({ error: 'Not found' }); return; }
  const updated = await prisma.task.update({ where: { id: taskId }, data: req.body });
  res.json(updated);
});

router.delete('/:goalId/stages/:stageId/weeks/:weekId/tasks/:taskId', async (req: AuthRequest, res: Response) => {
  const taskId = p(req.params.taskId);
  const task = await prisma.task.findFirst({ where: { id: taskId, weeklyGoal: { monthlyStage: { goal: { userId: req.userId! } } } } });
  if (!task) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.task.delete({ where: { id: taskId } });
  res.json({ ok: true });
});

// Move task to a different week (drag & drop)
router.patch('/:goalId/tasks/:taskId/move', async (req: AuthRequest, res: Response) => {
  const taskId = p(req.params.taskId);
  const { targetWeekId } = req.body;
  const task = await prisma.task.findFirst({ where: { id: taskId, weeklyGoal: { monthlyStage: { goal: { userId: req.userId! } } } } });
  if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
  const targetWeek = await prisma.weeklyGoal.findFirst({ where: { id: targetWeekId, monthlyStage: { goal: { userId: req.userId! } } } });
  if (!targetWeek) { res.status(404).json({ error: 'Target week not found' }); return; }
  const updated = await prisma.task.update({ where: { id: taskId }, data: { weeklyGoalId: targetWeekId } });
  res.json(updated);
});

export default router;
