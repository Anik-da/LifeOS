import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Sparkles, Clock } from 'lucide-react';
import { api } from '@/services/api';
import { aiSuggestions } from '@/data/mockData';
import { AIResponse } from '@/components/features/AIResponse';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import type { AIAnswer } from '@/types';

export function InboxPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [answer, setAnswer] = useState<AIAnswer | null>(null);

  const handleAsk = async (q?: string) => {
    const query = q || question;
    if (!query.trim()) return;
    setQuestion(query);
    setLoading(true);
    setError(false);
    setAnswer(null);
    try {
      const result = await api.ai.ask(query);
      setAnswer(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <div className="text-center mb-8 animate-fadeIn">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-medium text-accent mb-4">
          <Sparkles size={12} /> Ask LifeOS
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Ask LifeOS</h1>
        <p className="text-sm text-text-secondary mt-2">Search and understand everything you've added.</p>
      </div>

      <div className="relative mb-6 animate-slideUp">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="What documents am I missing for my scholarship?"
          className="input-field w-full pl-11 pr-28 py-3.5 text-sm"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || !question.trim()}
          className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-xs flex items-center gap-1.5"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          {loading ? 'Searching...' : 'Ask'}
        </button>
      </div>

      {!loading && !answer && !error && (
        <div className="animate-slideUp">
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Try asking</div>
          <div className="space-y-2">
            {aiSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleAsk(s)}
                className="card card-hover w-full p-3.5 flex items-center gap-3 text-left"
              >
                <Clock size={15} className="text-text-tertiary shrink-0" />
                <span className="text-sm text-text-secondary">{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <div className="card p-5">
            <LoadingSkeleton variant="text" />
            <LoadingSkeleton variant="text" />
          </div>
          <div className="card p-5">
            <LoadingSkeleton variant="text" />
          </div>
        </div>
      )}

      {error && (
        <ErrorState
          title="Could not process your question"
          message="Something went wrong while searching your information. Please try again."
          onRetry={() => handleAsk()}
        />
      )}

      {answer && !loading && <AIResponse answer={answer} />}

      {answer && (
        <div className="mt-6 text-center">
          <button
            onClick={() => { setAnswer(null); setQuestion(''); }}
            className="btn-secondary px-4 py-2 text-xs"
          >
            Ask another question
          </button>
        </div>
      )}
    </div>
  );
}
