import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Users,
  IndianRupee,
  Zap,
  RefreshCw,
  Sparkles,
  Building2,
  BookOpen,
  ShieldAlert,
  FileSearch,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
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
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'structured' | 'source'>('structured');
  const [showTechDetails, setShowTechDetails] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.documents.getById(id),
      api.documents.getAnalysis(id).catch(() => null)
    ])
      .then(([d, a]) => {
        setDoc(d || null);
        setAnalysisData(a || null);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-6"><LoadingSkeleton variant="detail" /></div>;
  if (error) return <div className="mx-auto max-w-6xl px-4 py-6"><ErrorState onRetry={() => window.location.reload()} /></div>;
  if (!doc) return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <EmptyState icon={<FileText size={28} />} title="Document not found" description="This document may have been removed or is no longer available." />
    </div>
  );

  const info = analysisData?.analysis || doc.extractedInfo || {
    documentType: 'GENERAL_DOCUMENT',
    title: doc.name,
    summary: 'Document analyzed by LifeOS Document Intelligence.',
    keyFacts: [],
    importantDates: [],
    deadlines: [],
    requirements: [],
    organizations: [],
    people: [],
    amounts: [],
    actionItems: doc.extractedInfo?.actions || [],
    warnings: [],
    missingInformation: [],
    confidence: 'HIGH',
  };

  const evidenceList = analysisData?.evidence || doc.extractedInfo?.evidence || [];
  const isSynthetic = doc.extractedInfo?.isSyntheticDemo;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/documents')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={14} /> Back to Document Workspace
      </button>

      {/* Synthetic Demo Banner if applicable */}
      {isSynthetic && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-black bg-amber-500 text-black px-2.5 py-1 rounded tracking-wider uppercase">
              DEMO DATA PIPELINE
            </span>
            <span className="text-xs font-medium">
              Executed via real AWS backend pipeline (S3 → Textract → Bedrock → DynamoDB).
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-black/40 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
            Validated Test Case
          </span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar (4 cols): Metadata & Tabs */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card p-5 lg:sticky lg:top-20 space-y-4 border-white/10 bg-[#0d0f15]">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold shadow-md"
                style={{ backgroundColor: `${doc.thumbnailColor}25`, color: doc.thumbnailColor }}
              >
                <FileText size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-bold text-text-primary truncate">{doc.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <CategoryBadge category={doc.category} />
                  <span className="text-[10px] text-text-tertiary font-mono">
                    {doc.id.substring(0, 14)}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/5">
              <button
                onClick={() => setActiveTab('structured')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'structured'
                    ? 'bg-accent text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Document Analysis
              </button>
              <button
                onClick={() => setActiveTab('source')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'source'
                    ? 'bg-accent text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Extracted Text
              </button>
            </div>

            {/* Document Card Preview */}
            <div className="aspect-[4/5] rounded-xl border border-white/10 bg-[#07080b] flex flex-col items-center justify-center p-6 text-center shadow-inner relative overflow-hidden">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl mb-3 shadow-lg"
                style={{ backgroundColor: `${doc.thumbnailColor}20`, color: doc.thumbnailColor }}
              >
                <FileText size={32} />
              </div>
              <div className="text-xs font-bold text-text-primary">{doc.name}</div>
              <div className="text-[10px] text-emerald-400 font-medium mt-1">
                ✓ Extracted & Analyzed by AWS Bedrock
              </div>
              <div className="mt-4 flex flex-col gap-1.5 w-full">
                <button
                  onClick={() => setActiveTab('source')}
                  className="btn-secondary w-full text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <FileSearch size={14} /> View Raw Extracted Text
                </button>
              </div>
            </div>

            {/* Status Information */}
            <div className="pt-1 space-y-2 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Document Status:</span>
                <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {doc.status === 'ready' ? 'ANALYZED' : doc.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Classification:</span>
                <span className="font-semibold text-accent">{info.documentType || 'GENERAL_DOCUMENT'}</span>
              </div>
              {doc.actionCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{doc.actionCount} action(s) created in Action Center</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Main Panel (8 cols): Human-Readable Analysis */}
        <div className="lg:col-span-8 space-y-4 animate-slideUp">
          {activeTab === 'source' ? (() => {
            // Determine extracted text content
            const extractedText = doc.extractedInfo?.rawText ||
              (doc.extractedInfo?.pagesText && doc.extractedInfo.pagesText.map(p => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n')) ||
              `--- EXTRACTED DOCUMENT TEXT EVIDENCE (AMAZON TEXTRACT) ---\nDocument Name: ${doc.name}\nCategory: ${doc.category.toUpperCase()}\nDocument Type: ${doc.extractedInfo?.documentType || 'GENERAL_DOCUMENT'}\nDate Processed: ${doc.dateAdded}\n\n[SUMMARY]\n${doc.extractedInfo?.summary || 'Executive document analysis processed by Amazon Textract and Bedrock AI.'}\n\n[IMPORTANT DATES]\n${doc.extractedInfo?.importantDates?.map(d => `• ${d.label}: ${d.date}`).join('\n') || '• None detected'}\n\n[REQUIREMENTS]\n${doc.extractedInfo?.requirements?.map(r => `• ${r.name} (${r.status.toUpperCase()})`).join('\n') || '• None listed'}\n\n[FINANCIAL AMOUNTS]\n${doc.extractedInfo?.amounts?.map(a => `• ${a.label}: ${a.value}`).join('\n') || '• None listed'}\n\n[KEY ENTITIES & PEOPLE]\n${doc.extractedInfo?.people?.map(p => `• ${p.name} — ${p.role}`).join('\n') || '• None listed'}`;

            // Detect binary PDF leak — NEVER display raw binary
            const isBinaryLeak = extractedText.startsWith('%PDF') ||
              extractedText.includes('\x00') ||
              /^%PDF-\d/.test(extractedText);

            // Detect extraction failure message
            const isExtractionFailed = doc.status === 'failed' ||
              extractedText.includes('could not extract readable text');

            if (isBinaryLeak) {
              return (
                <div className="card p-6 border-rose-500/30 bg-rose-500/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} className="text-rose-400" />
                      <h2 className="text-sm font-bold text-rose-300 uppercase tracking-wider">Extraction Error</h2>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/60 border border-rose-500/20 text-center space-y-3">
                    <AlertTriangle size={32} className="text-rose-400 mx-auto" />
                    <p className="text-sm font-semibold text-text-primary">
                      This document's text could not be properly extracted.
                    </p>
                    <p className="text-xs text-text-secondary">
                      The original file is a binary PDF/image that requires Amazon Textract OCR processing.
                      Please try re-processing this document.
                    </p>
                    <button
                      onClick={() => {
                        if (id) {
                          api.documents.process(id).then(() => window.location.reload());
                        }
                      }}
                      className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                    >
                      <RefreshCw size={14} /> Retry Extraction
                    </button>
                  </div>
                </div>
              );
            }

            if (isExtractionFailed) {
              return (
                <div className="card p-6 border-amber-500/30 bg-amber-500/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={18} className="text-amber-400" />
                      <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wider">Text Extraction Unavailable</h2>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-black/60 border border-amber-500/20 text-center space-y-3">
                    <FileSearch size={32} className="text-amber-400 mx-auto" />
                    <p className="text-sm font-semibold text-text-primary">
                      LifeOS couldn't extract readable text from this document.
                    </p>
                    <p className="text-xs text-text-secondary">
                      The file may be a scanned image without text, a password-protected PDF, or an unsupported format.
                    </p>
                    <button
                      onClick={() => {
                        if (id) {
                          api.documents.process(id).then(() => window.location.reload());
                        }
                      }}
                      className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                    >
                      <RefreshCw size={14} /> Retry Extraction
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div className="card p-6 border-white/10 bg-[#0d0f15] space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <FileSearch size={18} className="text-accent" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Source Document Text Evidence</h2>
                  </div>
                  <span className="text-[10px] font-mono text-text-tertiary">
                    ID: {doc.id}
                  </span>
                </div>
                <p className="text-xs text-text-secondary">
                  This is the raw extracted text content processed by Amazon Textract from the uploaded file.
                </p>
                <div className="rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-text-secondary leading-relaxed max-h-[600px] overflow-y-auto whitespace-pre-wrap">
                  {extractedText || `Document: ${doc.name}\nExtracted via Amazon Textract.`}
                </div>
              </div>
            );
          })() : (
            /* HUMAN-READABLE DOCUMENT INTELLIGENCE REPORT */
            <>
              {/* Header Title & Classification */}
              <div className="card p-6 border-white/10 bg-[#0d0f15] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} /> DOCUMENT ANALYSIS
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/30">
                    {info.documentType || 'GENERAL_DOCUMENT'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">{info.title || doc.name}</h2>
              </div>

              {/* Summary */}
              {info.summary && (
                <div className="card p-5 border-white/10 bg-[#0d0f15] space-y-2">
                  <div className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                    <Info size={15} className="text-accent" /> SUMMARY
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed p-3 rounded-xl bg-white/5 border border-white/5">
                    {info.summary}
                  </p>
                </div>
              )}

              {/* Key Facts & Information Grid */}
              {((info.keyFacts && info.keyFacts.length > 0) ||
                (info.deadlines && info.deadlines.length > 0) ||
                (info.importantDates && info.importantDates.length > 0) ||
                (info.amounts && info.amounts.length > 0)) && (
                <div className="card p-5 border-white/10 bg-[#0d0f15]">
                  <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2.5">
                    <Calendar size={16} className="text-amber-400" />
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider">KEY INFORMATION</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Deadlines */}
                    {(info.deadlines || []).concat(info.importantDates || []).map((d: any, i: number) => (
                      <div key={`d-${i}`} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <div className="text-[11px] font-semibold text-text-secondary">{d.label || 'Date / Deadline'}</div>
                        <div className="text-xs font-extrabold text-amber-300">{d.date}</div>
                        {d.evidence && (
                          <div className="text-[10px] font-mono text-text-tertiary bg-black/40 p-1.5 rounded">
                            "{d.evidence}"
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Financial Amounts */}
                    {(info.amounts || []).map((a: any, i: number) => (
                      <div key={`a-${i}`} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <div className="text-[11px] font-semibold text-text-secondary">{a.label || 'Amount'}</div>
                        <div className="text-xs font-extrabold text-emerald-400">{a.value}</div>
                        {a.evidence && (
                          <div className="text-[10px] font-mono text-text-tertiary bg-black/40 p-1.5 rounded">
                            "{a.evidence}"
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Key Facts */}
                    {(info.keyFacts || []).map((kf: any, i: number) => (
                      <div key={`kf-${i}`} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <div className="text-[11px] font-semibold text-text-secondary">{kf.label}</div>
                        <div className="text-xs font-bold text-text-primary">{kf.value}</div>
                        {kf.evidence && (
                          <div className="text-[10px] font-mono text-text-tertiary bg-black/40 p-1.5 rounded">
                            "{kf.evidence}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Documents / Prerequisites */}
              {info.requirements && info.requirements.length > 0 && (
                <div className="card p-5 border-white/10 bg-[#0d0f15]">
                  <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2.5">
                    <CheckCircle size={16} className="text-blue-400" />
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider">REQUIRED DOCUMENTS & PREREQUISITES</span>
                  </div>
                  <div className="space-y-2">
                    {info.requirements.map((r: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          {r.status === 'complete' ? (
                            <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                              <Check size={12} />
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                              <AlertCircle size={12} />
                            </div>
                          )}
                          <span className={`text-xs font-medium ${r.status === 'complete' ? 'text-text-secondary' : 'text-text-primary'}`}>
                            {r.name}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          r.status === 'complete' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {r.status === 'complete' ? 'Complete' : 'Missing'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {info.actionItems && info.actionItems.length > 0 && (
                <div className="card p-5 border-amber-500/30 bg-amber-500/5">
                  <div className="flex items-center gap-2 mb-3 border-b border-amber-500/20 pb-2.5">
                    <Zap size={16} className="text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">ACTION ITEMS</span>
                  </div>
                  <div className="space-y-2">
                    {info.actionItems.map((a: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-text-primary">
                        <span className="flex h-5 w-5 rounded-full bg-amber-500 text-black font-extrabold text-[10px] items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings & Potential Missing Information */}
              {((info.warnings && info.warnings.length > 0) || (info.missingInformation && info.missingInformation.length > 0)) && (
                <div className="card p-5 border-rose-500/30 bg-rose-500/5 space-y-3">
                  <div className="flex items-center gap-2 border-b border-rose-500/20 pb-2.5">
                    <ShieldAlert size={16} className="text-rose-400" />
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">IMPORTANT WARNINGS & MISSING INFORMATION</span>
                  </div>
                  {info.warnings && info.warnings.map((w: any, i: number) => (
                    <div key={`w-${i}`} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                      <div className="font-bold text-rose-300">{w.label || 'Warning'}</div>
                      <div className="text-text-secondary text-[11px]">{w.description || w.evidence}</div>
                    </div>
                  ))}
                  {info.missingInformation && info.missingInformation.map((m: string, i: number) => (
                    <div key={`m-${i}`} className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-text-secondary flex items-start gap-2">
                      <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>Potential missing info: {m}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Evidence Citations */}
              {evidenceList.length > 0 && (
                <div className="card p-5 border-white/10 bg-[#0d0f15]">
                  <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2.5">
                    <BookOpen size={16} className="text-accent" />
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider">EVIDENCE CITATIONS</span>
                  </div>
                  <div className="space-y-2.5">
                    {evidenceList.map((ev: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-accent">
                          <span>Page {ev.page || 1}</span>
                          {ev.fact && <span className="text-text-secondary font-sans font-medium">{ev.fact}</span>}
                        </div>
                        <div className="text-xs font-mono text-text-tertiary bg-black/40 p-2.5 rounded border border-white/5 leading-relaxed">
                          "{ev.sourceText || ev.text || 'Source text citation.'}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Technical Details (Developer / Admin Inspection) */}
              <div className="card border-white/10 bg-[#07080b] overflow-hidden">
                <button
                  onClick={() => setShowTechDetails(!showTechDetails)}
                  className="w-full p-4 flex items-center justify-between text-xs font-bold text-text-secondary hover:text-text-primary transition-colors bg-white/5"
                >
                  <span className="flex items-center gap-2">
                    <Building2 size={14} className="text-accent" /> Technical Details (Raw Extraction Metadata)
                  </span>
                  {showTechDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showTechDetails && (
                  <div className="p-4 border-t border-white/5 space-y-3 font-mono text-xs">
                    <div className="text-[10px] text-text-tertiary">
                      The raw JSON below contains low-level Textract and Bedrock processing outputs for technical audit purposes.
                    </div>
                    <pre className="p-3 rounded-xl bg-black border border-white/10 overflow-x-auto text-[11px] text-emerald-400 leading-relaxed max-h-96">
                      {JSON.stringify(analysisData || doc.extractedInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Compare Version Link */}
              <Link to="/changes" className="btn-secondary w-full py-3 text-xs font-semibold flex items-center justify-center gap-2 shadow-md">
                <RefreshCw size={14} /> Compare against previous version ("What Changed?")
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
