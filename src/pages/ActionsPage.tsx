import { useState, useEffect } from 'react';
import { Zap, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ActionCard } from '@/components/features/ActionCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import type { Action } from '@/types';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export function ActionsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('all');

  useEffect(() => {
    api.actions.getAll()
      .then((a) => { setActions(a); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const handleComplete = (id: string) => {
    api.actions.markComplete(id).then(() => {
      setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'completed' as const } : a)));
      showToast('Action marked complete', 'success');
    });
  };

  const filtered = actions.filter((a) => {
    if (activeTab === 'all') return a.status !== 'completed';
    if (activeTab === 'urgent') return a.priority === 'urgent' && a.status !== 'completed';
    if (activeTab === 'upcoming') return a.priority !== 'urgent' && a.status !== 'completed';
    if (activeTab === 'completed') return a.status === 'completed';
    return true;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Action Center" subtitle="Actions automatically extracted from your information — deadlines, requirements, and follow-ups." />

      <div className="flex items-center gap-1 mb-6 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton variant="list" />
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={activeTab === 'completed' ? <CheckCircle size={28} /> : <Zap size={28} />}
          title={activeTab === 'completed' ? 'No completed actions' : 'No actions detected'}
          description={activeTab === 'completed'
            ? 'Actions you complete will appear here for your reference.'
            : 'LifeOS will show actions when it finds deadlines or requirements in your documents.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <ActionCard key={a.id} action={a} onComplete={handleComplete} />
          ))}
        </div>
      )}
    </div>
  );
}
