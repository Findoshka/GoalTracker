import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const p = (v: string | string[]) => (Array.isArray(v) ? v[0] : v);

router.get('/', async (req: AuthRequest, res: Response) => {
  const tasks = await prisma.inboxTask.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'asc' },
  });
  res.json(tasks);
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const { title, dueDate } = req.body;
  const task = await prisma.inboxTask.create({
    data: { userId: req.userId!, title, dueDate: dueDate ?? null },
  });
  res.status(201).json(task);
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const id = p(req.params.id);
  const task = await prisma.inboxTask.findFirst({ where: { id, userId: req.userId! } });
  if (!task) { res.status(404).json({ error: 'Not found' }); return; }
  const updated = await prisma.inboxTask.update({ where: { id }, data: req.body });
  res.json(updated);
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = p(req.params.id);
  const task = await prisma.inboxTask.findFirst({ where: { id, userId: req.userId! } });
  if (!task) { res.status(404).json({ error: 'Not found' }); return; }
  await prisma.inboxTask.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
