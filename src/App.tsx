import { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import { useAuth } from './AuthContext';
import { Sidebar } from './components/Sidebar';
import { InboxView } from './components/InboxView';
import { TodayView } from './components/TodayView';
import { PlansView } from './components/PlansView';
import { CalendarView } from './components/CalendarView';
import { GoalDetail } from './components/GoalDetail';
import { GoalForm } from './components/GoalForm';
import { AuthPage, OAuthCallback } from './components/AuthPage';
import { Heart, Menu } from 'lucide-react';

function AppShell() {
  const view = useStore((s) => s.view);
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on view change (mobile)
  const handleNavigation = () => setSidebarOpen(false);

  return (
    <div className="flex h-full relative overflow-hidden" style={{ background: '#fdf6fa' }}>
      {/* Animated background blobs */}
      <div className="pointer-events-none fixed z-0 overflow-hidden inset-0">
        <div style={{
          position:'absolute', top:'-8%', left:'-5%', width:500, height:500, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(249,168,212,.35) 0%,transparent 65%)',
          filter:'blur(55px)', animation:'auth-blob1 9s ease-in-out infinite',
        }} />
        <div style={{
          position:'absolute', bottom:'-8%', right:'-5%', width:420, height:420, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(126,200,227,.3) 0%,transparent 65%)',
          filter:'blur(50px)', animation:'auth-blob2 11s ease-in-out infinite',
        }} />
        <div style={{
          position:'absolute', top:'40%', left:'35%', width:380, height:380, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(255,220,240,.4) 0%,transparent 70%)',
          filter:'blur(60px)', animation:'auth-blob3 14s ease-in-out infinite',
        }} />
      </div>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(100,50,80,.35)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div className={`
        fixed md:relative z-40 h-full transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar
          onNewGoal={() => { setGoalFormOpen(true); setSidebarOpen(false); }}
          onNavigate={handleNavigation}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        {/* Mobile top bar with hamburger */}
        <div className="flex items-center gap-3 h-[48px] px-4 shrink-0 md:hidden"
          style={{ borderBottom: '1px solid rgba(240,168,208,.2)', background: 'rgba(255,248,253,.95)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
            style={{ color: '#c0628f' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(249,168,212,.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#f9a8d4,#7ec8e3)', boxShadow: '0 4px 12px rgba(249,168,212,.4)' }}>
              <Heart className="w-3.5 h-3.5 text-white fill-white" strokeWidth={0} />
            </div>
            <span className="text-[14px] font-black shimmer-text">GoalTracker</span>
          </div>
        </div>

        {view === 'inbox'       && <InboxView />}
        {view === 'today'       && <TodayView />}
        {view === 'plans'       && <PlansView onNewGoal={() => setGoalFormOpen(true)} />}
        {view === 'calendar'    && <CalendarView />}
        {view === 'goal-detail' && <GoalDetail />}
      </main>

      <GoalForm open={goalFormOpen} onClose={() => setGoalFormOpen(false)} />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#fce4f3 0%,#e8f4fd 100%)' }}>
      <div className="flex flex-col items-center gap-4 ani-up">
        <div className="w-14 h-14 rounded-3xl flex items-center justify-center ani-heart"
          style={{ background: 'linear-gradient(135deg,#f9a8d4,#7ec8e3)', boxShadow: '0 8px 32px rgba(249,168,212,.5)' }}>
          <Heart className="w-7 h-7 text-white fill-white" />
        </div>
        <div className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(232,140,196,.3)', borderTopColor: '#e88cc4' }} />
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const { loadAll, clearAll, initialized } = useStore();
  const prevUser = useRef<string | null>(null);
  const [path, setPath] = useState(window.location.pathname + window.location.search);

  useEffect(() => {
    const handler = () => setPath(window.location.pathname + window.location.search);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  useEffect(() => {
    if (user && prevUser.current !== user.id) {
      prevUser.current = user.id;
      loadAll();
    } else if (!user && prevUser.current !== null) {
      prevUser.current = null;
      clearAll();
    }
  }, [user, loadAll, clearAll]);

  if (path.startsWith('/auth/callback')) return <OAuthCallback />;
  if (loading) return <LoadingScreen />;
  if (!user) {
    return <AuthPage initialMode={path === '/register' ? 'register' : 'login'} />;
  }
  if (!initialized) return <LoadingScreen />;
  return <AppShell />;
}
