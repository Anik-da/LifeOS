import { NavLink } from 'react-router-dom';
import { LayoutGrid, Inbox, Zap, FileText, Briefcase, Shield } from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Home', icon: LayoutGrid },
  { to: '/inbox', label: 'Ask', icon: Inbox },
  { to: '/actions', label: 'Actions', icon: Zap },
  { to: '/documents', label: 'Docs', icon: FileText },
  { to: '/career', label: 'Career', icon: Briefcase },
  { to: '/security', label: 'Scan', icon: Shield },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-bg-secondary/95 backdrop-blur-md lg:hidden h-16 px-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-accent' : 'text-text-tertiary'
              }`
            }
          >
            <Icon size={20} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
