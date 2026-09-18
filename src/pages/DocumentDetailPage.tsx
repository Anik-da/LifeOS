import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, CheckCircle, AlertTriangle, Users, IndianRupee, Zap, Link2, RefreshCw } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import { api } from '@/services/api';
import type { Document } from '@/types';

export function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [doc, setDoc] = useState<Document | null>(null);

  useEffect(() => {
    api.documents.getById(id!)
      .then((d) => { setDoc(d || null); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [id]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-6"><LoadingSkeleton variant="detail" /></div>;
  if (error) return <div className="mx-auto max-w-5xl px-4 py-6"><ErrorState onRetry={() => window.location.reload()} /></div>;
  if (!doc) return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <EmptyState icon={<FileText size={28} />} title="Document not found" description="This document may have been removed or is no longer available." />
    </div>
  );

  const info = doc.extractedInfo;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <button
        onClick={() => navigate('/documents')}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
      >
        <ArrowLeft size={15} /> Back to documents
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Document preview */}
        <div className="card p-6 lg:sticky lg:top-20 h-fit animate-fadeIn">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${doc.thumbnailColor}15`, color: doc.thumbnailColor }}
            >
              <FileText size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-semibold text-text-primary truncate">{doc.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <CategoryBadge category={doc.category} />
                <span className="text-xs text-text-tertiary">
                  Added {new Date(doc.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="aspect-[3/4] rounded-xl border border-border bg-bg-primary flex items-center justify-center overflow-hidden">
            <div className="text-center p-8">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
                style={{ backgroundColor: `${doc.thumbnailColor}15`, color: doc.thumbnailColor }}
              >
                <FileText size={32} />
              </div>
              <div className="text-sm font-medium text-text-secondary">Document preview</div>
              <div className="text-xs text-text-tertiary mt-1">Full preview available after processing</div>
            </div>
          </div>

          <div className="mt-4">
            {doc.actionCount > 0 ? (
              <StatusBadge priority="warning">{doc.actionCount} actions detected</StatusBadge>
            ) : (
              <StatusBadge priority="success">No actions needed</StatusBadge>
            )}
          </div>
        </div>

        {/* Right: AI extracted information */}
        <div className="space-y-4 animate-slideUp">
          {info ? (
            <>
              <div className="card p-5">
                <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Document type</div>
                <div className="text-sm font-medium text-text-primary">{info.documentType}</div>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={15} className="text-text-tertiary" />
                  <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Important dates</span>
                </div>
                <div className="space-y-3">
                  {info.importantDates.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{d.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{d.date}</span>
                        {d.priority && <StatusBadge priority={d.priority}>{d.priority === 'urgent' ? 'Urgent' : 'Info'}</StatusBadge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={15} className="text-text-tertiary" />
                  <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Required documents</span>
                </div>
                <div className="space-y-2.5">
                  {info.requirements.map((r, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      {r.status === 'complete' ? (
                        <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                      )}
                      <span className={`text-sm ${r.status === 'complete' ? 'text-text-secondary' : 'text-text-primary font-medium'}`}>
                        {r.name}
                      </span>
                      {r.status === 'missing' && <span className="text-xs text-amber-400">Missing</span>}
                    </div>
                  ))}
                </div>
              </div>

              {info.people.length > 0 && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={15} className="text-text-tertiary" />
                    <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">People & organizations</span>
                  </div>
                  <div className="space-y-2">
                    {info.people.map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-text-primary">{p.name}</span>
                        <span className="text-xs text-text-tertiary">{p.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {info.amounts.length > 0 && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <IndianRupee size={15} className="text-text-tertiary" />
                    <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Amounts</span>
                  </div>
                  <div className="space-y-2">
                    {info.amounts.map((a, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">{a.label}</span>
                        <span className="text-sm font-medium text-text-primary">{a.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {info.actions.length > 0 && (
                <div className="card p-5 border-amber-500/15">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={15} className="text-amber-400" />
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Actions</span>
                  </div>
                  <div className="space-y-2">
                    {info.actions.map((a, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {info.relatedDocuments.length > 0 && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Link2 size={15} className="text-text-tertiary" />
                    <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Related information</span>
                  </div>
                  <div className="space-y-2">
                    {info.relatedDocuments.map((r, i) => (
                      <Link key={i} to={`/documents/${r.id}`} className="flex items-center gap-2.5 text-sm text-accent hover:text-accent-hover">
                        <FileText size={14} />
                        {r.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <Link to="/changes" className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2">
                <RefreshCw size={14} /> View changes
              </Link>
            </>
          ) : (
            <div className="card p-6">
              <div className="text-sm text-text-secondary mb-3">AI extraction is in progress for this document.</div>
              <div className="space-y-2">
                <LoadingSkeleton variant="text" />
                <LoadingSkeleton variant="text" />
                <LoadingSkeleton variant="text" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
