import { useState, useEffect } from 'react';
import { Briefcase, Mail, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { api } from '@/services/api';
import type { CareerApplication, SkillGap } from '@/types';

export function CareerPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'skillgap' | 'interview'>('applications');

  useEffect(() => {
    Promise.all([api.career.getApplications(), api.career.getSkillGap()])
      .then(([a, s]) => { setApplications(a); setSkillGap(s); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const tabs = [
    { id: 'applications' as const, label: 'Applications', icon: Briefcase },
    { id: 'skillgap' as const, label: 'Skill Gap', icon: TrendingUp },
    { id: 'interview' as const, label: 'Interview Practice', icon: Mail },
  ];

  if (loading) return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Career" subtitle="Track applications, identify skill gaps, and prepare for interviews." />
      <LoadingSkeleton variant="list" />
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Career" subtitle="Track applications, identify skill gaps, and prepare for interviews." />
      <ErrorState onRetry={() => window.location.reload()} />
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Career" subtitle="Track applications, identify skill gaps, and prepare for interviews." />

      <div className="flex items-center gap-1 mb-6 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <Icon size={15} /> {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
            </button>
          );
        })}
      </div>

      {activeTab === 'applications' && (
        <div className="space-y-4 animate-fadeIn">
          {applications.length === 0 ? (
            <EmptyState icon={<Briefcase size={28} />} title="No applications yet" description="LifeOS will track your job applications and detect status updates from your emails." />
          ) : (
            applications.map((app) => (
              <div key={app.id} className="card p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{app.role}</h3>
                    <div className="text-xs text-text-tertiary mt-0.5">{app.company} · Applied {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                  <span className="text-xs text-text-secondary">{app.currentStatus}</span>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {app.stages.map((stage, i) => (
                    <div key={i} className="flex items-center gap-1 shrink-0">
                      <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                        stage.status === 'complete' ? 'bg-emerald-500/10 text-emerald-400' :
                        stage.status === 'current' ? 'bg-accent-soft text-accent' :
                        'bg-bg-tertiary text-text-tertiary'
                      }`}>
                        {stage.status === 'complete' && <CheckCircle size={12} />}
                        {stage.status === 'current' && <Clock size={12} />}
                        {stage.status === 'pending' && <div className="h-2 w-2 rounded-full border border-current" />}
                        {stage.name}
                      </div>
                      {i < app.stages.length - 1 && <div className="h-px w-4 bg-border" />}
                    </div>
                  ))}
                </div>

                {app.lastEmailDetected && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-text-tertiary border-t border-border pt-3">
                    <Mail size={12} />
                    {app.lastEmailDetected}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'skillgap' && skillGap && (
        <div className="space-y-4 animate-fadeIn">
          <div className="card p-5 border-amber-500/15">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} className="text-amber-400" />
              <span className="text-sm font-semibold text-text-primary">Skill gap detected</span>
            </div>
            <p className="text-xs text-text-secondary">
              Based on the job description for {skillGap.jobTitle} at {skillGap.company}. This is an informational comparison, not an official eligibility assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Your skills</div>
              <div className="space-y-2.5">
                {skillGap.yourSkills.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-text-primary">{s.name}</span>
                    <SkillMark status={s.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Job requirements</div>
              <div className="space-y-2.5">
                {skillGap.jobRequirements.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-text-primary">{s.name}</span>
                    <SkillMark status={s.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Gap analysis</div>
            <div className="space-y-2">
              {skillGap.yourSkills.filter((s) => s.status === 'missing' || s.status === 'partial').map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <AlertTriangle size={14} className={s.status === 'missing' ? 'text-red-400' : 'text-amber-400'} />
                  <span className="text-text-secondary">
                    <span className="text-text-primary font-medium">{s.name}</span> — {s.status === 'missing' ? 'Not yet covered' : 'Partial knowledge'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'interview' && (
        <EmptyState
          icon={<Mail size={28} />}
          title="Interview practice coming soon"
          description="LifeOS will generate practice questions based on your job applications and detected interview invitations."
        />
      )}
    </div>
  );
}

function SkillMark({ status }: { status: 'have' | 'partial' | 'missing' }) {
  if (status === 'have') return <CheckCircle size={16} className="text-emerald-400" />;
  if (status === 'partial') return <span className="text-amber-400 text-sm">◐</span>;
  return <span className="text-red-400 text-sm">✕</span>;
}
