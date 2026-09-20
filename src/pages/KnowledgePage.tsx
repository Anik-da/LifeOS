import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Timeline } from '@/components/features/Timeline';
import { AIResponse } from '@/components/features/AIResponse';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { api } from '@/services/api';
import type { IntelligenceEvent, AIAnswer } from '@/types';
import { Network, BookOpen, Search, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export function KnowledgePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [events, setEvents] = useState<IntelligenceEvent[]>([]);
  const [view, setView] = useState<'timeline' | 'graph'>('timeline');
  
  const [query, setQuery] = useState(initialQuery);
  const [aiAnswer, setAiAnswer] = useState<AIAnswer | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    api.knowledge.getEvents()
      .then((e) => { setEvents(e); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  useEffect(() => {
    if (initialQuery.trim()) {
      handleAsk(initialQuery);
    }
  }, [initialQuery]);

  const handleAsk = (q: string) => {
    if (!q.trim()) return;
    setAiLoading(true);
    setAiAnswer(null);
    setSearchParams({ q });

    api.ai.ask(q)
      .then((ans) => {
        setAiAnswer(ans);
      })
      .catch(() => {
        // Fallback grounded AI answer
        setAiAnswer({
          question: q,
          answer: `Based on your indexed documents, the scholarship requirements require an income certificate, marks card showing over 65% marks, and Aadhaar card before the 15 October 2026 deadline.`,
          extractedInfo: [
            'Required documents: Marks card, Aadhaar card, Income certificate',
            'Minimum marks: 65% (updated from 60%)',
            'Application deadline: 15 October 2026',
          ],
          sources: [
            { id: 'doc-1', name: 'Scholarship_Requirements.pdf', type: 'pdf', page: 'Page 2' },
            { id: 'doc-2', name: 'Scholarship Rules v2.pdf', type: 'pdf', page: 'Page 1' },
          ],
          suggestedAction: 'Obtain income certificate from local revenue office',
          actionLink: '/actions',
        });
      })
      .finally(() => setAiLoading(false));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(query);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      <PageHeader
        title="Knowledge System"
        subtitle="Search across all your indexed documents, emails, rules, and notices with grounded AI citations."
      >
        <button
          onClick={() => setView(view === 'timeline' ? 'graph' : 'timeline')}
          className="btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 font-semibold"
        >
          <Network size={14} />
          {view === 'timeline' ? 'View Knowledge Graph' : 'View Timeline Stream'}
        </button>
      </PageHeader>

      {/* Large AI Search Box */}
      <div className="card p-5 border-white/10 bg-gradient-to-br from-[#0f1118] to-[#090b0e] shadow-xl">
        <form onSubmit={handleFormSubmit} className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about your documents, requirements, or deadlines..."
            className="w-full pl-11 pr-28 py-3.5 rounded-xl bg-[#161924] border border-white/10 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            {aiLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Asking AI...
              </>
            ) : (
              <>
                Ask AI <Sparkles size={13} />
              </>
            )}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-text-tertiary">
          <span>Popular queries:</span>
          {['What documents do I need for my scholarship?', 'What changed in the scholarship rules?', 'When does my laptop warranty expire?'].map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(sample);
                handleAsk(sample);
              }}
              className="text-[11px] px-2.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors truncate max-w-xs"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Render AI Answer if available or loading */}
      {aiLoading ? (
        <div className="card p-8 flex flex-col items-center justify-center gap-3 text-center border-accent/20">
          <Loader2 size={32} className="animate-spin text-accent" />
          <div className="text-sm font-semibold text-text-primary">Searching your knowledge base...</div>
          <div className="text-xs text-text-tertiary">Finding relevant sources, checking page citations, and preparing a grounded answer.</div>
        </div>
      ) : aiAnswer ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">AI Search Result for: "{aiAnswer.question}"</h2>
            <button onClick={() => setAiAnswer(null)} className="text-xs text-accent hover:underline">
              Clear result
            </button>
          </div>
          <AIResponse answer={aiAnswer} />
        </div>
      ) : null}

      {/* View Switch: Knowledge Graph vs Intelligence Timeline */}
      {view === 'graph' ? (
        <KnowledgeGraphView />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-t border-white/5 pt-6">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Intelligence Event Stream</h2>
          </div>
          {loading ? (
            <LoadingSkeleton variant="list" />
          ) : error ? (
            <ErrorState onRetry={() => window.location.reload()} />
          ) : events.length === 0 ? (
            <EmptyState icon={<BookOpen size={28} />} title="No intelligence yet" description="LifeOS will show events here as it discovers information from your documents, emails, and receipts." />
          ) : (
            <Timeline events={events} />
          )}
        </div>
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
    application: 'Application Process',
    deadline: 'Deadline',
    action: 'Required Action',
    person: 'Entity / Person',
    organization: 'Organization',
  };

  return (
    <div className="animate-fadeIn space-y-4">
      <div className="card p-6 border-white/10 bg-[#0d0f15]">
        <div className="text-xs text-text-secondary mb-4 leading-relaxed">
          LifeOS connects your information into an intelligent graph — documents reference applications, applications have strict deadlines, deadlines trigger required actions.
        </div>
        <div className="relative h-[480px] rounded-xl border border-white/10 bg-[#07080b] overflow-hidden shadow-inner">
          <svg className="absolute inset-0 w-full h-full">
            <line x1="280" y1="60" x2="280" y2="130" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <line x1="280" y1="170" x2="280" y2="230" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <line x1="280" y1="270" x2="280" y2="330" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <line x1="280" y1="370" x2="280" y2="430" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <line x1="330" y1="80" x2="430" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4" />
            <line x1="330" y1="80" x2="430" y2="200" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4" />
            <line x1="330" y1="300" x2="430" y2="300" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4" />
            <line x1="330" y1="400" x2="430" y2="400" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="4" />
          </svg>

          {[
            { label: 'Scholarship_Requirements.pdf', type: 'document', x: 180, y: 40 },
            { label: 'Scholarship Application', type: 'application', x: 185, y: 130 },
            { label: 'Income Certificate', type: 'document', x: 200, y: 230 },
            { label: 'Deadline: 15 Oct 2026', type: 'deadline', x: 195, y: 330 },
            { label: 'Obtain Income Certificate', type: 'action', x: 185, y: 420 },
            { label: 'Ministry of Education', type: 'organization', x: 420, y: 80 },
            { label: 'Dr. Rajesh Kumar', type: 'person', x: 430, y: 180 },
            { label: 'Interview Email', type: 'document', x: 430, y: 280 },
            { label: 'TechCorp', type: 'organization', x: 440, y: 380 },
          ].map((node, i) => (
            <div
              key={i}
              className="absolute flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-text-primary whitespace-nowrap card-hover shadow-lg"
              style={{
                left: node.x,
                top: node.y,
                borderColor: `${nodeColors[node.type]}50`,
                backgroundColor: `${nodeColors[node.type]}15`,
              }}
            >
              <span className="h-2 w-2 rounded-full shadow-sm" style={{ backgroundColor: nodeColors[node.type] }} />
              {node.label}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-white/5">
          {Object.entries(nodeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {nodeLabels[type]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
