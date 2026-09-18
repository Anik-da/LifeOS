import { NavLink } from 'react-router-dom';
import { Brain, LayoutGrid, Inbox, BookOpen, Zap, FileText, GitBranch, RefreshCw, Briefcase, Wallet, Shield, Settings } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/inbox', label: 'Ask LifeOS', icon: Inbox },
  { to: '/knowledge', label: 'Knowledge', icon: BookOpen },
  { to: '/actions', label: 'Actions', icon: Zap },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/workflows', label: 'Workflows', icon: GitBranch },
  { to: '/changes', label: 'Changes', icon: RefreshCw },
  { to: '/career', label: 'Career', icon: Briefcase },
  { to: '/finance', label: 'Finance', icon: Wallet },
  { to: '/security', label: 'Security', icon: Shield },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-bg-secondary">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
          <Brain size={20} />
        </div>
        <div>
          <div className="text-sm font-bold text-text-primary tracking-tight">LifeOS</div>
          <div className="text-[10px] text-text-tertiary font-medium">Action Intelligence</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-sm font-semibold text-white">
            DU
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-text-primary">Demo User</div>
            <div className="truncate text-xs text-text-tertiary">demo@lifeos.app</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
