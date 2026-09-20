import { useState, useEffect } from 'react';
import { GitBranch, FileText, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { WorkflowStep } from '@/components/features/WorkflowStep';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { api } from '@/services/api';
import type { Workflow } from '@/types';

export function WorkflowsPage() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  useEffect(() => {
    api.workflows.getAll()
      .then((w) => { setWorkflows(w); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const handleAnalyzeWorkflow = () => {
    setAnalyzing(true);
    api.workflows.analyze()
      .then((newWf) => {
        setWorkflows((prev) => [newWf, ...prev]);
        setAnalyzing(false);
      })
      .catch(() => setAnalyzing(false));
  };

  if (loading) return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Workflows" subtitle="LifeOS understands multi-step processes — not just individual tasks." />
      <LoadingSkeleton variant="workflow" />
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Workflows" subtitle="LifeOS understands multi-step processes — not just individual tasks." />
      <ErrorState onRetry={() => window.location.reload()} />
    </div>
  );

  if (workflows.length === 0) return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8 space-y-6">
      <PageHeader title="Workflows" subtitle="LifeOS understands multi-step processes — not just individual tasks." />
      <EmptyState
        icon={<GitBranch size={28} />}
        title="No workflows extracted yet"
        description="Your first workflow will appear when LifeOS identifies a multi-step process in one of your uploaded documents."
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Workflows" subtitle="LifeOS understands multi-step processes — not just individual tasks." />

      {workflows.map((wf) => {
        const currentStage = wf.stages.find((s) => s.id === wf.currentStageId);
        const completedCount = wf.stages.filter((s) => s.status === 'complete').length;
        const nextStage = wf.stages.find((s) => s.status === 'waiting' && s.id !== wf.currentStageId);

        return (
          <div key={wf.id} className="space-y-6 animate-fadeIn">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <GitBranch size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-text-primary">{wf.name}</h2>
                  <p className="text-xs text-text-tertiary mt-0.5">{wf.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="rounded-lg border border-border bg-bg-tertiary p-3 text-center">
                  <div className="text-xl font-bold text-text-primary">{completedCount}</div>
                  <div className="text-[10px] text-text-tertiary mt-0.5 uppercase tracking-wider">Completed</div>
                </div>
                <div className="rounded-lg border border-accent/20 bg-accent-soft p-3 text-center">
                  <div className="text-xl font-bold text-accent">1</div>
                  <div className="text-[10px] text-accent mt-0.5 uppercase tracking-wider">In progress</div>
                </div>
                <div className="rounded-lg border border-border bg-bg-tertiary p-3 text-center">
                  <div className="text-xl font-bold text-text-primary">{wf.stages.length - completedCount - 1}</div>
                  <div className="text-[10px] text-text-tertiary mt-0.5 uppercase tracking-wider">Remaining</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center py-4">
              {wf.stages.map((stage, i) => (
                <WorkflowStep
                  key={stage.id}
                  stage={stage}
                  isLast={i === wf.stages.length - 1}
                  isCurrent={stage.id === wf.currentStageId}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-5">
                <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Current stage</div>
                <div className="text-sm font-medium text-text-primary">{currentStage?.name}</div>
                <div className="text-sm text-text-secondary mt-1">{currentStage?.description}</div>
              </div>

              <div className="card p-5">
                <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Required action</div>
                <div className="text-sm font-medium text-text-primary">Obtain income certificate</div>
                <div className="text-sm text-text-secondary mt-1">Needed before application can proceed to submission</div>
              </div>

              <div className="card p-5">
                <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Next stage</div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-text-primary">{nextStage?.name || 'Application submission'}</div>
                  <ArrowRight size={14} className="text-text-tertiary" />
                </div>
                <div className="text-sm text-text-secondary mt-1">{nextStage?.description || 'Submit completed application'}</div>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={14} className="text-text-tertiary" />
                  <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Source evidence</span>
                </div>
                <div className="space-y-1.5">
                  {wf.sourceEvidence.map((s, i) => (
                    <div key={i} className="text-sm text-text-secondary flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
