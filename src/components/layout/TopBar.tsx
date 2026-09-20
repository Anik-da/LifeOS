import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, Menu, Command, Sparkles } from 'lucide-react';
import { api } from '@/services/api';
import type { Notification } from '@/types';
import { CommandPalette } from '@/components/features/CommandPalette';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.notifications.getAll().then(setNotifs);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'Just now';
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard Command Center',
    '/inbox': 'Ask LifeOS AI',
    '/knowledge': 'Knowledge System',
    '/actions': 'Action Center',
    '/documents': 'Document Intelligence',
    '/workflows': 'Workflow Intelligence',
    '/changes': 'What Changed?',
    '/career': 'Career Intelligence',
    '/finance': 'Finance & Scholarships',
    '/security': 'Security ScamCheck',
    '/settings': 'System Settings',
  };

  const currentTitle = pageTitles[location.pathname] || 'LifeOS';

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-bg-primary/90 backdrop-blur-xl px-4 py-3 h-14">
        {/* Left Title / Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all"
            aria-label="Toggle mobile menu"
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">{currentTitle}</span>
          </div>
        </div>

        {/* Right Search & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Global Search Shortcut Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-bg-secondary/70 px-3 py-1.5 text-xs text-text-tertiary hover:border-white/20 hover:text-text-secondary transition-all w-52"
          >
            <Search size={14} className="shrink-0" />
            <span className="flex-1 text-left truncate">Search or jump to...</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-border bg-bg-tertiary px-1.5 py-0.5 text-[10px] text-text-tertiary">
              <Command size={10} /> K
            </kbd>
          </button>

          <ThemeToggle />

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg border border-border bg-bg-secondary/70 text-text-secondary hover:text-text-primary hover:border-white/20 transition-all"
              aria-label="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 card border border-border bg-bg-secondary shadow-2xl overflow-hidden animate-slideUp z-50">
                <div className="border-b border-white/10 px-4 py-3 bg-[#131620]">
                  <div className="text-xs font-bold text-text-primary tracking-tight">Notifications</div>
                  <div className="text-[10px] text-text-tertiary">{unreadCount} unread items requiring attention</div>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                  {notifs.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        navigate(n.link);
                        setNotifOpen(false);
                        api.notifications.markRead(n.id);
                        setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                      }}
                      className="flex w-full gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                    >
                      <div
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          n.type === 'urgent' ? 'bg-rose-400' : n.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                        } ${n.read ? 'opacity-30' : ''}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-semibold ${n.read ? 'text-text-tertiary' : 'text-text-primary'}`}>
                          {n.title}
                        </div>
                        <div className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">{n.description}</div>
                        <div className="text-[9px] text-text-tertiary mt-1 font-mono">{formatTime(n.timestamp)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
