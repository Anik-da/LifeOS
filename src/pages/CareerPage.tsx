import { useState, useEffect } from 'react';
import { Briefcase, Mail, CheckCircle, Clock, AlertTriangle, TrendingUp, Globe, ExternalLink, Sparkles, Search, BookmarkCheck, Bookmark, MapPin, DollarSign } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/services/api';
import type { CareerApplication, SkillGap, JobOpportunity } from '@/types';

export function CareerPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [activeTab, setActiveTab] = useState<'opportunities' | 'applications' | 'skillgap' | 'interview'>('opportunities');

  // Search & filter for online opportunities
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');

  useEffect(() => {
    Promise.all([
      api.career.getApplications(),
      api.career.getSkillGap(),
      api.career.getOpportunities(),
    ])
      .then(([a, s, o]) => {
        setApplications(Array.isArray(a) ? a : []);
        setSkillGap(s || null);
        setOpportunities(Array.isArray(o) ? o : []);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const handleTrackOpportunity = (job: JobOpportunity) => {
    // Check if already tracked
    if (applications.some(a => a.company.toLowerCase() === job.company.toLowerCase() && a.role.toLowerCase() === job.title.toLowerCase())) {
      showToast(`${job.title} at ${job.company} is already being tracked!`, 'info');
      return;
    }

    const newApp: CareerApplication = {
      id: `ca-${Date.now()}`,
      company: job.company,
      role: job.title,
      appliedDate: new Date().toISOString().split('T')[0],
      currentStatus: 'Application tracked via Online Discovery',
      stageIndex: 0,
      stages: [
        { name: 'Discovered', status: 'complete' },
        { name: 'Applied', status: 'current' },
        { name: 'Interview', status: 'pending' },
        { name: 'Decision', status: 'pending' },
      ],
      lastEmailDetected: `Saved from ${job.source} on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    };

    setApplications(prev => [newApp, ...prev]);
    setOpportunities(prev => prev.map(o => o.id === job.id ? { ...o, applied: true } : o));
    showToast(`Added "${job.title}" at ${job.company} to your tracked applications!`, 'success');
  };

  const tabs = [
    { id: 'opportunities' as const, label: 'Online Opportunities', icon: Globe, count: opportunities.length },
    { id: 'applications' as const, label: 'Applications', icon: Briefcase, count: applications.length },
    { id: 'skillgap' as const, label: 'Skill Gap', icon: TrendingUp },
    { id: 'interview' as const, label: 'Interview Practice', icon: Mail },
  ];

  const filteredOpportunities = opportunities.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesWorkMode = selectedWorkMode === 'All' || job.workMode === selectedWorkMode;
    const matchesSource = selectedSource === 'All' || job.source === selectedSource;

    return matchesSearch && matchesWorkMode && matchesSource;
  });

  if (loading) return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Career" subtitle="Discover live online job opportunities, track applications, identify skill gaps, and prepare for interviews." />
      <LoadingSkeleton variant="list" />
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Career" subtitle="Discover live online job opportunities, track applications, identify skill gaps, and prepare for interviews." />
      <ErrorState onRetry={() => window.location.reload()} />
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <PageHeader title="Career" subtitle="Discover live online job opportunities, track applications, identify skill gaps, and prepare for interviews." />

      <div className="flex items-center gap-1 mb-6 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <Icon size={15} /> {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                  activeTab === tab.id ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-bg-tertiary text-text-tertiary'
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
            </button>
          );
        })}
      </div>

      {activeTab === 'opportunities' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Search & Filter Header */}
          <div className="card p-4 space-y-3 border-accent/20 bg-gradient-to-r from-accent/5 to-purple-500/5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search online roles, companies, or skills (e.g. React, Python, AWS)..."
                  className="input-field w-full pl-9 pr-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedWorkMode}
                  onChange={(e) => setSelectedWorkMode(e.target.value)}
                  className="input-field py-2 px-2.5 text-xs bg-bg-tertiary cursor-pointer"
                >
                  <option value="All">All Locations</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>

                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="input-field py-2 px-2.5 text-xs bg-bg-tertiary cursor-pointer"
                >
                  <option value="All">All Sources</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Indeed">Indeed</option>
                  <option value="Wellfound">Wellfound</option>
                  <option value="Glassdoor">Glassdoor</option>
                  <option value="RemoteOK">RemoteOK</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-text-tertiary pt-1 border-t border-border">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Sparkles size={13} /> {filteredOpportunities.length} Verified Online Opportunities Matching Your LifeOS Profile
              </span>
              <span>Refreshed live via web intelligence</span>
            </div>
          </div>

          {/* Job List */}
          {filteredOpportunities.length === 0 ? (
            <EmptyState
              icon={<Globe size={28} />}
              title="No matching job opportunities"
              description="Try adjusting your search query or filters to view more opportunities."
            />
          ) : (
            <div className="space-y-3.5">
              {filteredOpportunities.map((job) => {
                const isTracked = job.applied || applications.some(a => a.company.toLowerCase() === job.company.toLowerCase() && a.role.toLowerCase() === job.title.toLowerCase());
                return (
                  <div key={job.id} className="card p-5 hover:border-accent/30 transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors">{job.title}</h3>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            job.workMode === 'Remote' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' :
                            job.workMode === 'Hybrid' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                            'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          }`}>
                            {job.workMode}
                          </span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border border-border bg-bg-tertiary text-text-secondary">
                            {job.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-text-tertiary mt-1.5 flex-wrap">
                          <span className="font-semibold text-text-secondary">{job.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-emerald-400"><DollarSign size={12} /> {job.salary}</span>
                          <span>•</span>
                          <span>Posted {job.postedDate}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold shadow-sm">
                          <Sparkles size={12} />
                          {job.matchScore}% Match
                        </div>
                        <span className="text-[11px] text-text-tertiary font-medium">via {job.source}</span>
                      </div>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed mb-3">
                      {job.description}
                    </p>

                    <div className="rounded-lg border border-accent/15 bg-accent/5 p-2.5 text-xs text-text-secondary mb-3 flex items-start gap-2">
                      <Sparkles size={13} className="text-accent shrink-0 mt-0.5" />
                      <span><strong>Profile Match Insight:</strong> {job.matchReason}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {job.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="text-[11px] font-medium px-2 py-0.5 rounded bg-bg-tertiary border border-border text-text-secondary">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleTrackOpportunity(job)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                            isTracked
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 cursor-default'
                              : 'border-border bg-bg-tertiary text-text-primary hover:border-accent hover:text-accent'
                          }`}
                        >
                          {isTracked ? (
                            <>
                              <BookmarkCheck size={13} /> Tracked in LifeOS
                            </>
                          ) : (
                            <>
                              <Bookmark size={13} /> Track in LifeOS
                            </>
                          )}
                        </button>

                        <a
                          href={job.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-sm"
                        >
                          Apply on {job.source}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-4 animate-fadeIn">
          {(applications || []).length === 0 ? (
            <EmptyState icon={<Briefcase size={28} />} title="No applications yet" description="LifeOS will track your job applications and detect status updates from your emails." />
          ) : (
            (applications || []).map((app) => (
              <div key={app.id} className="card p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{app.role}</h3>
                    <div className="text-xs text-text-tertiary mt-0.5">{app.company} · Applied {new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                  <span className="text-xs text-text-secondary">{app.currentStatus}</span>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {(app.stages || []).map((stage, i) => (
                    <div key={i} className="flex items-center gap-1 shrink-0">
                      <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                        stage.status === 'complete' ? 'bg-emerald-500/10 text-emerald-400' :
                        stage.status === 'current' ? 'bg-accent-soft text-accent' :
                        'bg-bg-tertiary text-text-tertiary'
                      }`}>
                        {stage.status === 'complete' && <CheckCircle size={12} />}
                        {stage.status === 'current' && <Clock size={12} />}
                        {stage.status === 'pending' && <div className="h-2 w-2 rounded-full border border-current" />}
                        {stage.name}
                      </div>
                      {i < (app.stages || []).length - 1 && <div className="h-px w-4 bg-border" />}
                    </div>
                  ))}
                </div>

                {app.lastEmailDetected && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-text-tertiary border-t border-border pt-3">
                    <Mail size={12} />
                    {app.lastEmailDetected}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'skillgap' && skillGap && (
        <div className="space-y-4 animate-fadeIn">
          <div className="card p-5 border-amber-500/15">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} className="text-amber-400" />
              <span className="text-sm font-semibold text-text-primary">Skill gap detected</span>
            </div>
            <p className="text-xs text-text-secondary">
              Based on the job description for {skillGap.jobTitle} at {skillGap.company}. This is an informational comparison, not an official eligibility assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Your skills</div>
              <div className="space-y-2.5">
                {(skillGap.yourSkills || []).map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-text-primary">{s.name}</span>
                    <SkillMark status={s.status} />
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Job requirements</div>
              <div className="space-y-2.5">
                {(skillGap.jobRequirements || []).map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-text-primary">{s.name}</span>
                    <SkillMark status={s.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Gap analysis</div>
            <div className="space-y-2">
              {(skillGap.yourSkills || []).filter((s) => s.status === 'missing' || s.status === 'partial').map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <AlertTriangle size={14} className={s.status === 'missing' ? 'text-red-400' : 'text-amber-400'} />
                  <span className="text-text-secondary">
                    <span className="text-text-primary font-medium">{s.name}</span> — {s.status === 'missing' ? 'Not yet covered' : 'Partial knowledge'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'interview' && (
        <div className="space-y-4 animate-fadeIn">
          {((skillGap as any)?.interviewQuestions || []).length === 0 ? (
            <EmptyState
              icon={<Mail size={28} />}
              title="No interview practice sessions yet"
              description="Upload a Resume and Job Description to generate tailored interview practice questions."
            />
          ) : (
            <div className="space-y-4">
              <div className="card p-5 border-accent/20 bg-accent-soft/20">
                <h3 className="text-sm font-bold text-text-primary mb-1">Tailored Interview Practice</h3>
                <p className="text-xs text-text-secondary">Questions generated directly from your resume and the target role description ({skillGap?.jobTitle || 'Role'}).</p>
              </div>

              {((skillGap as any)?.interviewQuestions || []).map((q: any, idx: number) => (
                <div key={idx} className="card p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-accent font-semibold">
                    <span>Question {idx + 1}</span>
                    <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-text-tertiary">{q.suggestedTopic || 'Technical'}</span>
                  </div>
                  <div className="text-sm font-semibold text-text-primary">{q.question}</div>
                  <div className="text-xs text-text-tertiary border-t border-white/5 pt-2">Context: {q.context}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SkillMark({ status }: { status: 'have' | 'partial' | 'missing' }) {
  if (status === 'have') return <CheckCircle size={16} className="text-emerald-400" />;
  if (status === 'partial') return <span className="text-amber-400 text-sm">◐</span>;
  return <span className="text-red-400 text-sm">✕</span>;
}
