import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { prisma } from '../lib/prisma';
import { signAccess, signRefresh, verifyRefresh } from '../lib/jwt';

const router = Router();

// ─── Passport Google Strategy (lazy — only when clientID is configured) ──────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (_accessToken, _refreshToken, profile: Profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email from Google'));

          let user = await prisma.user.findFirst({
            where: { OR: [{ googleId: profile.id }, { email }] },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName,
                avatar: profile.photos?.[0]?.value,
                googleId: profile.id,
              },
            });
          } else if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id, avatar: user.avatar ?? profile.photos?.[0]?.value },
            });
          }
          done(null, user);
        } catch (e) {
          done(e as Error);
        }
      }
    )
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function issueTokens(userId: string, email: string, res: Response) {
  const payload = { sub: userId, email };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId, expiresAt } });

  // Also set cookie as fallback for same-origin setups
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  return { accessToken, refreshToken };
}

// ─── Email / Password Register ───────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
  if (!email || !password) { res.status(400).json({ error: 'Email and password required' }); return; }
  if (password.length < 6) { res.status(400).json({ error: 'Password must be at least 6 characters' }); return; }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) { res.status(409).json({ error: 'Email already registered' }); return; }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, name: name || email.split('@')[0], passwordHash } });

  const { accessToken, refreshToken } = await issueTokens(user.id, user.email, res);
  res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
});

// ─── Email / Password Login ──────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) { res.status(400).json({ error: 'Email and password required' }); return; }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) { res.status(401).json({ error: 'Invalid credentials' }); return; }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { res.status(401).json({ error: 'Invalid credentials' }); return; }

  const { accessToken, refreshToken } = await issueTokens(user.id, user.email, res);
  res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
});

// ─── Refresh Access Token ────────────────────────────────────────────────────
router.post('/refresh', async (req: Request, res: Response) => {
  const token = (req.cookies?.refreshToken as string | undefined)
    ?? (req.body?.refreshToken as string | undefined);
  if (!token) { res.status(401).json({ error: 'No refresh token' }); return; }

  try {
    const payload = verifyRefresh(token);
    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ error: 'Refresh token expired' }); return;
    }

    // Rotate token
    await prisma.refreshToken.delete({ where: { token } });
    const { accessToken, refreshToken: newRefresh } = await issueTokens(payload.sub, payload.email, res);
    res.json({ accessToken, refreshToken: newRefresh });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// ─── Logout ──────────────────────────────────────────────────────────────────
router.post('/logout', async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } }).catch(() => null);
    res.clearCookie('refreshToken', { path: '/auth/refresh' });
  }
  res.json({ ok: true });
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google', (req: Request, res: Response, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(501).json({ error: 'Google OAuth not configured. Add GOOGLE_CLIENT_ID to .env' });
    return;
  }
  passport.authenticate('google', { scope: ['email', 'profile'], session: false })(req, res, next);
});

router.get(
  '/google/callback',
  (req: Request, res: Response, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) { res.redirect(`${process.env.CLIENT_URL}/login?error=not_configured`); return; }
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google` })(req, res, next);
  },
  async (req: Request, res: Response) => {
    const user = req.user as { id: string; email: string; name: string | null; avatar: string | null };
    const { accessToken, refreshToken } = await issueTokens(user.id, user.email, res);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&rt=${refreshToken}`);
  }
);

// ─── Current user ────────────────────────────────────────────────────────────
router.get('/me', async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return; }
  try {
    const { verifyAccess } = await import('../lib/jwt');
    const payload = verifyAccess(header.slice(7));
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, name: true, avatar: true } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Token invalid' });
  }
});

export default router;
