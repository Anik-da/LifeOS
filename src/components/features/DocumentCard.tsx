import { Link } from 'react-router-dom';
import { FileText, Image, Mail, Receipt, Award, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import type { Document, DocumentType } from '@/types';
import { CategoryBadge } from '@/components/ui/Badge';

const typeIcons: Record<DocumentType, React.ComponentType<{ size?: number }>> = {
  pdf: FileText,
  image: Image,
  receipt: Receipt,
  certificate: Award,
  email: Mail,
};

export function DocumentCard({ document: doc }: { document: Document }) {
  const Icon = typeIcons[doc.type] || FileText;

  return (
    <Link
      to={`/documents/${doc.id}`}
      className="card card-hover p-4 block animate-slideUp group relative overflow-hidden"
    >
      <div className="flex items-start gap-3.5">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold border border-white/10 shadow-md"
          style={{ backgroundColor: `${doc.thumbnailColor}20`, color: doc.thumbnailColor }}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h3 className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors truncate">
              {doc.name}
            </h3>
            <ArrowRight size={13} className="text-text-tertiary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <CategoryBadge category={doc.category} />
            <span className="text-[10px] font-mono text-text-tertiary">
              {new Date(doc.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {doc.extractedInfo?.isSyntheticDemo && (
              <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded uppercase">
                SYNTHETIC DEMO DATA
              </span>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
            {doc.actionCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-300">
                <AlertTriangle size={11} /> {doc.actionCount} action{doc.actionCount > 1 ? 's' : ''} detected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                <CheckCircle size={11} /> No actions needed
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
