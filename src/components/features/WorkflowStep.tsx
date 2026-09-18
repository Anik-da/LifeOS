import { Check, Circle, Loader, AlertTriangle } from 'lucide-react';
import type { WorkflowStage } from '@/types';

const statusConfig: Record<string, { icon: React.ComponentType<{ size?: number }>; color: string; ring: string; label: string }> = {
  complete: { icon: Check, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', ring: 'bg-emerald-500/50', label: 'Complete' },
  in_progress: { icon: Loader, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', ring: 'bg-blue-500/50', label: 'In progress' },
  waiting: { icon: Circle, color: 'text-text-tertiary bg-bg-tertiary border-border', ring: 'bg-border', label: 'Waiting' },
  needs_action: { icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', ring: 'bg-amber-500/50', label: 'Needs action' },
};

export function WorkflowStep({
  stage,
  isLast,
  isCurrent,
}: {
  stage: WorkflowStage;
  isLast: boolean;
  isCurrent: boolean;
}) {
  const config = statusConfig[stage.status] || statusConfig.waiting;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center animate-slideUp">
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 w-full max-w-sm transition-all ${
        isCurrent ? 'border-accent/40 bg-accent-soft shadow-lg shadow-accent/5' : 'border-border bg-bg-secondary'
      }`}>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${config.color}`}>
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-medium ${isCurrent ? 'text-text-primary' : 'text-text-secondary'}`}>{stage.name}</div>
          {stage.description && (
            <div className="text-xs text-text-tertiary mt-0.5">{stage.description}</div>
          )}
          <div className={`text-[11px] font-medium mt-1 ${config.color.split(' ')[0]}`}>{config.label}</div>
        </div>
      </div>
      {!isLast && (
        <div className={`w-px h-6 ${config.ring}`} />
      )}
    </div>
  );
}
