import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, BookOpen, Zap, GitBranch, RefreshCw, Briefcase, DollarSign, ShieldAlert, ArrowRight, X } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onAskAI?: (question: string) => void;
}

export function CommandPalette({ open, onClose, onAskAI }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) onClose();
      }
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const quickNav = [
    { label: 'Ask LifeOS AI', icon: Sparkles, path: '/knowledge', color: 'text-amber-400' },
    { label: 'Knowledge Base', icon: BookOpen, path: '/knowledge', color: 'text-blue-400' },
    { label: 'Action Center', icon: Zap, path: '/actions', color: 'text-rose-400' },
    { label: 'Documents & Files', icon: BookOpen, path: '/documents', color: 'text-emerald-400' },
    { label: 'What Changed?', icon: RefreshCw, path: '/changes', color: 'text-indigo-400' },
    { label: 'Workflows & Processes', icon: GitBranch, path: '/workflows', color: 'text-amber-400' },
    { label: 'Career Intelligence', icon: Briefcase, path: '/career', color: 'text-purple-400' },
    { label: 'Finance & Scholarships', icon: DollarSign, path: '/finance', color: 'text-green-400' },
    { label: 'Security ScamCheck', icon: ShieldAlert, path: '/security', color: 'text-red-400' },
  ];

  const filteredNav = quickNav.filter(n => n.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleAsk = () => {
    if (query.trim() && onAskAI) {
      onAskAI(query);
      onClose();
    } else {
      navigate('/knowledge');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0d0f15] shadow-2xl overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-[#131620]">
          <Search size={18} className="text-text-tertiary shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAsk(); }}
            placeholder="Ask LifeOS anything or search shortcuts..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {query.trim() && (
            <button
              onClick={handleAsk}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-accent-soft border border-accent/20 text-accent hover:bg-accent/20 transition-all text-left text-xs font-medium"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={15} />
                <span>Ask LifeOS AI: "{query}"</span>
              </div>
              <ArrowRight size={14} />
            </button>
          )}

          <div className="px-3 py-1.5 text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">
            Quick Navigation
          </div>

          {filteredNav.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(item.path)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs text-text-secondary hover:text-text-primary hover:bg-[#181b25] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg bg-white/5 ${item.color}`}>
                    <Icon size={15} />
                  </div>
                  <span className="font-medium text-text-primary">{item.label}</span>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary" />
              </button>
            );
          })}
        </div>

        <div className="px-4 py-2.5 border-t border-white/5 bg-[#090b0e] flex items-center justify-between text-[11px] text-text-tertiary">
          <span>Navigate with arrows or click</span>
          <span className="flex items-center gap-1 font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded">
            ESC to close
          </span>
        </div>
      </div>
    </div>
  );
}
