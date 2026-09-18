import { Link } from 'react-router-dom';
import { Clock, FileText, Check, AlertTriangle } from 'lucide-react';
import type { Action } from '@/types';

const priorityStyles: Record<string, { dot: string; border: string; bg: string }> = {
  urgent: { dot: 'bg-red-400', border: 'border-l-red-500', bg: 'hover:border-red-500/30' },
  warning: { dot: 'bg-amber-400', border: 'border-l-amber-500', bg: 'hover:border-amber-500/30' },
  info: { dot: 'bg-blue-400', border: 'border-l-blue-500', bg: 'hover:border-blue-500/30' },
  success: { dot: 'bg-emerald-400', border: 'border-l-emerald-500', bg: 'hover:border-emerald-500/30' },
};

export function ActionCard({
  action,
  onComplete,
  compact,
}: {
  action: Action;
  onComplete?: (id: string) => void;
  compact?: boolean;
}) {
  const style = priorityStyles[action.priority] || priorityStyles.info;

  if (compact) {
    return (
      <Link
        to="/actions"
        className={`card card-hover p-4 border-l-2 ${style.border} ${style.bg} flex items-start gap-3 animate-slideUp`}
      >
        <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-text-primary truncate">{action.title}</div>
          <div className="text-xs text-text-secondary mt-0.5 truncate">{action.description}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
              <FileText size={11} /> {action.source}
            </span>
            {action.daysLeft > 0 && action.status !== 'completed' && (
              <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                <Clock size={11} /> {action.daysLeft}d left
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className={`card p-5 border-l-2 ${style.border} animate-slideUp`}>
      <div className="flex items-start gap-3">
        <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${style.dot} ${action.status === 'completed' ? 'opacity-40' : ''}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-sm font-semibold ${action.status === 'completed' ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
              {action.title}
            </h3>
            {action.status === 'completed' ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                <Check size={11} /> Done
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-text-tertiary">
                <Clock size={11} /> {action.daysLeft}d left
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">{action.description}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text-tertiary">
            <span className="flex items-center gap-1">
              <FileText size={12} /> {action.source}
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle size={12} /> Due {new Date(action.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {action.status !== 'completed' && onComplete && (
              <button
                onClick={() => onComplete(action.id)}
                className="btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
              >
                <Check size={13} /> Mark complete
              </button>
            )}
            <Link
              to={action.sourceId ? `/documents/${action.sourceId}` : '/documents'}
              className="btn-secondary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <FileText size={13} /> View source
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
