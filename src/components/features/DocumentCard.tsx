import { Link } from 'react-router-dom';
import { FileText, Image, Mail, Receipt, Award, AlertTriangle, CheckCircle } from 'lucide-react';
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
      className="card card-hover p-4 block animate-slideUp"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${doc.thumbnailColor}15`, color: doc.thumbnailColor }}
        >
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-text-primary truncate">{doc.name}</div>
          <div className="flex items-center gap-2 mt-1.5">
            <CategoryBadge category={doc.category} />
            <span className="text-[11px] text-text-tertiary">
              {new Date(doc.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="mt-2.5">
            {doc.actionCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">
                <AlertTriangle size={12} /> {doc.actionCount} action{doc.actionCount > 1 ? 's' : ''} detected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                <CheckCircle size={12} /> No actions needed
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
