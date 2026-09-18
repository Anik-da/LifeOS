import { Link } from 'react-router-dom';
import { BookOpen, Zap, GitBranch, RefreshCw } from 'lucide-react';
import type { Metric } from '@/types';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  BookOpen, Zap, GitBranch, RefreshCw,
};

const accentColors: Record<string, string> = {
  urgent: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
  success: 'text-emerald-400',
};

export function MetricCard({ metric }: { metric: Metric }) {
  const Icon = iconMap[metric.icon] || BookOpen;
  return (
    <Link
      to={metric.link}
      className="card card-hover p-5 group animate-slideUp"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-bg-tertiary ${accentColors[metric.accent]}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="text-3xl font-bold text-text-primary tracking-tight">{metric.value}</div>
      <div className="text-sm font-medium text-text-primary mt-1">{metric.label}</div>
      <div className="text-xs text-text-tertiary mt-0.5">{metric.sublabel}</div>
    </Link>
  );
}
