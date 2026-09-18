import { useState } from 'react';
import { Shield, Loader2, AlertTriangle, CheckCircle, FileText, Mail, Globe, MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { api } from '@/services/api';
import type { ScamCheckResult } from '@/types';

const inputTypes = [
  { id: 'message' as const, label: 'Message', icon: MessageSquare },
  { id: 'email' as const, label: 'Email', icon: Mail },
  { id: 'screenshot' as const, label: 'Screenshot', icon: FileText },
  { id: 'website' as const, label: 'Website text', icon: Globe },
];

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  high: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

export function SecurityPage() {
  const [inputType, setInputType] = useState<'message' | 'email' | 'screenshot' | 'website'>('message');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamCheckResult | null>(null);

  const handleCheck = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await api.security.checkInput(content, inputType);
      setResult(r);
    } catch {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const sampleText = 'URGENT: Your account will be suspended in 24 hours! Click here to verify immediately and pay ₹500 processing fee to restore access. Do not share this OTP with anyone.';

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <PageHeader title="Security / ScamCheck" subtitle="Evidence-based risk analysis for messages, emails, and websites. No simplistic verdicts — just indicators to help you decide." />

      <div className="space-y-5 animate-fadeIn">
        <div className="card p-5">
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">What would you like to check?</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {inputTypes.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setInputType(t.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors ${
                    inputType === t.id
                      ? 'border-accent/30 bg-accent-soft text-accent'
                      : 'border-border text-text-secondary hover:border-border-hover'
                  }`}
                >
                  <Icon size={18} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Paste content</label>
            <button
              onClick={() => setContent(sampleText)}
              className="text-xs text-accent hover:text-accent-hover"
            >
              Try sample
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the message, email, or website text you want to analyze..."
            rows={6}
            className="input-field w-full p-3 text-sm resize-y"
          />
          <button
            onClick={handleCheck}
            disabled={loading || !content.trim()}
            className="btn-primary w-full mt-3 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Shield size={15} />
                Analyze for risk indicators
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="card p-5">
            <div className="flex flex-col items-center py-6 gap-3">
              <Loader2 size={28} className="animate-spin text-accent" />
              <div className="text-sm text-text-secondary">Analyzing content for risk patterns...</div>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4 animate-slideUp">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} className="text-accent" />
                <span className="text-sm font-semibold text-text-primary">Analysis</span>
              </div>
              <p className="text-sm text-text-secondary">{result.summary}</p>
            </div>

            <div className="card p-5">
              <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Risk indicators</div>
              <div className="space-y-2.5">
                {result.riskIndicators.map((r) => {
                  const cfg = severityConfig[r.severity];
                  return (
                    <div key={r.id} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-3.5`}>
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle size={16} className={`${cfg.color} mt-0.5 shrink-0`} />
                        <div>
                          <div className={`text-sm font-medium ${cfg.color}`}>{r.label}</div>
                          <div className="text-xs text-text-secondary mt-1 leading-relaxed">{r.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card p-5 border-blue-500/15">
              <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">What to verify</div>
              <div className="space-y-3">
                {result.verificationSteps.map((v, i) => (
                  <div key={v.id} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="text-sm text-text-secondary leading-relaxed pt-0.5">{v.step}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4 border-border">
              <div className="flex items-start gap-2.5">
                <CheckCircle size={16} className="text-text-tertiary mt-0.5 shrink-0" />
                <p className="text-xs text-text-tertiary leading-relaxed">
                  This analysis identifies common risk patterns. It does not guarantee a message is safe or malicious. Always verify independently before taking action.
                </p>
              </div>
            </div>
          </div>
        )}

        {!result && !loading && (
          <EmptyState
            icon={<Shield size={28} />}
            title="Ready to analyze"
            description="Paste any message, email, or website text above. LifeOS will check for urgency language, payment requests, identity spoofing, and other common risk indicators."
          />
        )}
      </div>
    </div>
  );
}
