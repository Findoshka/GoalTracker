import { useState, useEffect } from 'react';
import { Heart, Mail, Lock, User, Eye, EyeOff, ArrowRight, Target, TrendingUp, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg,#fce4f3 0%,#e8f4fd 100%)' }}>

      {/* Blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div style={{ position:'absolute', top:'-10%', left:'-10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(249,168,212,.4) 0%,transparent 65%)', filter:'blur(60px)', animation:'auth-blob1 10s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(126,200,227,.35) 0%,transparent 65%)', filter:'blur(55px)', animation:'auth-blob2 13s ease-in-out infinite' }} />
        <div style={{ position:'absolute', top:'40%', left:'40%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(192,132,252,.25) 0%,transparent 65%)', filter:'blur(60px)', animation:'auth-blob3 16s ease-in-out infinite' }} />
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full flex rounded-[40px] overflow-hidden ani-scale"
        style={{
          maxWidth: 1000,
          minHeight: 580,
          boxShadow: '0 40px 100px rgba(180,80,140,.2), 0 8px 40px rgba(126,200,227,.15)',
        }}>

        {/* ── LEFT: pink panel ── */}
        <div className="hidden md:flex flex-col w-[420px] shrink-0 relative overflow-hidden p-12"
          style={{ background: 'linear-gradient(160deg,#f9a8d4 0%,#e879b8 45%,#c084fc 100%)' }}>

          {/* Cat illustration */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <CatIllustration />
          </div>

          {/* Paw prints */}
          {[
            { top:'5%',   left:'8%',   s:44, r:-15, o:.22 },
            { top:'8%',   right:'10%', s:30, r:20,  o:.16 },
            { top:'35%',  left:'3%',   s:26, r:8,   o:.18 },
            { top:'55%',  right:'5%',  s:36, r:-25, o:.20 },
            { bottom:'25%',left:'10%', s:22, r:12,  o:.15 },
            { bottom:'8%', left:'35%', s:48, r:-10, o:.18 },
            { bottom:'12%',right:'8%', s:28, r:30,  o:.14 },
          ].map((p,i) => (
            <div key={i} className="absolute pointer-events-none select-none"
              style={{ top:p.top, bottom:p.bottom, left:p.left, right:p.right, opacity:p.o, transform:`rotate(${p.r}deg)` }}>
              <PawIcon size={p.s} />
            </div>
          ))}

          {/* Logo */}
          <div className="flex items-center gap-3 mb-auto relative z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background:'rgba(255,255,255,.25)', backdropFilter:'blur(10px)', border:'1.5px solid rgba(255,255,255,.4)' }}>
              <Heart className="w-6 h-6 text-white fill-white" strokeWidth={0} />
            </div>
            <div>
              <div className="text-[18px] font-black text-white leading-none">GoalTracker</div>
              <div className="text-[12px] text-white/70 font-medium mt-0.5">твой путь к мечте</div>
            </div>
          </div>

          {/* Big headline */}
          <div className="my-8 relative z-10">
            <div className="text-white font-black leading-[1.08] mb-5" style={{ fontSize: 52, letterSpacing: '-1.5px' }}>
              Мечтай.<br/>
              Планируй.<br/>
              Достигай.
            </div>
            <p className="text-white/75 text-[15px] leading-relaxed">
              Разбивай большие мечты на шаги и двигайся к ним каждый день.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3 mb-8 relative z-10">
            {[
              { icon: <Target className="w-4 h-4" />,      text: 'Ставь большие цели' },
              { icon: <TrendingUp className="w-4 h-4" />,  text: 'Следи за прогрессом' },
              { icon: <CheckCircle className="w-4 h-4" />, text: 'Выполняй задачи' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white"
                  style={{ background:'rgba(255,255,255,.2)', border:'1px solid rgba(255,255,255,.3)' }}>
                  {f.icon}
                </div>
                <span className="text-white/85 text-[14px] font-medium">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-0 rounded-2xl overflow-hidden relative z-10"
            style={{ border:'1px solid rgba(255,255,255,.25)' }}>
            {[{ num:'100%', label:'бесплатно' }, { num:'∞', label:'целей' }, { num:'24/7', label:'доступно' }].map((s, i) => (
              <div key={s.label} className="flex-1 text-center py-3"
                style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,.2)' : 'none', background:'rgba(255,255,255,.1)' }}>
                <div className="text-[20px] font-black text-white leading-none">{s.num}</div>
                <div className="text-[11px] text-white/65 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: form panel ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 md:px-12"
          style={{ background:'#fff' }}>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,#f9a8d4,#c084fc)', boxShadow:'0 6px 20px rgba(249,168,212,.4)' }}>
              <Heart className="w-5 h-5 text-white fill-white" strokeWidth={0} />
            </div>
            <div>
              <div className="text-[18px] font-black" style={{ color:'#3d1a30' }}>GoalTracker</div>
              <div className="text-[12px]" style={{ color:'#c4a0b8' }}>твой путь к мечте</div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[30px] font-black mb-1.5" style={{ color:'#3d1a30' }}>
              {mode === 'login' ? 'С возвращением' : 'Создать аккаунт'}
            </h2>
            <p className="text-[14px]" style={{ color:'#b07aa0' }}>
              {mode === 'login'
                ? 'Войдите, чтобы продолжить работу над целями'
                : 'Зарегистрируйтесь — это займёт секунду'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-2xl overflow-hidden mb-6"
            style={{ border:'2px solid #f9a8d4' }}>
            {(['login','register'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-4 text-[16px] font-bold transition-all duration-200"
                style={mode === m
                  ? { background:'linear-gradient(135deg,#f9a8d4,#c084fc)', color:'#fff' }
                  : { background:'#fff', color:'#c4a0b8' }}>
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-[16px] font-semibold mb-5 transition-all duration-200"
            style={{ background:'#fff', border:'2px solid #f0dce8', color:'#5a2a4a' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='#f9a8d4'; el.style.background='#fdf5fb'; el.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='#f0dce8'; el.style.background='#fff'; el.style.transform=''; }}>
            <GoogleIcon />
            Войти через Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background:'#f0dce8' }} />
            <span className="text-[13px] font-bold uppercase tracking-widest" style={{ color:'#d4a0c0' }}>или</span>
            <div className="flex-1 h-px" style={{ background:'#f0dce8' }} />
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <FlatInputField icon={<User className="w-5 h-5" />} type="text"
                placeholder="Ваше имя (необязательно)" value={name} onChange={setName} />
            )}
            <FlatInputField icon={<Mail className="w-5 h-5" />} type="email"
              placeholder="Email адрес" value={email} onChange={setEmail} required />
            <FlatInputField icon={<Lock className="w-5 h-5" />}
              type={showPwd ? 'text' : 'password'} placeholder="Пароль (минимум 6 символов)"
              value={password} onChange={setPassword} required
              suffix={
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="shrink-0 px-1.5 transition-colors"
                  style={{ color:'#d4a0c0' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#c0628f'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#d4a0c0'; }}>
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              } />

            {error && (
              <div className="px-5 py-4 rounded-2xl text-[14px] font-medium"
                style={{ background:'rgba(251,113,133,.07)', border:'1px solid rgba(251,113,133,.3)', color:'#e11d48' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="px-5 py-4 rounded-2xl text-[14px] font-medium"
                style={{ background:'rgba(126,200,227,.1)', border:'1px solid rgba(126,200,227,.4)', color:'#0e7490' }}>
                {success}
              </div>
            )}

            <button type="submit" disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-5 rounded-2xl text-[17px] font-bold transition-all duration-200 mt-2"
              style={{
                background: 'linear-gradient(135deg,#f9a8d4,#c084fc)',
                color: '#fff',
                opacity: (!email || !password) ? 0.5 : 1,
                boxShadow: (!email || !password) ? 'none' : '0 8px 24px rgba(249,168,212,.5)',
                cursor: (!email || !password) ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (email && password) { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 12px 32px rgba(249,168,212,.6)'; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform=''; (e.currentTarget as HTMLElement).style.boxShadow=(!email||!password)?'none':'0 8px 24px rgba(249,168,212,.5)'; }}>
              {loading ? <LoadingSpinner /> : (
                <>{mode === 'login' ? 'Войти' : 'Создать аккаунт'} <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-[14px] mt-6" style={{ color:'#b07aa0' }}>
            {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-bold transition-colors"
              style={{ color:'#e879b8' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#c0628f'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#e879b8'; }}>
              {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Cat illustration (cute, pastel style) ──────────────────────────────────────
function CatIllustration() {
  return (
    <svg
      className="w-[220px] h-[220px] opacity-90 select-none"
      viewBox="0 0 200 200"
      fill="none"
      style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,.08))' }}
    >
      {/* Shadow under cat */}
      <ellipse cx="100" cy="178" rx="55" ry="8" fill="rgba(0,0,0,.06)" />
      {/* Body - soft rounded */}
      <ellipse cx="100" cy="128" rx="52" ry="48" fill="#fff" stroke="rgba(255,255,255,.6)" strokeWidth="2" />
      {/* Belly patch */}
      <ellipse cx="100" cy="138" rx="28" ry="22" fill="rgba(255,240,250,.9)" />
      {/* Head */}
      <circle cx="100" cy="72" r="42" fill="#fff" stroke="rgba(255,255,255,.6)" strokeWidth="2" />
      {/* Ears */}
      <path d="M62 42 L78 8 L94 42 Z" fill="#fff" stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M106 42 L122 8 L138 42 Z" fill="#fff" stroke="rgba(255,255,255,.6)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M64 40 L77 12 L92 40 Z" fill="rgba(249,168,212,.25)" />
      <path d="M108 40 L123 12 L136 40 Z" fill="rgba(249,168,212,.25)" />
      {/* Eyes - closed happy */}
      <path d="M78 68 Q88 76 98 68" stroke="#5a3a4a" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M102 68 Q112 76 122 68" stroke="#5a3a4a" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Blush */}
      <ellipse cx="72" cy="82" rx="10" ry="5" fill="rgba(249,168,212,.45)" />
      <ellipse cx="128" cy="82" rx="10" ry="5" fill="rgba(249,168,212,.45)" />
      {/* Nose */}
      <path d="M100 78 L97 84 L103 84 Z" fill="#e879b8" />
      {/* Smile */}
      <path d="M92 88 Q100 96 108 88" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
      {/* Whiskers */}
      <line x1="52" y1="74" x2="28" y2="72" stroke="rgba(90,58,74,.35)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="52" y1="78" x2="26" y2="78" stroke="rgba(90,58,74,.35)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="52" y1="82" x2="28" y2="84" stroke="rgba(90,58,74,.35)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="148" y1="74" x2="172" y2="72" stroke="rgba(90,58,74,.35)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="148" y1="78" x2="174" y2="78" stroke="rgba(90,58,74,.35)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="148" y1="82" x2="172" y2="84" stroke="rgba(90,58,74,.35)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Little heart above head */}
      <path d="M100 28 C96 22 88 22 88 28 C88 34 100 42 100 42 C100 42 112 34 112 28 C112 22 104 22 100 28Z" fill="#f9a8d4" opacity="0.95" />
    </svg>
  );
}

// ── Paw SVG ───────────────────────────────────────────────────────────────────
function PawIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="white">
      <ellipse cx="20" cy="13" rx="7" ry="9" />
      <ellipse cx="44" cy="13" rx="7" ry="9" />
      <ellipse cx="9"  cy="29" rx="6" ry="8" />
      <ellipse cx="55" cy="29" rx="6" ry="8" />
      <path d="M32 21 C15 21 9 34 11 47 C13 55 22 59 32 59 C42 59 51 55 53 47 C55 34 49 21 32 21Z" />
    </svg>
  );
}

// ── Flat input field with colored left bar (like reference) ──────────────────
function FlatInputField({ icon, type, placeholder, value, onChange, required, suffix }: {
  icon: React.ReactNode; type: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  required?: boolean; suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex items-center rounded-2xl overflow-hidden transition-all duration-200 min-h-[56px]"
      style={{
        border: focused ? '1.5px solid #f9a8d4' : '1.5px solid #f0dce8',
        boxShadow: focused ? '0 0 0 4px rgba(249,168,212,.12)' : 'none',
        background: '#faf5f9',
      }}>
      {/* Colored left bar + icon */}
      <div className="flex items-center justify-center w-14 min-h-[56px] shrink-0 self-stretch"
        style={{ background: focused ? 'linear-gradient(160deg,#f9a8d4,#c084fc)' : '#f0dce8', transition:'background .2s' }}>
        <span style={{ color: focused ? '#fff' : '#d4a0c0', transition:'color .2s' }}>{icon}</span>
      </div>
      <input type={type} placeholder={placeholder} value={value} required={required}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent text-[16px] font-medium outline-none px-4 py-4 min-h-[56px]"
        style={{ color:'#3d1a30' }} />
      {suffix && <div className="pr-4">{suffix}</div>}
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
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
      style={{ background:'linear-gradient(135deg,#fce4f3,#e8f4fd)' }}>
      <div className="flex flex-col items-center gap-4 ani-up">
        <div className="w-14 h-14 rounded-3xl flex items-center justify-center"
          style={{ background:'linear-gradient(135deg,#f9a8d4,#c084fc)', boxShadow:'0 8px 32px rgba(249,168,212,.5)' }}>
          <Heart className="w-7 h-7 text-white fill-white" strokeWidth={0} />
        </div>
        <div className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor:'rgba(232,140,196,.3)', borderTopColor:'#e879b8' }} />
        <p className="text-[14px] font-semibold text-center px-6" style={{ color:'#b07aa0' }}>
          {status === 'waking' ? 'Сервер просыпается, подождите ~30 секунд...' : 'Входим...'}
        </p>
      </div>
    </div>
  );
}
