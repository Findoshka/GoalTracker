import { Inbox, Star, List, CalendarDays, BarChart2, Plus, ChevronDown, X, CornerDownRight, Archive, Trash2, Settings, Heart, LogOut } from 'lucide-react';
import { useStore } from '../store';
import { GOAL_COLORS, type ViewMode } from '../types';
import { useAuth } from '../AuthContext';

interface Props { onNewGoal: () => void; onNavigate?: () => void }

export function Sidebar({ onNewGoal, onNavigate }: Props) {
  const { goals, inbox, view, activeGoalId, setView } = useStore();
  const { user, logout } = useAuth();
  const inboxCount = inbox.filter(t => !t.completed).length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCount = inbox.filter(t => !t.completed && t.dueDate === todayStr).length;

  const navItem = (v: ViewMode, icon: React.ReactNode, label: string, badge?: number) => {
    const active = view === v && v !== 'goal-detail';
    return (
      <button onClick={() => { setView(v); onNavigate?.(); }}
        className={`w-full flex items-center gap-[10px] h-[36px] px-3 rounded-2xl text-[13px] font-semibold transition-all duration-200 group/nav relative overflow-hidden
          ${active ? 'text-white' : 'text-[#b07aa0] hover:text-[#9d3d7a] hover:bg-pink-50'}`}
        style={active ? {
          background: 'linear-gradient(135deg,#f0a8d0,#a8d8ea)',
          boxShadow: '0 4px 16px rgba(240,168,208,.4)',
        } : {}}>
        {active && <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.2),transparent)' }} />}
        <span className={`relative z-10 transition-all ${active ? 'text-white' : 'text-[#d4a0c0] group-hover/nav:text-[#c0628f]'}`}>{icon}</span>
        <span className="relative z-10 flex-1 text-left truncate">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="relative z-10 text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full text-white"
            style={{ background: 'linear-gradient(135deg,#f0a8d0,#a8d8ea)', boxShadow: '0 2px 8px rgba(240,168,208,.5)' }}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-[210px] h-full flex flex-col select-none shrink-0 relative z-20"
      style={{ background: 'rgba(255,248,253,.92)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(240,168,208,.2)' }}>

      {/* Logo */}
      <div className="flex items-center gap-[10px] h-[56px] px-4 shrink-0">
        <div className="w-[32px] h-[32px] rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#f9a8d4,#7ec8e3)', boxShadow: '0 4px 16px rgba(249,168,212,.5)' }}>
          <Heart className="w-4 h-4 text-white fill-white" strokeWidth={0} />
        </div>
        <div>
          <span className="text-[14px] font-black shimmer-text tracking-tight">GoalTracker</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-2 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(240,168,208,.3),transparent)' }} />

      {/* Main nav */}
      <nav className="px-2 space-y-[2px]">
        {navItem('inbox',    <Inbox        className="w-[15px] h-[15px] shrink-0" />, 'Входящие', inboxCount)}
        {navItem('today',    <Star         className="w-[15px] h-[15px] shrink-0" />, 'Сегодня',  todayCount)}
        {navItem('plans',    <List         className="w-[15px] h-[15px] shrink-0" />, 'Планы')}
        {navItem('calendar', <CalendarDays className="w-[15px] h-[15px] shrink-0" />, 'Календарь')}
        {navItem('stats',    <BarChart2    className="w-[15px] h-[15px] shrink-0" />, 'Статистика')}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(240,168,208,.25),transparent)' }} />

      {/* Goals */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[.12em]" style={{ color: '#d4a0c0' }}>Мои цели</span>
          <div className="flex items-center gap-1">
            <button onClick={onNewGoal}
              className="w-5 h-5 flex items-center justify-center rounded-lg transition-all hover:bg-pink-100"
              style={{ color: '#d4a0c0' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#c0628f'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#d4a0c0'}>
              <Plus className="w-3 h-3" />
            </button>
            <button className="w-5 h-5 flex items-center justify-center rounded-lg transition-all hover:bg-pink-50"
              style={{ color: '#d4a0c0' }}>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="space-y-[2px]">
          {goals.map((goal, idx) => {
            const active = activeGoalId === goal.id && view === 'goal-detail';
            const hex = GOAL_COLORS[goal.color];
            return (
              <button key={goal.id} onClick={() => { setView('goal-detail', goal.id); onNavigate?.(); }}
                className={`ani-left stagger-${Math.min(idx + 1, 5)} w-full flex items-center gap-[10px] h-[32px] px-3 rounded-xl text-[12px] font-semibold transition-all duration-200 group/g`}
                style={active
                  ? { background: `${hex}18`, border: `1px solid ${hex}35`, color: hex }
                  : { color: '#b07aa0' }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(249,168,212,.1)'; (e.currentTarget as HTMLElement).style.color = '#9d3d7a'; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#b07aa0'; } }}>
                <div className="w-[8px] h-[8px] rounded-full shrink-0 transition-all group-hover/g:scale-125"
                  style={{ backgroundColor: hex, boxShadow: active ? `0 0 6px ${hex}` : 'none' }} />
                <span className="truncate text-left">{goal.title}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 px-1">
          <button onClick={onNewGoal} className="btn btn-primary btn-sm w-full">
            <Plus className="w-3.5 h-3.5" /> Новая цель
          </button>
        </div>
      </div>

      {/* Bottom */}
      <div className="shrink-0 px-2 pb-3 pt-2" style={{ borderTop: '1px solid rgba(240,168,208,.15)' }}>
        {[
          { icon: <X className="w-3.5 h-3.5" />, label: 'Без проекта' },
          { icon: <CornerDownRight className="w-3.5 h-3.5" />, label: 'Когда-нибудь' },
          { icon: <Archive className="w-3.5 h-3.5" />, label: 'Архив' },
          { icon: <Trash2 className="w-3.5 h-3.5" />, label: 'Корзина' },
          { icon: <Settings className="w-3.5 h-3.5" />, label: 'Настройки' },
        ].map(item => (
          <button key={item.label} className="w-full flex items-center gap-[10px] h-[28px] px-3 rounded-xl text-[11px] transition-all"
            style={{ color: '#d4b8cc' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#b07aa0'; (e.currentTarget as HTMLElement).style.background = 'rgba(249,168,212,.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#d4b8cc'; (e.currentTarget as HTMLElement).style.background = ''; }}>
            {item.icon}<span>{item.label}</span>
          </button>
        ))}

        {/* User bar */}
        {user && (
          <div className="mt-2 mx-1 flex items-center gap-2 px-2 py-2 rounded-2xl"
            style={{ background: 'rgba(249,168,212,.1)', border: '1px solid rgba(240,168,208,.2)' }}>
            {user.avatar
              ? <img src={user.avatar} alt="" className="w-6 h-6 rounded-full shrink-0 object-cover" />
              : (
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#f9a8d4,#7ec8e3)' }}>
                  {(user.name ?? user.email)[0].toUpperCase()}
                </div>
              )
            }
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate" style={{ color: '#b07aa0' }}>{user.name ?? user.email.split('@')[0]}</p>
            </div>
            <button onClick={logout} title="Выйти"
              className="w-5 h-5 flex items-center justify-center rounded-lg transition-all"
              style={{ color: '#d4b8cc' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#d4b8cc'; (e.currentTarget as HTMLElement).style.background = ''; }}>
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
