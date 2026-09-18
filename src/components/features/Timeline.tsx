import { SourceBadge } from '@/components/ui/Badge';
import type { IntelligenceEvent } from '@/types';

function formatTimestamp(ts: string) {
  const date = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    urgent: 'bg-red-400',
    warning: 'bg-amber-400',
    info: 'bg-blue-400',
    success: 'bg-emerald-400',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {Object.entries(groups).map(([label, items]) => (
        <div key={label}>
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">{label}</div>
          <div className="space-y-3">
            {items.map((event) => (
              <div key={event.id} className="relative flex gap-3 pl-1">
                <div className="relative flex flex-col items-center">
                  <div className={`mt-1.5 h-2.5 w-2.5 rounded-full ${priorityDot[event.priority || 'info']} ring-4 ring-bg-secondary`} />
                </div>
                <div className="card card-hover p-3.5 flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary">{event.title}</div>
                  <div className="text-xs text-text-secondary mt-1 leading-relaxed">{event.description}</div>
                  <div className="mt-2.5">
                    <SourceBadge type={typeMap[event.sourceType] || 'pdf'} name={event.source} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
