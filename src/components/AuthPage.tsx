import { useState, useEffect } from 'react';
import { Heart, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../AuthContext';

type Mode = 'login' | 'register';
interface Props { initialMode?: Mode }

export function AuthPage({ initialMode = 'login' }: Props) {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { setError(''); setSuccess(''); }, [mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name || undefined);
        setSuccess('Аккаунт создан! Добро пожаловать');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? 'Что-то пошло не так, попробуйте снова');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg,#fce4f3 0%,#e8f4fd 50%,#fce4f3 100%)' }}>

      {/* ── Animated blobs ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="auth-blob" style={{
          top: '-20%', left: '-15%', width: 750, height: 750,
          background: 'radial-gradient(circle, rgba(249,168,212,.55) 0%, rgba(249,168,212,.08) 50%, transparent 68%)',
          animation: 'auth-blob1 10s ease-in-out infinite',
        }} />
        <div className="auth-blob" style={{
          bottom: '-20%', right: '-15%', width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(126,200,227,.5) 0%, rgba(126,200,227,.06) 50%, transparent 68%)',
          animation: 'auth-blob2 13s ease-in-out infinite',
        }} />
        <div className="auth-blob" style={{
          top: '10%', right: '10%', width: 380, height: 380,
          background: 'radial-gradient(circle, rgba(253,186,232,.45) 0%, transparent 68%)',
          animation: 'auth-blob3 16s ease-in-out infinite',
        }} />
        <div className="auth-blob" style={{
          bottom: '5%', left: '15%', width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(186,230,255,.45) 0%, transparent 68%)',
          animation: 'auth-blob1 12s ease-in-out 2s infinite reverse',
        }} />
      </div>

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-[920px] mx-auto px-4 flex items-center justify-center gap-16">

        {/* Left: brand */}
        <div className="hidden lg:flex flex-col gap-8 flex-1 max-w-[380px] ani-left">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#f9a8d4,#7ec8e3)', boxShadow: '0 12px 36px rgba(249,168,212,.6)' }}>
              <Heart className="w-7 h-7 text-white fill-white" strokeWidth={0} />
            </div>
            <div>
              <div className="text-[22px] font-black" style={{ color: '#4a1a3a' }}>GoalTracker</div>
              <div className="text-[13px] font-medium" style={{ color: '#c4a0b8' }}>твой путь к мечте</div>
            </div>
          </div>

          {/* Headline */}
          <div>
            <div className="font-black leading-[1.05] mb-4"
              style={{ fontSize: 58, color: '#4a1a3a', letterSpacing: '-1.5px' }}>
              Мечтай.<br />
              <span className="glow-text">Планируй.</span><br />
              <span style={{ color: '#7ec8e3' }}>Достигай.</span>
            </div>
            <p className="text-[16px] leading-relaxed" style={{ color: '#9a6080' }}>
              Разбивай большие мечты на конкретные шаги и двигайся к ним каждый день.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            {[{ num:'100%', label:'бесплатно' }, { num:'∞', label:'целей' }, { num:'24/7', label:'доступно' }].map(s => (
              <div key={s.label}>
                <div className="text-[26px] font-black" style={{ color: '#c0628f' }}>{s.num}</div>
                <div className="text-[12px] font-medium" style={{ color: '#c4a0b8' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="w-full max-w-[420px] shrink-0 rounded-[32px] px-9 py-9 ani-scale"
          style={{
            background: 'rgba(255,255,255,.72)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1.5px solid rgba(255,255,255,.95)',
            boxShadow: '0 40px 100px rgba(180,80,140,.22), 0 8px 32px rgba(180,80,140,.1)',
          }}>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-7 lg:hidden">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#f9a8d4,#7ec8e3)', boxShadow: '0 6px 20px rgba(249,168,212,.5)' }}>
              <Heart className="w-5 h-5 text-white fill-white" strokeWidth={0} />
            </div>
            <div>
              <div className="text-[18px] font-black" style={{ color: '#4a1a3a' }}>GoalTracker</div>
              <div className="text-[12px]" style={{ color: '#c4a0b8' }}>твой путь к мечте</div>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-2xl p-1 mb-7"
            style={{ background: 'rgba(249,168,212,.1)', border: '1px solid rgba(249,168,212,.2)' }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-200"
                style={mode === m ? {
                  background: 'linear-gradient(135deg,#f9a8d4,#a8d8ea)',
                  color: '#fff',
                  boxShadow: '0 4px 16px rgba(249,168,212,.4)',
                } : { color: '#c4a0b8' }}>
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-[24px] font-black mb-1" style={{ color: '#4a1a3a' }}>
              {mode === 'login' ? 'С возвращением' : 'Создать аккаунт'}
            </h2>
            <p className="text-[13px]" style={{ color: '#b07aa0' }}>
              {mode === 'login'
                ? 'Войдите, чтобы продолжить работу над целями'
                : 'Зарегистрируйтесь — это займёт секунду'}
            </p>
          </div>

          {/* Google */}
          <button onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[14px] font-bold mb-4 transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,.9)',
              border: '1.5px solid rgba(240,168,208,.35)',
              boxShadow: '0 4px 14px rgba(240,168,208,.18)',
              color: '#5a2a4a',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-2px)'; el.style.boxShadow='0 10px 28px rgba(240,168,208,.36)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform=''; el.style.boxShadow='0 4px 14px rgba(240,168,208,.18)'; }}>
            <GoogleIcon />
            Войти через Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(217,125,186,.3),transparent)' }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#d4a0c0' }}>или</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(217,125,186,.3),transparent)' }} />
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && (
              <InputField icon={<User className="w-4 h-4" />} type="text" placeholder="Ваше имя (необязательно)"
                value={name} onChange={setName} />
            )}
            <InputField icon={<Mail className="w-4 h-4" />} type="email" placeholder="Email адрес"
              value={email} onChange={setEmail} required />
            <InputField icon={<Lock className="w-4 h-4" />}
              type={showPwd ? 'text' : 'password'} placeholder="Пароль (минимум 6 символов)"
              value={password} onChange={setPassword} required
              suffix={
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="p-1 rounded-lg transition-colors shrink-0"
                  style={{ color: '#d4a0c0' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#c0628f'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#d4a0c0'; }}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              } />

            {error && (
              <div className="px-4 py-3 rounded-2xl text-[13px] font-medium ani-scale"
                style={{ background:'rgba(251,113,133,.07)', border:'1px solid rgba(251,113,133,.3)', color:'#e11d48' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="px-4 py-3 rounded-2xl text-[13px] font-medium ani-scale"
                style={{ background:'rgba(126,200,227,.1)', border:'1px solid rgba(126,200,227,.4)', color:'#0e7490' }}>
                {success}
              </div>
            )}

            <button type="submit" disabled={loading || !email || !password}
              className="btn btn-primary btn-lg w-full mt-1">
              {loading ? <LoadingSpinner /> : (
                <>{mode === 'login' ? 'Войти' : 'Создать аккаунт'}<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-[13px] mt-5" style={{ color: '#b07aa0' }}>
            {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-bold transition-colors"
              style={{ color: '#e88cc4' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#c0628f'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#e88cc4'; }}>
              {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function InputField({ icon, type, placeholder, value, onChange, required, suffix }: {
  icon: React.ReactNode; type: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  required?: boolean; suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200"
      style={{
        background: focused ? 'rgba(249,168,212,.07)' : 'rgba(255,255,255,.85)',
        border: focused ? '1.5px solid rgba(232,140,196,.55)' : '1.5px solid rgba(240,168,208,.28)',
        boxShadow: focused ? '0 0 0 4px rgba(249,168,212,.13)' : '0 2px 6px rgba(240,168,208,.07)',
      }}>
      <span className="shrink-0 transition-colors" style={{ color: focused ? '#e88cc4' : '#d4a0c0' }}>
        {icon}
      </span>
      <input type={type} placeholder={placeholder} value={value} required={required}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent text-[14px] font-medium outline-none"
        style={{ color: '#4a1a3a' }} />
      {suffix}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ── OAuth callback ────────────────────────────────────────────────────────────
export function OAuthCallback() {
  const { setTokenAndUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'waking'>('loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');
    if (error) { window.location.replace('/?error=' + error); return; }
    if (!token) { window.location.replace('/'); return; }

    const rt = params.get('rt');

    const tryLogin = async (retries = 10, delay = 4000) => {
      const { setAccessToken, saveRefreshToken, authApi: a } = await import('../api');
      setAccessToken(token);
      if (rt) saveRefreshToken(rt);
      for (let i = 0; i < retries; i++) {
        try {
          const r = await a.me();
          setTokenAndUser(token, r.data.user);
          window.history.replaceState({}, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
          return;
        } catch {
          if (i === 1) setStatus('waking');
          if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
        }
      }
      window.location.replace('/');
    };

    tryLogin();
  }, [setTokenAndUser]);

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#fce4f3,#e8f4fd)' }}>
      <div className="flex flex-col items-center gap-4 ani-up">
        <div className="w-14 h-14 rounded-3xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#f9a8d4,#7ec8e3)', boxShadow: '0 8px 32px rgba(249,168,212,.5)' }}>
          <Heart className="w-7 h-7 text-white fill-white" strokeWidth={0} />
        </div>
        <div className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(232,140,196,.3)', borderTopColor: '#e88cc4' }} />
        <p className="text-[14px] font-semibold text-center px-6" style={{ color: '#b07aa0' }}>
          {status === 'waking'
            ? 'Сервер просыпается, подождите ~30 секунд...'
            : 'Входим...'}
        </p>
      </div>
    </div>
  );
}
