import { Link } from 'react-router-dom';
import { Sparkles, FileText, ArrowRight, ListChecks } from 'lucide-react';
import { SourceBadge } from '@/components/ui/Badge';
import type { AIAnswer } from '@/types';

export function AIResponse({ answer }: { answer: AIAnswer }) {
  return (
    <div className="space-y-4 animate-slideUp">
      <div className="card p-5 border-accent/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <Sparkles size={15} />
          </div>
          <span className="text-sm font-semibold text-text-primary">AI Answer</span>
        </div>
        <p className="text-sm text-text-primary leading-relaxed">{answer.answer}</p>
      </div>

      {answer.extractedInfo && answer.extractedInfo.length > 0 && (
        <div className="card p-5 border-blue-500/15">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <ListChecks size={15} />
            </div>
            <span className="text-sm font-semibold text-text-primary">Extracted Information</span>
          </div>
          <ul className="space-y-2">
            {answer.extractedInfo.map((info, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                {info}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-tertiary text-text-secondary">
            <FileText size={15} />
          </div>
          <span className="text-sm font-semibold text-text-primary">Source Evidence</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {answer.sources.map((src) => (
            <Link
              key={src.id}
              to={`/documents/${src.id}`}
              className="block"
            >
              <SourceBadge type={src.type} name={src.name} />
            </Link>
          ))}
        </div>
      </div>

      {answer.suggestedAction && (
        <Link
          to={answer.actionLink || '/actions'}
          className="card card-hover p-4 flex items-center gap-3 border-amber-500/20 group"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <ArrowRight size={16} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-amber-400 uppercase tracking-wider">Suggested Action</div>
            <div className="text-sm font-medium text-text-primary mt-0.5">{answer.suggestedAction}</div>
          </div>
          <ArrowRight size={16} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
        </Link>
      )}
    </div>
  );
}
