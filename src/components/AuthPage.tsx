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
    <div className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg,#fce8f3 0%,#e8f5fd 50%,#f0f8ff 100%)' }}>

      {/* Animated blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div style={{ position:'absolute', top:'-8%', left:'-8%', width:550, height:550, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,182,215,.5) 0%,transparent 65%)', filter:'blur(55px)', animation:'auth-blob1 10s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:'-8%', right:'-8%', width:480, height:480, borderRadius:'50%', background:'radial-gradient(circle,rgba(147,213,240,.45) 0%,transparent 65%)', filter:'blur(50px)', animation:'auth-blob2 13s ease-in-out infinite' }} />
        <div style={{ position:'absolute', top:'35%', right:'15%', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,200,230,.4) 0%,transparent 65%)', filter:'blur(55px)', animation:'auth-blob3 16s ease-in-out infinite' }} />
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full flex rounded-[36px] overflow-hidden ani-scale"
        style={{
          maxWidth: 980,
          minHeight: 600,
          boxShadow: '0 32px 80px rgba(200,150,180,.18), 0 8px 32px rgba(147,213,240,.18)',
          border: '1.5px solid rgba(255,255,255,.9)',
        }}>

        {/* ── LEFT: soft pastel panel ── */}
        <div className="hidden md:flex flex-col w-[420px] shrink-0 relative overflow-hidden p-10"
          style={{ background: 'linear-gradient(160deg,#fde8f4 0%,#fce0ee 40%,#e8f5fd 100%)' }}>

          {/* Soft decorative circles */}
          <div className="absolute pointer-events-none" style={{ top:'-60px', right:'-60px', width:220, height:220, borderRadius:'50%', background:'rgba(147,213,240,.25)', filter:'blur(30px)' }} />
          <div className="absolute pointer-events-none" style={{ bottom:'-40px', left:'-40px', width:200, height:200, borderRadius:'50%', background:'rgba(255,182,215,.3)', filter:'blur(25px)' }} />

          {/* Paw prints — soft pink/blue */}
          {[
            { top:'4%',    left:'6%',   s:38, r:-15, o:.18, c:'#f9a8d4' },
            { top:'7%',    right:'8%',  s:26, r:20,  o:.14, c:'#93d5f0' },
            { top:'38%',   left:'2%',   s:22, r:8,   o:.14, c:'#f9a8d4' },
            { top:'58%',   right:'4%',  s:30, r:-25, o:.16, c:'#93d5f0' },
            { bottom:'22%',left:'8%',   s:20, r:12,  o:.13, c:'#f9a8d4' },
            { bottom:'6%', left:'32%',  s:42, r:-10, o:.15, c:'#93d5f0' },
            { bottom:'10%',right:'6%',  s:24, r:30,  o:.12, c:'#f9a8d4' },
          ].map((p,i) => (
            <div key={i} className="absolute pointer-events-none select-none"
              style={{ top:p.top, bottom:p.bottom, left:p.left, right:p.right, opacity:p.o, transform:`rotate(${p.r}deg)` }}>
              <PawIcon size={p.s} color={p.c} />
            </div>
          ))}

          {/* Logo + name — top center */}
          <div className="flex flex-col items-center gap-3 relative z-10 mb-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background:'linear-gradient(135deg,#ffb6d9,#93d5f0)', boxShadow:'0 6px 20px rgba(255,182,215,.45)' }}>
                <Heart className="w-6 h-6 fill-white text-white" strokeWidth={0} />
              </div>
              <div>
                <div className="text-[20px] font-black leading-none" style={{ color:'#5a3a5a' }}>GoalTracker</div>
                <div className="text-[12px] font-medium mt-0.5" style={{ color:'#b090b0' }}>твой путь к мечте</div>
              </div>
            </div>
          </div>

          {/* Cat — centered, takes remaining space */}
          <div className="flex-1 flex items-center justify-center relative z-10 py-4">
            <CatIllustration />
          </div>
        </div>

        {/* ── RIGHT: form panel ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 md:px-12"
          style={{ background:'rgba(255,255,255,.97)' }}>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,#ffb6d9,#93d5f0)', boxShadow:'0 4px 16px rgba(255,182,215,.4)' }}>
              <Heart className="w-5 h-5 fill-white text-white" strokeWidth={0} />
            </div>
            <div>
              <div className="text-[18px] font-black" style={{ color:'#5a3a5a' }}>GoalTracker</div>
              <div className="text-[12px]" style={{ color:'#b090b0' }}>твой путь к мечте</div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-[28px] font-black mb-1.5" style={{ color:'#5a3a5a' }}>
              {mode === 'login' ? 'С возвращением' : 'Создать аккаунт'}
            </h2>
            <p className="text-[14px]" style={{ color:'#a080a0' }}>
              {mode === 'login'
                ? 'Войдите, чтобы продолжить работу над целями'
                : 'Зарегистрируйтесь — это займёт секунду'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-2xl overflow-hidden mb-5 p-1"
            style={{ background:'#f8eef6', border:'1.5px solid #f5d8ee' }}>
            {(['login','register'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-3.5 text-[15px] font-bold rounded-xl transition-all duration-200"
                style={mode === m
                  ? { background:'linear-gradient(135deg,#ffb6d9,#93d5f0)', color:'#fff', boxShadow:'0 4px 12px rgba(255,182,215,.4)' }
                  : { background:'transparent', color:'#b090b0' }}>
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          {/* Google */}
          <button onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[15px] font-semibold mb-4 transition-all duration-200"
            style={{ background:'#fff', border:'1.5px solid #e8d8f0', color:'#5a3a5a', boxShadow:'0 2px 8px rgba(200,150,200,.1)' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='#ffb6d9'; el.style.background='#fff8fc'; el.style.transform='translateY(-1px)'; el.style.boxShadow='0 6px 20px rgba(255,182,215,.2)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='#e8d8f0'; el.style.background='#fff'; el.style.transform=''; el.style.boxShadow='0 2px 8px rgba(200,150,200,.1)'; }}>
            <GoogleIcon />
            Войти через Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background:'linear-gradient(90deg,transparent,#f0d8e8)' }} />
            <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color:'#c8a0c0' }}>или</span>
            <div className="flex-1 h-px" style={{ background:'linear-gradient(90deg,#f0d8e8,transparent)' }} />
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-3.5">
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
                  style={{ color:'#c8a0c0' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#a06090'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#c8a0c0'; }}>
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              } />

            {error && (
              <div className="px-4 py-3.5 rounded-2xl text-[13px] font-medium"
                style={{ background:'rgba(251,113,133,.06)', border:'1px solid rgba(251,113,133,.25)', color:'#e11d48' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="px-4 py-3.5 rounded-2xl text-[13px] font-medium"
                style={{ background:'rgba(147,213,240,.12)', border:'1px solid rgba(147,213,240,.4)', color:'#0e7490' }}>
                {success}
              </div>
            )}

            <button type="submit" disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-4.5 rounded-2xl text-[16px] font-bold transition-all duration-200 mt-1"
              style={{
                background: 'linear-gradient(135deg,#ffb6d9 0%,#d4a0f0 50%,#93d5f0 100%)',
                color: '#fff',
                opacity: (!email || !password) ? 0.55 : 1,
                boxShadow: (!email || !password) ? 'none' : '0 8px 24px rgba(255,182,215,.45)',
                cursor: (!email || !password) ? 'not-allowed' : 'pointer',
                paddingTop: '14px',
                paddingBottom: '14px',
              }}
              onMouseEnter={e => { if (email && password) { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 12px 32px rgba(255,182,215,.55)'; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform=''; (e.currentTarget as HTMLElement).style.boxShadow=(!email||!password)?'none':'0 8px 24px rgba(255,182,215,.45)'; }}>
              {loading ? <LoadingSpinner /> : (
                <>{mode === 'login' ? 'Войти' : 'Создать аккаунт'} <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-[13px] mt-5" style={{ color:'#a080a0' }}>
            {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-bold transition-colors"
              style={{ color:'#d080b0' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#a06090'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#d080b0'; }}>
              {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Cat illustration (soft pastel pink+blue style) ────────────────────────────
function CatIllustration() {
  return (
    <svg
      className="w-[240px] h-[240px] select-none"
      viewBox="0 0 200 200"
      fill="none"
      style={{ filter: 'drop-shadow(0 16px 32px rgba(200,150,180,.2))' }}
    >
      {/* Shadow */}
      <ellipse cx="100" cy="182" rx="52" ry="7" fill="rgba(180,130,160,.1)" />
      {/* Body */}
      <ellipse cx="100" cy="130" rx="50" ry="46" fill="rgba(255,255,255,.95)" />
      {/* Belly — soft blue tint */}
      <ellipse cx="100" cy="140" rx="27" ry="21" fill="rgba(220,242,252,.8)" />
      {/* Head */}
      <circle cx="100" cy="74" r="41" fill="rgba(255,255,255,.95)" />
      {/* Ears outer */}
      <path d="M63 44 L79 10 L95 44 Z" fill="rgba(255,255,255,.95)" strokeLinejoin="round" />
      <path d="M105 44 L121 10 L137 44 Z" fill="rgba(255,255,255,.95)" strokeLinejoin="round" />
      {/* Ears inner — pink */}
      <path d="M66 42 L79 14 L92 42 Z" fill="rgba(255,182,215,.4)" />
      <path d="M108 42 L121 14 L134 42 Z" fill="rgba(255,182,215,.4)" />
      {/* Eyes — happy closed arcs */}
      <path d="M78 70 Q88 79 98 70" stroke="#8a6a8a" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      <path d="M102 70 Q112 79 122 70" stroke="#8a6a8a" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      {/* Blush — pink */}
      <ellipse cx="72" cy="84" rx="11" ry="5.5" fill="rgba(255,182,215,.5)" />
      <ellipse cx="128" cy="84" rx="11" ry="5.5" fill="rgba(255,182,215,.5)" />
      {/* Nose — soft pink */}
      <path d="M100 80 L97 86 L103 86 Z" fill="#ffb6d9" />
      {/* Smile — blue tint */}
      <path d="M93 90 Q100 97 107 90" stroke="#93d5f0" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Whiskers — very soft */}
      <line x1="54" y1="76" x2="30" y2="74" stroke="rgba(140,100,130,.22)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="54" y1="80" x2="28" y2="80" stroke="rgba(140,100,130,.22)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="54" y1="84" x2="30" y2="86" stroke="rgba(140,100,130,.22)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="146" y1="76" x2="170" y2="74" stroke="rgba(140,100,130,.22)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="146" y1="80" x2="172" y2="80" stroke="rgba(140,100,130,.22)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="146" y1="84" x2="170" y2="86" stroke="rgba(140,100,130,.22)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Heart above — pink+blue gradient effect via two overlapping */}
      <path d="M100 30 C96 23 87 23 87 30 C87 37 100 44 100 44 C100 44 113 37 113 30 C113 23 104 23 100 30Z" fill="#ffb6d9" opacity="0.9" />
      <path d="M100 30 C100 30 104 35 100 44 C100 44 113 37 113 30 C113 23 104 23 100 30Z" fill="#93d5f0" opacity="0.45" />
      {/* Small stars / sparkles */}
      <circle cx="58" cy="50" r="2" fill="#ffb6d9" opacity="0.6" />
      <circle cx="142" cy="48" r="2" fill="#93d5f0" opacity="0.6" />
      <circle cx="50" cy="100" r="1.5" fill="#ffb6d9" opacity="0.5" />
      <circle cx="150" cy="105" r="1.5" fill="#93d5f0" opacity="0.5" />
    </svg>
  );
}

// ── Paw SVG ───────────────────────────────────────────────────────────────────
function PawIcon({ size = 32, color = '#ffb6d9' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill={color}>
      <ellipse cx="20" cy="13" rx="7" ry="9" />
      <ellipse cx="44" cy="13" rx="7" ry="9" />
      <ellipse cx="9"  cy="29" rx="6" ry="8" />
      <ellipse cx="55" cy="29" rx="6" ry="8" />
      <path d="M32 21 C15 21 9 34 11 47 C13 55 22 59 32 59 C42 59 51 55 53 47 C55 34 49 21 32 21Z" />
    </svg>
  );
}

// ── Flat input field with colored left bar ────────────────────────────────────
function FlatInputField({ icon, type, placeholder, value, onChange, required, suffix }: {
  icon: React.ReactNode; type: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  required?: boolean; suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex items-center rounded-2xl overflow-hidden transition-all duration-200 min-h-[56px]"
      style={{
        border: focused ? '1.5px solid #ffb6d9' : '1.5px solid #f0e0ee',
        boxShadow: focused ? '0 0 0 4px rgba(255,182,215,.14)' : 'none',
        background: '#fdf6fb',
      }}>
      {/* Colored left bar + icon */}
      <div className="flex items-center justify-center w-14 min-h-[56px] shrink-0 self-stretch"
        style={{ background: focused ? 'linear-gradient(160deg,#ffb6d9,#93d5f0)' : '#f5e0f0', transition:'background .25s' }}>
        <span style={{ color: focused ? '#fff' : '#c8a0c0', transition:'color .25s' }}>{icon}</span>
      </div>
      <input type={type} placeholder={placeholder} value={value} required={required}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent text-[15px] font-medium outline-none px-4 py-4 min-h-[56px]"
        style={{ color:'#5a3a5a' }} />
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
