import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Timeline } from '@/components/features/Timeline';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { api } from '@/services/api';
import type { IntelligenceEvent } from '@/types';
import { Network, BookOpen } from 'lucide-react';

export function KnowledgePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [events, setEvents] = useState<IntelligenceEvent[]>([]);
  const [view, setView] = useState<'timeline' | 'graph'>('timeline');

  useEffect(() => {
    api.knowledge.getEvents()
      .then((e) => { setEvents(e); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Knowledge" subtitle="Everything LifeOS has learned from your information, in chronological order.">
        <button
          onClick={() => setView(view === 'timeline' ? 'graph' : 'timeline')}
          className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
        >
          <Network size={13} />
          {view === 'timeline' ? 'Connections' : 'Timeline'}
        </button>
      </PageHeader>

      {view === 'graph' ? (
        <KnowledgeGraphView />
      ) : (
        <>
          {loading ? (
            <LoadingSkeleton variant="list" />
          ) : error ? (
            <ErrorState onRetry={() => window.location.reload()} />
          ) : events.length === 0 ? (
            <EmptyState icon={<BookOpen size={28} />} title="No intelligence yet" description="LifeOS will show events here as it discovers information from your documents, emails, and receipts." />
          ) : (
            <Timeline events={events} />
          )}
        </>
      )}
    </div>
  );
}

function KnowledgeGraphView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.knowledge.getGraph()
      .then(() => setLoading(false))
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return <LoadingSkeleton variant="card" />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  const nodeColors: Record<string, string> = {
    document: '#ef4444',
    application: '#3b82f6',
    deadline: '#f59e0b',
    action: '#10b981',
    person: '#8b5cf6',
    organization: '#06b6d4',
  };

  const nodeLabels: Record<string, string> = {
    document: 'Document',
    application: 'Application',
    deadline: 'Deadline',
    action: 'Action',
    person: 'Person',
    organization: 'Organization',
  };

  return (
    <div className="animate-fadeIn">
      <div className="card p-6 mb-4">
        <div className="text-sm text-text-secondary mb-4">
          LifeOS connects your information — documents reference applications, applications have deadlines, deadlines create actions. Here's a visual map of those relationships.
        </div>
        <div className="relative h-[500px] rounded-xl border border-border bg-bg-primary overflow-hidden">
          <svg className="absolute inset-0 w-full h-full">
            {/* Edges */}
            <line x1="300" y1="60" x2="300" y2="120" stroke="#2e323d" strokeWidth="2" />
            <line x1="300" y1="160" x2="300" y2="220" stroke="#2e323d" strokeWidth="2" />
            <line x1="300" y1="260" x2="300" y2="320" stroke="#2e323d" strokeWidth="2" />
            <line x1="300" y1="360" x2="300" y2="420" stroke="#2e323d" strokeWidth="2" />
            <line x1="350" y1="80" x2="450" y2="100" stroke="#2e323d" strokeWidth="2" strokeDasharray="4" />
            <line x1="350" y1="80" x2="450" y2="200" stroke="#2e323d" strokeWidth="2" strokeDasharray="4" />
            <line x1="350" y1="300" x2="450" y2="300" stroke="#2e323d" strokeWidth="2" strokeDasharray="4" />
            <line x1="350" y1="400" x2="450" y2="400" stroke="#2e323d" strokeWidth="2" strokeDasharray="4" />
          </svg>

          {/* Nodes */}
          {[
            { label: 'Scholarship.pdf', type: 'document', x: 220, y: 40 },
            { label: 'Scholarship Application', type: 'application', x: 195, y: 120 },
            { label: 'Income Certificate', type: 'document', x: 220, y: 220 },
            { label: 'Deadline: 15 Oct', type: 'deadline', x: 215, y: 320 },
            { label: 'Obtain certificate', type: 'action', x: 210, y: 400 },
            { label: 'Ministry of Education', type: 'organization', x: 440, y: 80 },
            { label: 'Dr. Rajesh Kumar', type: 'person', x: 450, y: 180 },
            { label: 'Interview Email', type: 'document', x: 450, y: 280 },
            { label: 'TechCorp', type: 'organization', x: 460, y: 380 },
          ].map((node, i) => (
            <div
              key={i}
              className="absolute flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium text-text-primary whitespace-nowrap card-hover"
              style={{
                left: node.x,
                top: node.y,
                borderColor: `${nodeColors[node.type]}40`,
                backgroundColor: `${nodeColors[node.type]}10`,
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: nodeColors[node.type] }} />
              {node.label}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries(nodeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {nodeLabels[type]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
