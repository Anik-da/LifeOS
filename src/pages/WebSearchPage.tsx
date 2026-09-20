import { useState } from 'react';
import { Search, Globe, BookmarkPlus, ExternalLink, Loader2, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

export interface WebSearchResultItem {
  id: string;
  title: string;
  url: string;
  snippet: string;
  domain: string;
  sourceType: 'Official Portal' | 'Government' | 'University' | 'Organization' | 'Public Documentation' | 'Web Result';
  authority?: 'OFFICIAL' | 'GOVERNMENT' | 'UNIVERSITY' | 'ORGANIZATION' | 'GENERAL_WEB';
  retrievedAt: string;
  publishedAt?: string | null;
  saved?: boolean;
}

export function WebSearchPage() {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<WebSearchResultItem[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      // Execute live web search via API Gateway
      const res = await api.web.search(query.trim());
      // Handle both raw array or { results: [] } wrapper
      const list = Array.isArray(res) ? res : ((res as any)?.results || []);
      setResults(list);
    } catch (err: any) {
      console.error('Web search error:', err);
      setResults([]);
      setError(err.message || 'Live web search is currently unavailable. LifeOS did not generate synthetic sources.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLifeOS = async (item: WebSearchResultItem) => {
    try {
      await api.web.saveSource(item);
      setResults((prev) => prev.map((r) => (r.id === item.id ? { ...r, saved: true } : r)));
      showToast(`Saved "${item.title}" to your LifeOS Knowledge Base`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save public source', 'error');
    }
  };

  const getAuthorityBadgeColor = (type?: string, authority?: string) => {
    if (type === 'Government' || authority === 'GOVERNMENT') {
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    }
    if (type === 'University' || authority === 'UNIVERSITY') {
      return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
    }
    if (type === 'Public Documentation' || authority === 'OFFICIAL') {
      return 'border-purple-500/30 bg-purple-500/10 text-purple-300';
    }
    return 'border-border bg-bg-tertiary text-text-secondary';
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader
        title="Real-World Public Search"
        subtitle="Search live public internet sources, verify official program guidelines, and save real web knowledge directly to your LifeOS."
      />

      <div className="card p-5 mb-6 animate-fadeIn">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={18} className="text-purple-400" />
          <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Live Public Knowledge Retrieval</span>
        </div>
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-4 text-text-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search official scholarship guidelines, government schemes, or AWS documentation..."
            className="input-field w-full pl-11 pr-28 py-3 text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="btn-primary absolute right-2 px-4 py-1.5 text-xs flex items-center gap-1.5"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card p-8 text-center space-y-3">
          <Loader2 size={28} className="animate-spin text-purple-400 mx-auto" />
          <div className="text-sm font-medium text-text-primary">Searching live public web sources...</div>
          <div className="text-xs text-text-tertiary">Retrieving organic search results from official government, university, and documentation portals.</div>
        </div>
      )}

      {error && !loading && (
        <div className="card p-6 border-rose-500/30 bg-rose-500/10 text-center space-y-2 animate-fadeIn">
          <AlertCircle size={24} className="text-rose-400 mx-auto" />
          <div className="text-sm font-bold text-rose-300">PUBLIC SEARCH UNAVAILABLE</div>
          <div className="text-xs text-rose-200/80">{error}</div>
        </div>
      )}

      {!loading && !error && searched && results.length === 0 && (
        <div className="card p-8 text-center space-y-2 animate-fadeIn">
          <Globe size={28} className="text-text-tertiary mx-auto" />
          <div className="text-sm font-bold text-text-primary">No reliable public sources were found for this query.</div>
          <div className="text-xs text-text-tertiary">Try a broader search or check specific keywords.</div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              LIVE WEB RESULTS ({results.length})
            </div>
            <div className="text-[11px] text-text-tertiary font-mono">
              Retrieved: {results[0].retrievedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          {results.map((r) => (
            <div key={r.id} className="card p-5 border border-purple-500/20 bg-bg-secondary hover:border-purple-500/40 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getAuthorityBadgeColor(r.sourceType, r.authority)}`}>
                      <ShieldCheck size={12} /> {r.authority || r.sourceType || 'PUBLIC_WEB'}
                    </span>
                    <span className="text-[11px] text-text-tertiary font-mono">Domain: <strong className="text-text-secondary">{r.domain}</strong></span>
                    <span className="text-[11px] text-text-tertiary">· Retrieved: {r.retrievedAt}</span>
                  </div>

                  <h3 className="text-sm font-bold text-text-primary leading-tight">
                    {r.title}
                  </h3>

                  <p className="text-xs text-text-secondary leading-relaxed bg-bg-tertiary p-3 rounded-lg border border-border">
                    {r.snippet}
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
                    >
                      <span>Open source</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => handleSaveToLifeOS(r)}
                  disabled={r.saved}
                  className={`btn-secondary text-xs px-3.5 py-2 shrink-0 flex items-center gap-1.5 ${
                    r.saved ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : ''
                  }`}
                >
                  {r.saved ? <CheckCircle size={14} /> : <BookmarkPlus size={14} />}
                  {r.saved ? 'Saved to LifeOS' : 'Save to LifeOS'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
