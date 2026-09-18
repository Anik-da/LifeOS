import type { Priority, DocumentType } from '@/types';

export function StatusBadge({ priority, children }: { priority: Priority; children: React.ReactNode }) {
  const styles: Record<Priority, string> = {
    urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  const dot: Record<Priority, string> = {
    urgent: 'bg-red-400',
    warning: 'bg-amber-400',
    info: 'bg-blue-400',
    success: 'bg-emerald-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[priority]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[priority]}`} />
      {children}
    </span>
  );
}

export function SourceBadge({ type, name }: { type: DocumentType; name: string }) {
  const icons: Record<DocumentType, string> = {
    pdf: 'PDF',
    image: 'IMG',
    receipt: 'REC',
    certificate: 'CRT',
    email: 'EML',
  };
  const colors: Record<DocumentType, string> = {
    pdf: 'bg-red-500/10 text-red-400 border-red-500/20',
    image: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    receipt: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    certificate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    email: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${colors[type]}`}>
      <span className="font-mono text-[10px] font-bold opacity-70">{icons[type]}</span>
      {name}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const labels: Record<string, string> = {
    education: 'Education',
    finance: 'Finance',
    career: 'Career',
    legal: 'Legal',
    medical: 'Medical',
    personal: 'Personal',
  };
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-bg-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary">
      {labels[category] || category}
    </span>
  );
}
