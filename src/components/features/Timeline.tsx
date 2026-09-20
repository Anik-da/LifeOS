import { Link } from 'react-router-dom';
import { SourceBadge } from '@/components/ui/Badge';
import { ArrowRight } from 'lucide-react';
import type { IntelligenceEvent } from '@/types';

function formatTimestamp(ts: string) {
  const date = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return 'TODAY';
  if (diffDays === 1) return 'YESTERDAY';
  if (diffDays < 7) return `${diffDays} DAYS AGO`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

const typeMap: Record<string, 'pdf' | 'email' | 'image' | 'receipt' | 'certificate'> = {
  pdf: 'pdf',
  email: 'email',
  image: 'image',
  receipt: 'receipt',
};

export function Timeline({ events }: { events: IntelligenceEvent[] }) {
  const groups: Record<string, IntelligenceEvent[]> = {};
  for (const e of events) {
    const label = formatTimestamp(e.timestamp);
    if (!groups[label]) groups[label] = [];
    groups[label].push(e);
  }

  const priorityDot: Record<string, string> = {
    urgent: 'bg-rose-500 shadow-rose-500/50',
    warning: 'bg-amber-400 shadow-amber-400/50',
    info: 'bg-blue-400 shadow-blue-400/50',
    success: 'bg-emerald-400 shadow-emerald-400/50',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {Object.entries(groups).map(([label, items]) => (
        <div key={label}>
          <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-3 px-1">{label}</div>
          <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
            {items.map((event) => (
              <div key={event.id} className="relative flex gap-3.5 pl-1.5 group">
                <div className="relative flex flex-col items-center shrink-0">
                  <div className={`mt-2 h-2.5 w-2.5 rounded-full ${priorityDot[event.priority || 'info']} shadow-md ring-4 ring-[#07080b]`} />
                </div>
                <Link
                  to={event.pageLink || '/documents'}
                  className="card card-hover p-4 flex-1 min-w-0 flex items-start justify-between gap-3 group-hover:border-white/20 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors">{event.title}</div>
                    <div className="text-xs text-text-secondary mt-1 leading-relaxed">{event.description}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <SourceBadge type={typeMap[event.sourceType] || 'pdf'} name={event.source} />
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
