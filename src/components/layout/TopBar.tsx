import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, Command } from 'lucide-react';
import { api } from '@/services/api';
import type { Notification } from '@/types';

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.notifications.getAll().then(setNotifs);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
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

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-bg-primary/80 backdrop-blur-md px-4 py-3 h-14">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-lg p-2 text-text-secondary hover:bg-bg-tertiary"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <button
          onClick={() => setSearchOpen(true)}
          className="flex flex-1 items-center gap-2.5 rounded-xl border border-border bg-bg-tertiary px-3.5 py-2 text-sm text-text-tertiary hover:border-border-hover transition-colors max-w-md"
        >
          <Search size={16} />
          <span className="hidden sm:inline">Search across everything...</span>
          <span className="sm:hidden">Search...</span>
          <kbd className="ml-auto hidden sm:flex items-center gap-0.5 rounded border border-border bg-bg-elevated px-1.5 py-0.5 text-[10px] font-mono text-text-tertiary">
            <Command size={10} />K
          </kbd>
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-text-secondary hover:bg-bg-tertiary transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 card overflow-hidden animate-slideUp z-50">
              <div className="border-b border-border px-4 py-3">
                <div className="text-sm font-semibold text-text-primary">Notifications</div>
                <div className="text-xs text-text-tertiary">{unreadCount} unread</div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifs.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      navigate(n.link);
                      setNotifOpen(false);
                      api.notifications.markRead(n.id);
                      setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                    }}
                    className="flex w-full gap-3 border-b border-border/50 px-4 py-3 text-left hover:bg-bg-tertiary transition-colors"
                  >
                    <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.type === 'urgent' ? 'bg-red-400' : n.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                    } ${n.read ? 'opacity-30' : ''}`} />
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium ${n.read ? 'text-text-tertiary' : 'text-text-primary'}`}>{n.title}</div>
                      <div className="text-xs text-text-secondary mt-0.5 line-clamp-2">{n.description}</div>
                      <div className="text-[10px] text-text-tertiary mt-1">{formatTime(n.timestamp)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {searchOpen && <CommandPalette onClose={() => setSearchOpen(false)} />}
    </>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<{ title: string; type: string; snippet: string; link: string; date: string }[]>([]);

  const allItems = [
    { title: 'Scholarship_Requirements.pdf', type: 'Document', snippet: 'Income certificate required — due in 3 days', link: '/documents', date: 'Sep 10' },
    { title: 'Obtain income certificate', type: 'Action', snippet: 'Urgent — deadline Sep 20', link: '/actions', date: 'Sep 10' },
    { title: 'Scholarship deadline changed', type: 'Change', snippet: '30 June → 15 October', link: '/changes', date: 'Sep 17' },
    { title: 'Interview invitation detected', type: 'Event', snippet: 'TechCorp — Software Engineer Intern', link: '/career', date: 'Sep 16' },
    { title: 'Scholarship Application', type: 'Workflow', snippet: 'Stage 3 of 6 — waiting for income certificate', link: '/workflows', date: 'Active' },
    { title: 'Laptop warranty expires', type: 'Action', snippet: '23 days remaining', link: '/actions', date: 'Aug 25' },
    { title: 'National Merit Scholarship 2026', type: 'Finance', snippet: 'Potential match — ₹50,000/year', link: '/finance', date: 'Oct 15' },
    { title: 'TechCorp Application', type: 'Career', snippet: 'Interview stage — respond by Sep 19', link: '/career', date: 'Sep 1' },
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(allItems);
    } else {
      setResults(allItems.filter((i) =>
        i.title.toLowerCase().includes(query.toLowerCase()) ||
        i.snippet.toLowerCase().includes(query.toLowerCase()) ||
        i.type.toLowerCase().includes(query.toLowerCase())
      ));
    }
  }, [query]);

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/60 animate-fadeIn" onClick={onClose} />
      <div className="relative w-full max-w-xl card overflow-hidden animate-slideUp shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search size={18} className="text-text-tertiary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, actions, processes..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
          <kbd className="rounded border border-border bg-bg-elevated px-1.5 py-0.5 text-[10px] font-mono text-text-tertiary">ESC</kbd>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-text-tertiary">No results found</div>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                onClick={() => { navigate(r.link); onClose(); }}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-bg-tertiary transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary truncate">{r.title}</span>
                    <span className="shrink-0 rounded border border-border bg-bg-tertiary px-1.5 py-0.5 text-[10px] text-text-tertiary">{r.type}</span>
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5 truncate">{r.snippet}</div>
                </div>
                <span className="shrink-0 text-[10px] text-text-tertiary">{r.date}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
