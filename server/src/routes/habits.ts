import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const p = (v: string | string[]) => (Array.isArray(v) ? v[0] : v);

// GET /api/habits — list all habits with completions
router.get('/', async (req: AuthRequest, res: Response) => {
  const habits = await prisma.habit.findMany({
    where: { userId: req.userId!, archived: false },
    include: { completions: { orderBy: { date: 'desc' } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(habits);
});

// POST /api/habits — create habit
router.post('/', async (req: AuthRequest, res: Response) => {
  const { title, description, color, icon } = req.body;
  const habit = await prisma.habit.create({
    data: { userId: req.userId!, title, description: description ?? '', color: color ?? 'pink', icon: icon ?? 'star' },
    include: { completions: true },
  });
  res.status(201).json(habit);
});

// PATCH /api/habits/:id — update habit
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const id = p(req.params.id);
  const habit = await prisma.habit.findFirst({ where: { id, userId: req.userId! } });
  if (!habit) { res.status(404).json({ error: 'Not found' }); return; }
  const updated = await prisma.habit.update({
    where: { id },
    data: req.body,
    include: { completions: true },
  });
  res.json(updated);
});

// DELETE /api/habits/:id — delete habit
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = p(req.params.id);
  const habit = await prisma.habit.findFirst({ where: { id, userId: req.userId! } });
  if (!habit) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.habit.delete({ where: { id } });
  res.json({ ok: true });
});

// POST /api/habits/:id/complete — toggle completion for a date
router.post('/:id/complete', async (req: AuthRequest, res: Response) => {
  const id = p(req.params.id);
  const habit = await prisma.habit.findFirst({ where: { id, userId: req.userId! } });
  if (!habit) { res.status(404).json({ error: 'Not found' }); return; }

  const { date } = req.body; // YYYY-MM-DD
  if (!date) { res.status(400).json({ error: 'date required' }); return; }

  const existing = await prisma.habitCompletion.findUnique({ where: { habitId_date: { habitId: id, date } } });
  if (existing) {
    await prisma.habitCompletion.delete({ where: { id: existing.id } });
    res.json({ completed: false, date });
  } else {
    await prisma.habitCompletion.create({ data: { habitId: id, date } });
    res.json({ completed: true, date });
  }
});

export default router;
