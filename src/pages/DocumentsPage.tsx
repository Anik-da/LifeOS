import { useState, useEffect } from 'react';
import { FileText, Search, Plus, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DocumentCard } from '@/components/features/DocumentCard';
import { UploadArea } from '@/components/features/UploadArea';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import type { Document, DocumentType } from '@/types';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'image', label: 'Images' },
  { id: 'receipt', label: 'Receipts' },
  { id: 'certificate', label: 'Certificates' },
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

  useEffect(() => {
    api.documents.getAll()
      .then((d) => { setDocuments(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const handleUpload = (file: { name: string; type: string }) => {
    setUploading(true);
    api.documents.upload(file)
      .then((doc) => {
        setDocuments((prev) => [doc, ...prev]);
        setUploadOpen(false);
        showToast('Document uploaded — extracting information...', 'success');
      })
      .catch(() => {
        showToast('Upload failed. Please try again.', 'error');
      })
      .finally(() => setUploading(false));
  };

  const filtered = documents.filter((d) => {
    const matchesFilter = activeFilter === 'all' || d.type === activeFilter;
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.category.includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <PageHeader title="Documents" subtitle="Your information, organized and analyzed by LifeOS.">
        <button
          onClick={() => setUploadOpen(true)}
          className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
        >
          <Plus size={14} /> Add information
        </button>
      </PageHeader>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="input-field w-full pl-10 pr-3 py-2.5 text-sm"
        />
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === f.id
                ? 'bg-accent-soft text-accent border border-accent/20'
                : 'border border-border text-text-secondary hover:border-border-hover hover:text-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => <LoadingSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title="No documents yet"
          description="Upload your first document to begin building your personal knowledge system. LifeOS will extract what matters."
          action={
            <button onClick={() => setUploadOpen(true)} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
              <Plus size={15} /> Add information
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((doc) => <DocumentCard key={doc.id} document={doc} />)}
        </div>
      )}

      <Modal open={uploadOpen} onClose={() => !uploading && setUploadOpen(false)} title="Add information">
        {uploading ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <Loader2 size={32} className="animate-spin text-accent" />
            <div className="text-sm text-text-secondary">Uploading and analyzing your document...</div>
            <div className="text-xs text-text-tertiary">LifeOS is extracting key information, dates, and actions</div>
          </div>
        ) : (
          <UploadArea onUpload={handleUpload} />
        )}
      </Modal>
    </div>
  );
}
