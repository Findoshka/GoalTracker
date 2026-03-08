import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import authRouter from './routes/auth';
import goalsRouter from './routes/goals';
import inboxRouter from './routes/inbox';
import habitsRouter from './routes/habits';

const app = express();
const PORT = parseInt(process.env.PORT ?? '4000', 10);

app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/auth', authRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/inbox', inboxRouter);
app.use('/api/habits', habitsRouter);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
});
