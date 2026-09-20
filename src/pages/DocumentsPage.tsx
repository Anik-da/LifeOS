import { useState, useEffect } from 'react';
import { FileText, Search, Plus, Loader2, CheckCircle2, Sparkles, Network, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DocumentCard } from '@/components/features/DocumentCard';
import { UploadArea } from '@/components/features/UploadArea';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import type { Document } from '@/types';

const filters = [
  { id: 'all', label: 'All Intelligence' },
  { id: 'education', label: 'Education' },
  { id: 'finance', label: 'Finance' },
  { id: 'career', label: 'Career' },
  { id: 'legal', label: 'Legal' },
  { id: 'personal', label: 'Personal' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'receipt', label: 'Receipts' },
  { id: 'email', label: 'Emails' },
] as const;

export function DocumentsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);

  const pipelineSteps = [
    { label: 'Uploading file to secure S3 storage', sub: 'Direct pre-signed binary transfer' },
    { label: 'Extracting text & page structures with Amazon Textract', sub: 'Preserving page-level citations' },
    { label: 'Analyzing document intelligence with Amazon Bedrock', sub: 'Extracting dates, requirements & actions' },
    { label: 'Connecting relationships & updating knowledge graph', sub: 'Linking actions and workflow stages' },
    { label: 'Intelligence ready', sub: 'Information indexed in DynamoDB' },
  ];

  useEffect(() => {
    api.documents.getAll()
      .then((d) => { setDocuments(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const handleUpload = (file: { name: string; type: string; fileObj?: File }) => {
    setUploading(true);
    setPipelineStep(0);
    const stepInterval = setInterval(() => {
      setPipelineStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 600);

    api.documents.upload(file)
      .then((doc) => {
        clearInterval(stepInterval);
        setPipelineStep(4);
        setTimeout(() => {
          setDocuments((prev) => [doc, ...prev]);
          setUploadOpen(false);
          setUploading(false);
          showToast(`Extracted intelligence from ${doc.name}`, 'success');
        }, 800);
      })
      .catch(() => {
        clearInterval(stepInterval);
        setUploading(false);
        showToast('Upload failed. Please try again.', 'error');
      });
  };

  const handleLoadDemoPackage = () => {
    setUploading(true);
    setPipelineStep(0);
    const stepInterval = setInterval(() => {
      setPipelineStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 800);

    api.documents.loadDemoPackage()
      .then((docs) => {
        clearInterval(stepInterval);
        setPipelineStep(4);
        setTimeout(() => {
          setDocuments(docs);
          setUploadOpen(false);
          setUploading(false);
          showToast('Loaded 6 synthetic demo documents through real AI pipeline!', 'success');
        }, 800);
      })
      .catch(() => {
        clearInterval(stepInterval);
        setUploading(false);
        showToast('Demo package loading error', 'error');
      });
  };

  const filtered = documents.filter((d) => {
    const matchesFilter =
      activeFilter === 'all' || d.type === activeFilter || d.category === activeFilter;
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.category.includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      <PageHeader
        title="Document Intelligence"
        subtitle="Upload and manage your documents, notices, receipts, and emails. LifeOS extracts what matters."
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setUploadOpen(true)}
            className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-lg"
          >
            <Plus size={15} /> Upload document
          </button>
          <button
            onClick={handleLoadDemoPackage}
            className="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 text-accent border border-accent/20 bg-accent-soft hover:bg-accent/20 transition-all shadow-md"
          >
            <Sparkles size={14} /> Load Demo Package (6 Docs)
          </button>
        </div>
      </PageHeader>

      {/* Search & Category Filter Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents or categories..."
            className="input-field w-full pl-10 pr-3 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                activeFilter === f.id
                  ? 'bg-accent-soft text-accent border border-accent/30 font-semibold'
                  : 'border border-white/5 bg-white/5 text-text-secondary hover:border-white/20 hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => <LoadingSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={32} />}
          title="Your LifeOS is ready."
          description="Upload your first document to begin."
          action={
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
              <button onClick={() => setUploadOpen(true)} className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-2">
                <Plus size={15} /> Upload document
              </button>
              <button
                onClick={async () => {
                  setUploading(true);
                  try {
                    const doc = await api.documents.uploadSample();
                    setDocuments((prev) => [doc, ...prev]);
                    setUploading(false);
                    showToast(`Extracted intelligence from sample document ${doc.name}`, 'success');
                  } catch {
                    setUploading(false);
                    showToast('Sample upload failed', 'error');
                  }
                }}
                className="btn-secondary px-4 py-2 text-xs font-semibold flex items-center gap-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              >
                <Sparkles size={15} className="text-amber-400" /> Try with sample document
              </button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}

      {/* Polished Multi-Step Upload Pipeline Modal */}
      <Modal open={uploadOpen} onClose={() => !uploading && setUploadOpen(false)} title="Add Information to LifeOS">
        {uploading ? (
          <div className="py-6 px-2 space-y-6">
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent border border-accent/20 animate-pulse">
                <Sparkles size={24} />
              </div>
              <div className="text-sm font-bold text-text-primary">Processing Document Intelligence Pipeline</div>
              <div className="text-xs text-text-tertiary">Real-time AWS serverless extraction & Bedrock analysis</div>
            </div>

            {/* Stepper Pipeline */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              {pipelineSteps.map((step, idx) => {
                const isDone = idx < pipelineStep;
                const isCurrent = idx === pipelineStep;
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : isCurrent
                        ? 'bg-accent-soft border-accent/30 text-accent animate-pulse-soft'
                        : 'bg-white/5 border-white/5 text-text-tertiary opacity-40'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      ) : isCurrent ? (
                        <Loader2 size={16} className="animate-spin text-accent" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{step.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{step.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <UploadArea onUpload={handleUpload} />
        )}
      </Modal>
    </div>
  );
}
