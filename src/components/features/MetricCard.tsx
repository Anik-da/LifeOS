import { Link } from 'react-router-dom';
import { BookOpen, Zap, GitBranch, RefreshCw, ArrowUpRight } from 'lucide-react';
import type { Metric } from '@/types';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  BookOpen, Zap, GitBranch, RefreshCw,
};

const accentStyles: Record<string, { text: string; bg: string; border: string }> = {
  urgent: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  warning: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  info: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  success: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

export function MetricCard({ metric }: { metric: Metric }) {
  const Icon = iconMap[metric.icon] || BookOpen;
  const style = accentStyles[metric.accent] || accentStyles.info;

  return (
    <Link
      to={metric.link}
      className="card card-hover p-4 sm:p-5 group animate-slideUp relative overflow-hidden flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${style.border} ${style.bg} ${style.text}`}>
          <Icon size={18} />
        </div>
        <ArrowUpRight size={14} className="text-text-tertiary group-hover:text-text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">{metric.value}</div>
        <div className="text-xs font-semibold text-text-primary mt-1">{metric.label}</div>
        <div className="text-[11px] text-text-tertiary mt-0.5">{metric.sublabel}</div>
      </div>
    </Link>
  );
}
