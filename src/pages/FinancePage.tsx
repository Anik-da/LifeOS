import { useState, useEffect } from 'react';
import { Wallet, CheckCircle, AlertTriangle, FileText, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { api } from '@/services/api';
import type { ScholarshipMatch, ExpenseItem } from '@/types';

export function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scholarships, setScholarships] = useState<ScholarshipMatch[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [activeTab, setActiveTab] = useState<'scholarships' | 'expenses' | 'documents'>('scholarships');

  useEffect(() => {
    Promise.all([api.finance.getScholarships(), api.finance.getExpenses()])
      .then(([s, e]) => { setScholarships(s); setExpenses(e); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const tabs = [
    { id: 'scholarships' as const, label: 'Scholarships', icon: TrendingUp },
    { id: 'expenses' as const, label: 'Expenses', icon: Wallet },
    { id: 'documents' as const, label: 'Documents', icon: FileText },
  ];

  const matchBadge: Record<string, { label: string; class: string }> = {
    potential: { label: 'Potential match', class: 'border-amber-500/20 bg-amber-500/10 text-amber-400' },
    strong: { label: 'Strong match', class: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' },
    weak: { label: 'Weak match', class: 'border-border bg-bg-tertiary text-text-tertiary' },
  };

  if (loading) return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Finance" subtitle="Scholarship matching, expense tracking, and financial document intelligence." />
      <LoadingSkeleton variant="list" />
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Finance" subtitle="Scholarship matching, expense tracking, and financial document intelligence." />
      <ErrorState onRetry={() => window.location.reload()} />
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Finance" subtitle="Scholarship matching, expense tracking, and financial document intelligence." />

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

      {activeTab === 'scholarships' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="card p-4 border-blue-500/15">
            <p className="text-xs text-text-secondary leading-relaxed">
              Scholarship matches are informational only — based on documents you've added. This is not an official eligibility decision.
            </p>
          </div>

          {scholarships.length === 0 ? (
            <EmptyState icon={<TrendingUp size={28} />} title="No scholarship matches" description="Add scholarship documents and LifeOS will match them against your profile." />
          ) : (
            scholarships.map((s) => {
              const badge = matchBadge[s.matchStatus];
              return (
                <div key={s.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{s.name}</h3>
                      <div className="text-xs text-text-tertiary mt-0.5">Deadline: {s.deadline} · {s.amount}</div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.class}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-emerald-400 mb-2">Matched information</div>
                      <div className="space-y-1.5">
                        {s.matchedInfo.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                            <CheckCircle size={13} className="text-emerald-400 shrink-0" /> {m}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-amber-400 mb-2">Missing information</div>
                      <div className="space-y-1.5">
                        {s.missingInfo.map((m, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                            <AlertTriangle size={13} className="text-amber-400 shrink-0" /> {m}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="animate-fadeIn">
          {expenses.length === 0 ? (
            <EmptyState icon={<Wallet size={28} />} title="No expenses tracked" description="LifeOS will detect expenses from your receipts and financial documents." />
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="card p-4">
                  <div className="text-xs text-text-tertiary uppercase tracking-wider">Total tracked</div>
                  <div className="text-xl font-bold text-text-primary mt-1">₹1,85,000</div>
                </div>
                <div className="card p-4">
                  <div className="text-xs text-text-tertiary uppercase tracking-wider">Education</div>
                  <div className="text-xl font-bold text-text-primary mt-1">₹1,20,000</div>
                </div>
                <div className="card p-4">
                  <div className="text-xs text-text-tertiary uppercase tracking-wider">Electronics</div>
                  <div className="text-xl font-bold text-text-primary mt-1">₹65,000</div>
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="divide-y divide-border">
                  {expenses.map((e) => (
                    <div key={e.id} className="flex items-center justify-between px-5 py-4 hover:bg-bg-tertiary transition-colors">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-primary">{e.description}</div>
                        <div className="text-xs text-text-tertiary mt-0.5">{e.category} · {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {e.source}</div>
                      </div>
                      <div className="text-sm font-semibold text-text-primary shrink-0 ml-4">{e.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <EmptyState
          icon={<FileText size={28} />}
          title="No financial documents"
          description="Add receipts, bank statements, or financial certificates and LifeOS will organize them here."
        />
      )}
    </div>
  );
}
