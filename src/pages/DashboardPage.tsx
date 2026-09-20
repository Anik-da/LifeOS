import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  BookOpen,
  GitBranch,
  RefreshCw,
  FileText,
  Globe,
  Upload,
  Loader2,
  Check,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '@/services/api';
import { MetricCard } from '@/components/features/MetricCard';
import { ActionCard } from '@/components/features/ActionCard';
import { Timeline } from '@/components/features/Timeline';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { YourWorldRealWorld } from '@/components/features/YourWorldRealWorld';
import type { Metric, Action, IntelligenceEvent, Document } from '@/types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [actionsList, setActionsList] = useState<Action[]>([]);
  const [events, setEvents] = useState<IntelligenceEvent[]>([]);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [queryInput, setQueryInput] = useState('');

  const fetchDashboardData = async () => {
    try {
      setError(false);
      const [m, a, e, d] = await Promise.all([
        api.dashboard.getMetrics(),
        api.dashboard.getActions(),
        api.dashboard.getRecentEvents(),
        api.documents.getAll(),
      ]);
      setMetrics(m);
      setActionsList(a);
      setEvents(e);
      setRecentDocs(d);
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCompleteAction = (id: string) => {
    api.actions.markComplete(id).then(() => {
      setActionsList((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'completed' as const } : a)));
      showToast('Action marked complete', 'success');
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      navigate(`/knowledge?q=${encodeURIComponent(queryInput.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <LoadingSkeleton variant="dashboard" />
      </div>
    );
  }

  // STATE D — ERROR
  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <ErrorState
          title="Could not load your LifeOS dashboard"
          message="We had trouble connecting to your backend infrastructure. Please check your credentials or retry."
          onRetry={fetchDashboardData}
        />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const pendingActions = actionsList.filter((a) => a.status !== 'completed');
  const urgentActions = pendingActions.slice(0, 4);

  const processingDocs = recentDocs.filter((d) => d.status === 'processing');
  const readyDocs = recentDocs.filter((d) => d.status === 'ready');

  const isEmpty = readyDocs.length === 0 && processingDocs.length === 0;
  const isProcessing = processingDocs.length > 0;

  const sampleSuggestions = [
    'What do I need to submit for this scholarship?',
    'Is this deadline still current?',
    'What skills am I missing for this job?',
    'Search official eligibility guidelines',
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">{greeting}</h1>
          <p className="text-xs text-text-secondary mt-1">
            {isEmpty
              ? 'Your personal intelligence layer is empty.'
              : 'Here is what needs your attention today in your connected intelligence system.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/documents" className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 font-semibold">
            <Upload size={14} /> Upload Document
          </Link>
          <Link to="/web-search" className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 font-semibold">
            <Globe size={14} /> Search World
          </Link>
        </div>
      </div>

      {/* STATE A — NEW USER EMPTY STATE */}
      {isEmpty && (
        <div className="space-y-6">
          {/* Main Empty Hero Box */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#111420] to-[#0a0c12] p-8 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent border border-accent/20 shadow-inner mx-auto">
              <BookOpen size={32} />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Your LifeOS is ready.</h2>
              <p className="text-sm text-text-secondary leading-relaxed font-medium">
                Upload your first document to begin.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to="/documents" className="btn-primary text-xs px-5 py-3 flex items-center gap-2 shadow-lg shadow-blue-600/30 font-semibold">
                <Upload size={16} /> Upload document
              </Link>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const doc = await api.documents.uploadSample();
                    showToast('Sample document processed via AWS pipeline!', 'success');
                    navigate(`/documents/${doc.id}`);
                  } catch {
                    showToast('Failed to process sample document', 'error');
                    setLoading(false);
                  }
                }}
                className="btn-secondary text-xs px-5 py-3 flex items-center gap-2 font-semibold border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              >
                <Sparkles size={16} className="text-amber-400" /> Try with sample document
              </button>
            </div>
          </div>

          {/* Hackathon Demo / Onboarding Flow Checklist */}
          <div className="card p-6 border-white/10 bg-[#0d0f15] space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-accent" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Get Started Flow</h3>
              </div>
              <span className="text-[10px] font-mono font-semibold text-accent bg-accent-soft px-2 py-0.5 rounded border border-accent/20">
                Hackathon Verification Step
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[
                { step: '1', title: 'Upload a real document', desc: 'PDF, receipt, notice, or resume via S3 & Textract.' },
                { step: '2', title: 'Wait for processing', desc: 'Watch Step Functions & Bedrock AI extract structure.' },
                { step: '3', title: 'Ask LifeOS a question', desc: 'Query grounded answers with page-level citations.' },
                { step: '4', title: 'Search public information', desc: 'Retrieve live trusted web domain results.' },
                { step: '5', title: 'Compare private & public', desc: 'Spot changes, conflicts, and updated deadlines.' },
                { step: '6', title: 'Create an action', desc: 'Track actionable tasks in Action Center.' },
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl border border-white/5 bg-white/5 p-3.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-[10px]">
                      {item.step}
                    </span>
                    <span className="font-semibold text-text-primary">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-text-tertiary leading-relaxed pl-7">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STATE B — PROCESSING PIPELINE STATUS */}
      {isProcessing && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 space-y-4 animate-slideUp">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <Loader2 size={20} className="animate-spin text-blue-400" />
              <div>
                <div className="text-sm font-bold text-white">Document Processing Pipeline Active</div>
                <div className="text-xs text-blue-200/80">
                  Processing <span className="font-semibold">{processingDocs[0]?.name}</span> through AWS Step Functions & Textract
                </div>
              </div>
            </div>
            <button onClick={fetchDashboardData} className="text-xs text-blue-400 hover:underline font-semibold">
              Refresh Status
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            {[
              { label: 'Uploading', done: true },
              { label: 'Stored (S3)', done: true },
              { label: 'Extracting (Textract)', active: true },
              { label: 'Understanding (Bedrock)', pending: true },
              { label: 'Indexing (DynamoDB)', pending: true },
              { label: 'Ready', pending: true },
            ].map((stage, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-black/40 p-2.5 space-y-1">
                <div className="flex items-center justify-center">
                  {stage.done && <Check size={14} className="text-emerald-400" />}
                  {stage.active && <Loader2 size={14} className="animate-spin text-amber-400" />}
                  {stage.pending && <span className="text-[10px] text-text-tertiary">○</span>}
                </div>
                <div className="text-[11px] font-medium text-text-secondary">{stage.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATE C — ACTIVE DASHBOARD (When Ready Documents Exist) */}
      {!isEmpty && (
        <>
          {/* ASK LIFEOS SEARCH */}
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#11141f] to-[#0a0c12] p-5 sm:p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              <Sparkles size={14} /> Ask LifeOS Intelligence
            </div>
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight mb-4">
              What do you want to find or understand?
            </h2>

            <form onSubmit={handleSearchSubmit} className="relative mb-4">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
              <input
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask anything about your documents, deadlines, changes, or career..."
                className="w-full pl-11 pr-28 py-3.5 rounded-xl bg-[#161924] border border-white/10 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1"
              >
                Search <ArrowRight size={13} />
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium text-text-tertiary">Try asking:</span>
              {sampleSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/knowledge?q=${encodeURIComponent(s)}`)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all text-left truncate max-w-xs"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>

          {/* Signature Visual Component: YOUR WORLD ↔ REAL WORLD */}
          <YourWorldRealWorld
            privateSources={recentDocs.slice(0, 2).map((d) => ({
              id: d.id,
              name: d.name,
              type: d.type,
              page: `Page 1 (${d.name.includes('demo') ? 'Synthetic demo' : 'Grounded'})`,
            }))}
            publicSources={[
              {
                title: 'Official Portal Guidelines & Eligibility',
                url: 'https://scholarships.gov.in',
                domain: 'scholarships.gov.in',
                sourceType: 'Government',
                retrievedAt: 'Sep 20, 2026',
              },
            ]}
            connectedInsight={
              readyDocs.length > 0
                ? `LifeOS actively correlates your uploaded document (${readyDocs[0].name}) with real-world official guidelines.`
                : 'Upload a document or ask LifeOS to generate real-time connected intelligence.'
            }
            suggestedAction="Ask LifeOS grounded questions"
            actionLink="/knowledge"
          />

          {/* Attention Required Panel */}
          {pendingActions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Attention Required</h2>
                </div>
                <Link to="/actions" className="text-xs text-accent hover:text-accent-hover font-semibold flex items-center gap-1">
                  Action Center ({pendingActions.length}) <ArrowRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {urgentActions.map((action) => (
                  <ActionCard key={action.id} action={action} onComplete={handleCompleteAction} compact />
                ))}
              </div>
            </div>
          )}

          {/* Overview Metrics Bar */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Intelligence Stats</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {metrics.map((m) => (
                <MetricCard key={m.id} metric={m} />
              ))}
            </div>
          </div>

          {/* Bottom Grid: Recent Intelligence Timeline & Recent Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-text-tertiary" /> Recent Intelligence Stream
                </h2>
                <Link to="/knowledge" className="text-xs text-accent hover:text-accent-hover font-semibold flex items-center gap-1">
                  View all <ArrowRight size={13} />
                </Link>
              </div>
              <Timeline events={events.slice(0, 5)} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} className="text-text-tertiary" /> Indexed Documents
                </h2>
                <Link to="/documents" className="text-xs text-accent hover:text-accent-hover font-semibold">
                  All ({recentDocs.length})
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentDocs.slice(0, 4).map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/documents/${doc.id}`}
                    className="card card-hover flex items-center gap-3 p-3 text-left group"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white font-bold text-xs"
                      style={{ backgroundColor: doc.thumbnailColor || '#3b82f6' }}
                    >
                      {doc.type.toUpperCase().substring(0, 3)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-text-primary group-hover:text-accent transition-colors">
                        {doc.name}
                      </div>
                      <div className="text-[10px] text-text-tertiary mt-0.5 capitalize">
                        {doc.category} • {doc.dateAdded}
                      </div>
                    </div>
                    {doc.actionCount > 0 && (
                      <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {doc.actionCount} action{doc.actionCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
