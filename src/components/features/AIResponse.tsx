import { Link } from 'react-router-dom';
import { Sparkles, FileText, ArrowRight, ListChecks, HelpCircle, CheckCircle } from 'lucide-react';
import { SourceBadge } from '@/components/ui/Badge';
import { YourWorldRealWorld } from '@/components/features/YourWorldRealWorld';
import type { AIAnswer } from '@/types';

export function AIResponse({ answer }: { answer: AIAnswer }) {
  const isInsufficient = !answer.sources || answer.sources.length === 0;
  const whyList = answer.why || answer.extractedInfo || [];

  return (
    <div className="space-y-5 animate-slideUp">
      {/* 1. Direct Grounded Answer */}
      <div className="card p-5 sm:p-6 border-accent/30 bg-gradient-to-br from-[#0e121a] to-[#0a0c12]">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent shadow-md shadow-accent/20">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-accent uppercase tracking-wider">LifeOS Grounded Answer</div>
              <div className="text-[10px] text-text-tertiary">Verified against your connected intelligence system</div>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Source Grounded
          </span>
        </div>

        <p className="text-sm font-medium text-text-primary leading-relaxed">
          {answer.answer}
        </p>
      </div>

      {/* 2. Signature Visual Component: YOUR WORLD ↔ REAL WORLD */}
      <YourWorldRealWorld
        privateSources={answer.sources}
        publicSources={answer.publicSources}
        connectedInsight={answer.connectedInsight}
        suggestedAction={answer.suggestedAction}
        actionLink={answer.actionLink}
      />

      {/* 3. Extracted Facts / Reasoning Evidence */}
      {whyList.length > 0 && (
        <div className="card p-5 border-white/10 bg-[#0d0f15]">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <ListChecks size={15} />
            </div>
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Why / Extracted Evidence</span>
          </div>
          <ul className="space-y-2">
            {whyList.map((info, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-text-secondary">
                <CheckCircle size={14} className="mt-0.5 text-blue-400 shrink-0" />
                <span className="leading-relaxed">{info}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Private Source Citations */}
      <div className="card p-5 border-white/10 bg-[#0d0f15]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-text-tertiary">
              <FileText size={15} />
            </div>
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Grounded Private Sources</span>
          </div>
          <span className="text-[10px] text-text-tertiary font-mono">{answer.sources.length} document(s)</span>
        </div>

        {isInsufficient ? (
          <div className="text-xs text-amber-300/90 flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <HelpCircle size={15} className="shrink-0" />
            <span>LifeOS couldn't find enough evidence in your uploaded documents to answer this confidently.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {answer.sources.map((src) => (
              <Link
                key={src.id}
                to={`/documents/${src.id}`}
                className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <SourceBadge type={src.type} name={src.name} />
                </div>
                {src.page && (
                  <span className="shrink-0 text-[10px] font-mono text-accent bg-accent-soft px-2 py-0.5 rounded border border-accent/20">
                    {src.page}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 5. Suggested Action */}
      {answer.suggestedAction && (
        <Link
          to={answer.actionLink || '/actions'}
          className="card card-hover p-4 flex items-center justify-between gap-3 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ArrowRight size={16} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Suggested Action</div>
              <div className="text-xs font-semibold text-text-primary mt-0.5">{answer.suggestedAction}</div>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Act now <ArrowRight size={14} />
          </span>
        </Link>
      )}
    </div>
  );
}
