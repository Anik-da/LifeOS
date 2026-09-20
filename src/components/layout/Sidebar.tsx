import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Sparkles,
  BookOpen,
  Zap,
  FileText,
  GitBranch,
  RefreshCw,
  Briefcase,
  Wallet,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { LifeOSLogo } from '@/components/ui/LifeOSLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { api } from '@/services/api';

const sections = [
  {
    title: 'OVERVIEW',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
      { to: '/inbox', label: 'Ask LifeOS', icon: Sparkles, badge: 'AI' },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { to: '/knowledge', label: 'Knowledge', icon: BookOpen },
      { to: '/documents', label: 'Documents', icon: FileText },
      { to: '/actions', label: 'Action Center', icon: Zap },
      { to: '/changes', label: 'What Changed?', icon: RefreshCw },
      { to: '/workflows', label: 'Workflows', icon: GitBranch },
    ],
  },
  {
    title: 'LIFE',
    items: [
      { to: '/career', label: 'Career', icon: Briefcase },
      { to: '/finance', label: 'Finance', icon: Wallet },
      { to: '/security', label: 'Security Check', icon: Shield },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
      { to: '/health', label: 'System Health', icon: Shield },
    ],
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<{ displayName: string; email: string } | null>(null);

  useEffect(() => {
    api.auth.getProfile().then((p) => {
      setUserProfile({ displayName: p.displayName || p.email.split('@')[0], email: p.email });
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await api.auth.logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = userProfile?.displayName || 'Authenticated User';
  const displayEmail = userProfile?.email || '';
  const initials = getInitials(displayName);

  return (
    <aside
      className={`relative flex h-full flex-col border-r border-border bg-bg-secondary transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-4 border-b border-border">
        <div className="flex items-center gap-2 overflow-hidden">
          <LifeOSLogo size={collapsed ? 24 : 28} showText={!collapsed} />
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden sm:flex h-6 w-6 items-center justify-center rounded-md border border-border text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary transition-all shrink-0 ml-1"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {sections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-2 text-[10px] font-semibold text-text-tertiary tracking-wider uppercase mb-1">
                {sec.title}
              </div>
            )}
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `nav-item group relative ${isActive ? 'active' : ''} ${
                      collapsed ? 'justify-center px-0 py-2.5' : ''
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0 transition-transform group-hover:scale-110" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                        item.badge === 'AI'
                          ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                          : 'bg-bg-tertiary text-text-secondary'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User & Theme Footer */}
      <div className="border-t border-border p-3 space-y-3">
        <div className={`flex items-center justify-between gap-2 ${collapsed ? 'flex-col' : ''}`}>
          <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-semibold text-white ring-2 ring-blue-500/20">
              {initials}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-text-primary">{displayName}</div>
                <div className="truncate text-[10px] text-text-tertiary">{displayEmail}</div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleLogout}
              className="p-1.5 text-text-tertiary hover:text-red-400 hover:bg-bg-tertiary rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}

