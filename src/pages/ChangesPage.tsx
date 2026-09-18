import { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatusBadge } from '@/components/ui/Badge';
import { api } from '@/services/api';
import type { DocumentChange } from '@/types';

const priorityConfig: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  urgent: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '🔴' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '🟡' },
  info: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '🔵' },
  success: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '🟢' },
};

export function ChangesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [changes, setChanges] = useState<DocumentChange[]>([]);
  const [selected, setSelected] = useState<DocumentChange | null>(null);

  useEffect(() => {
    api.changes.getAll()
      .then((c) => { setChanges(c); setSelected(c[0] || null); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="What Changed?" subtitle="LifeOS detects and explains differences between document versions." />

      {loading ? (
        <LoadingSkeleton variant="detail" />
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : changes.length === 0 ? (
        <EmptyState
          icon={<RefreshCw size={28} />}
          title="No changes detected"
          description="LifeOS will show changes here when it detects differences between updated versions of your documents."
        />
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {changes.map((change) => (
            <ChangeComparison key={change.id} change={change} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChangeComparison({ change }: { change: DocumentChange }) {
  const [v1, setV1] = useState(change.version1);
  const [v2, setV2] = useState(change.version2);

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{change.documentName}</h3>
            <p className="text-xs text-text-tertiary mt-0.5">{change.summary}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={v1}
              onChange={(e) => setV1(e.target.value)}
              className="input-field text-xs px-2.5 py-1.5"
            >
              <option>{change.version1}</option>
              <option>{change.version2}</option>
            </select>
            <ArrowRight size={14} className="text-text-tertiary" />
            <select
              value={v2}
              onChange={(e) => setV2(e.target.value)}
              className="input-field text-xs px-2.5 py-1.5"
            >
              <option>{change.version1}</option>
              <option>{change.version2}</option>
            </select>
          </div>
        </div>

        <div className="text-sm font-medium text-text-primary mb-4">
          {change.changes.length} important {change.changes.length === 1 ? 'change' : 'changes'}
        </div>

        <div className="space-y-3">
          {change.changes.map((c) => {
            const cfg = priorityConfig[c.priority] || priorityConfig.info;
            return (
              <div key={c.id} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 h-2 w-2 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-text-primary">{c.label}</span>
                      <StatusBadge priority={c.priority}>
                        {c.type === 'deadline' ? 'Deadline' : c.type === 'requirement' ? 'New requirement' : c.type === 'eligibility' ? 'Eligibility' : 'Change'}
                      </StatusBadge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-text-tertiary line-through">{c.oldValue}</span>
                      <ArrowRight size={14} className="text-text-tertiary" />
                      <span className="text-text-primary font-medium">{c.newValue}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-5 border-accent/15">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Lightbulb size={15} />
          </div>
          <span className="text-sm font-semibold text-text-primary">Why this matters</span>
        </div>
        <div className="space-y-3">
          {change.changes.map((c) => (
            <div key={c.id} className="text-sm text-text-secondary leading-relaxed">
              <span className="font-medium text-text-primary">{c.label}: </span>
              {c.whyItMatters}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Detailed comparison</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-text-tertiary mb-2">{v1}</div>
            <div className="rounded-lg border border-border bg-bg-tertiary p-3 space-y-2">
              {change.changes.map((c) => (
                <div key={c.id} className="text-xs text-text-secondary">
                  <span className="font-medium text-text-primary">{c.label}: </span>
                  {c.oldValue}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-text-tertiary mb-2">{v2}</div>
            <div className="rounded-lg border border-border bg-bg-tertiary p-3 space-y-2">
              {change.changes.map((c) => (
                <div key={c.id} className="text-xs">
                  <span className="font-medium text-text-primary">{c.label}: </span>
                  <span className="text-accent">{c.newValue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
