import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Clock, ArrowRight } from 'lucide-react';
import { api } from '@/services/api';
import { MetricCard } from '@/components/features/MetricCard';
import { ActionCard } from '@/components/features/ActionCard';
import { Timeline } from '@/components/features/Timeline';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import type { Metric, Action, IntelligenceEvent } from '@/types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [urgentActions, setUrgentActions] = useState<Action[]>([]);
  const [events, setEvents] = useState<IntelligenceEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      api.dashboard.getMetrics(),
      api.dashboard.getActions(),
      api.dashboard.getRecentEvents(),
    ])
      .then(([m, a, e]) => {
        setMetrics(m);
        setUrgentActions(a.filter((x) => x.priority === 'urgent' || x.priority === 'warning').slice(0, 4));
        setEvents(e);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const handleComplete = (id: string) => {
    api.actions.markComplete(id).then(() => {
      setUrgentActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'completed' as const } : a)));
      showToast('Action marked complete', 'success');
    });
  };

  if (loading) return (
    <div className="mx-auto max-w-6xl px-4 py-6"><LoadingSkeleton variant="dashboard" /></div>
  );

  if (error) return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <ErrorState title="Could not load your dashboard" message="We had trouble loading your information. Please try again." onRetry={() => window.location.reload()} />
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 space-y-8">
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">{greeting}</h1>
        <p className="text-sm text-text-secondary mt-1">Here's what needs your attention.</p>
      </div>

      <div
        onClick={() => navigate('/inbox')}
        className="card card-hover flex items-center gap-3 px-4 py-3.5 cursor-pointer animate-slideUp"
      >
        <Search size={18} className="text-text-tertiary" />
        <span className="text-sm text-text-tertiary flex-1">Ask anything about your information...</span>
        <span className="hidden sm:inline text-xs text-text-tertiary italic">"What documents am I missing for my scholarship?"</span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Intelligence Overview</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((m) => <MetricCard key={m.id} metric={m} />)}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Action Center</h2>
          <Link to="/actions" className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {urgentActions.map((a) => (
            <ActionCard key={a.id} action={a} onComplete={handleComplete} compact />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Recent Intelligence</h2>
          <Link to="/knowledge" className="text-xs text-accent hover:text-accent-hover font-medium flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <Timeline events={events.slice(0, 5)} />
      </div>
    </div>
  );
}
