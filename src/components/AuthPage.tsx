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
    <div className="min-h-screen w-full flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#fce4f3 0%,#e8f4fd 100%)' }}>

      {/* Card */}
      <div className="w-full max-w-[860px] mx-4 rounded-[36px] overflow-hidden flex shadow-2xl ani-scale"
        style={{ boxShadow: '0 32px 80px rgba(180,80,140,.22), 0 8px 32px rgba(126,200,227,.15)', minHeight: 520 }}>

        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex flex-col items-center justify-between w-[340px] shrink-0 p-10 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#f9a8d4 0%,#e879b8 50%,#c084fc 100%)' }}>

          {/* Paw prints decoration */}
          {[
            { top: '6%',  left: '10%',  size: 38, rotate: -20, opacity: 0.25 },
            { top: '12%', right: '8%',  size: 28, rotate: 15,  opacity: 0.18 },
            { top: '38%', left: '5%',   size: 22, rotate: 5,   opacity: 0.20 },
            { bottom: '32%', right: '6%', size: 32, rotate: -10, opacity: 0.22 },
            { bottom: '10%', left: '12%', size: 42, rotate: 25,  opacity: 0.20 },
            { bottom: '18%', right: '15%',size: 24, rotate: -30, opacity: 0.16 },
          ].map((p, i) => (
            <div key={i} className="absolute pointer-events-none"
              style={{ top: p.top, bottom: p.bottom, left: p.left, right: p.right, opacity: p.opacity, transform: `rotate(${p.rotate}deg)` }}>
              <PawIcon size={p.size} color="#fff" />
            </div>
          ))}

          {/* Logo top */}
          <div className="flex items-center gap-3 self-start relative z-10">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,.25)', backdropFilter: 'blur(10px)' }}>
              <Heart className="w-5 h-5 text-white fill-white" strokeWidth={0} />
            </div>
            <span className="text-[16px] font-black text-white">GoalTracker</span>
          </div>

          {/* Cat illustration */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <CatIllustration />
            <p className="text-white/80 text-[14px] font-medium text-center leading-relaxed">
              твой путь к мечте
            </p>
          </div>

          {/* Stats bottom */}
          <div className="flex gap-6 relative z-10 self-stretch">
            {[{ num:'100%', label:'бесплатно' }, { num:'∞', label:'целей' }, { num:'24/7', label:'доступно' }].map(s => (
              <div key={s.label} className="flex-1 text-center">
                <div className="text-[20px] font-black text-white">{s.num}</div>
                <div className="text-[11px] text-white/70 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 md:px-10"
          style={{ background: '#fff' }}>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#f9a8d4,#7ec8e3)' }}>
              <Heart className="w-5 h-5 text-white fill-white" strokeWidth={0} />
            </div>
            <span className="text-[18px] font-black" style={{ color: '#4a1a3a' }}>GoalTracker</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-[28px] font-black mb-1" style={{ color: '#3d1a30' }}>
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
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-[14px] font-bold mb-5 transition-all duration-200"
            style={{
              background: '#fff',
              border: '1.5px solid #e8d0e4',
              boxShadow: '0 2px 8px rgba(240,168,208,.15)',
              color: '#3d1a30',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='#fdf0f8'; el.style.boxShadow='0 6px 20px rgba(240,168,208,.3)'; el.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='#fff'; el.style.boxShadow='0 2px 8px rgba(240,168,208,.15)'; el.style.transform=''; }}>
            <GoogleIcon />
            Войти через Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: '#f0dce8' }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#d4a0c0' }}>или</span>
            <div className="flex-1 h-px" style={{ background: '#f0dce8' }} />
          </div>

          {/* Mode tabs */}
          <div className="flex gap-2 mb-5">
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-xl text-[13px] font-bold transition-all duration-200"
                style={mode === m ? {
                  background: 'linear-gradient(135deg,#f9a8d4,#c084fc)',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(249,168,212,.4)',
                } : {
                  background: '#fdf0f8',
                  color: '#c4a0b8',
                  border: '1px solid #f0dce8',
                }}>
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && (
              <InputField icon={<User className="w-4 h-4" />} type="text"
                placeholder="Ваше имя (необязательно)" value={name} onChange={setName} />
            )}
            <InputField icon={<Mail className="w-4 h-4" />} type="email"
              placeholder="Email адрес" value={email} onChange={setEmail} required />
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
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-200 mt-1"
              style={{
                background: (!email || !password) ? '#f5e8f2' : 'linear-gradient(135deg,#f9a8d4,#c084fc)',
                color: (!email || !password) ? '#d4a0c0' : '#fff',
                boxShadow: (!email || !password) ? 'none' : '0 8px 24px rgba(249,168,212,.5)',
              }}
              onMouseEnter={e => { if (email && password) (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform=''; }}>
              {loading ? <LoadingSpinner /> : (
                <>{mode === 'login' ? 'Войти' : 'Создать аккаунт'}<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-[13px] mt-5" style={{ color: '#b07aa0' }}>
            {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="font-bold transition-colors"
              style={{ color: '#e879b8' }}
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

// ── Cat SVG illustration ──────────────────────────────────────────────────────
function CatIllustration() {
  return (
    <svg width="160" height="180" viewBox="0 0 160 180" fill="none">
      {/* Body */}
      <ellipse cx="80" cy="130" rx="52" ry="44" fill="rgba(255,255,255,0.25)" />
      {/* Head */}
      <ellipse cx="80" cy="78" rx="42" ry="40" fill="rgba(255,255,255,0.25)" />
      {/* Ears */}
      <polygon points="45,50 35,18 62,44" fill="rgba(255,255,255,0.3)" />
      <polygon points="115,50 125,18 98,44" fill="rgba(255,255,255,0.3)" />
      {/* Inner ears */}
      <polygon points="47,48 39,26 60,44" fill="rgba(249,168,212,0.5)" />
      <polygon points="113,48 121,26 100,44" fill="rgba(249,168,212,0.5)" />
      {/* Eyes */}
      <ellipse cx="65" cy="76" rx="9" ry="10" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="95" cy="76" rx="9" ry="10" fill="rgba(255,255,255,0.9)" />
      <circle cx="66" cy="77" r="5" fill="#3d1a30" />
      <circle cx="96" cy="77" r="5" fill="#3d1a30" />
      <circle cx="68" cy="74" r="2" fill="white" />
      <circle cx="98" cy="74" r="2" fill="white" />
      {/* Nose */}
      <ellipse cx="80" cy="90" rx="4" ry="3" fill="rgba(249,168,212,0.8)" />
      {/* Mouth */}
      <path d="M76 93 Q80 98 84 93" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="38" y1="88" x2="72" y2="91" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="38" y1="93" x2="72" y2="93" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="88" y1="91" x2="122" y2="88" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="88" y1="93" x2="122" y2="93" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      {/* Tail */}
      <path d="M128 148 Q155 130 148 108 Q144 96 136 102" stroke="rgba(255,255,255,0.3)" strokeWidth="12" fill="none" strokeLinecap="round" />
      {/* Paws */}
      <ellipse cx="60" cy="166" rx="16" ry="10" fill="rgba(255,255,255,0.2)" />
      <ellipse cx="100" cy="166" rx="16" ry="10" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

// ── Paw print SVG ─────────────────────────────────────────────────────────────
function PawIcon({ size = 32, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill={color}>
      <ellipse cx="20" cy="14" rx="7" ry="9" />
      <ellipse cx="44" cy="14" rx="7" ry="9" />
      <ellipse cx="10" cy="30" rx="6" ry="8" />
      <ellipse cx="54" cy="30" rx="6" ry="8" />
      <path d="M32 22 C16 22 10 34 12 46 C14 54 22 58 32 58 C42 58 50 54 52 46 C54 34 48 22 32 22Z" />
    </svg>
  );
}

// ── Input field ───────────────────────────────────────────────────────────────
function InputField({ icon, type, placeholder, value, onChange, required, suffix }: {
  icon: React.ReactNode; type: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  required?: boolean; suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200"
      style={{
        background: focused ? '#fdf5fa' : '#faf5f8',
        border: focused ? '1.5px solid #f0a8d0' : '1.5px solid #f0dce8',
        boxShadow: focused ? '0 0 0 4px rgba(249,168,212,.12)' : 'none',
      }}>
      <span className="shrink-0 transition-colors" style={{ color: focused ? '#e879b8' : '#d4a0c0' }}>
        {icon}
      </span>
      <input type={type} placeholder={placeholder} value={value} required={required}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent text-[14px] font-medium outline-none"
        style={{ color: '#3d1a30' }} />
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
      style={{ background: 'linear-gradient(135deg,#fce4f3,#e8f4fd)' }}>
      <div className="flex flex-col items-center gap-4 ani-up">
        <div className="w-14 h-14 rounded-3xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#f9a8d4,#c084fc)', boxShadow: '0 8px 32px rgba(249,168,212,.5)' }}>
          <Heart className="w-7 h-7 text-white fill-white" strokeWidth={0} />
        </div>
        <div className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(232,140,196,.3)', borderTopColor: '#e879b8' }} />
        <p className="text-[14px] font-semibold text-center px-6" style={{ color: '#b07aa0' }}>
          {status === 'waking'
            ? 'Сервер просыпается, подождите ~30 секунд...'
            : 'Входим...'}
        </p>
      </div>
    </div>
  );
}
