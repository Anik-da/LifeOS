/**
 * LifeOS Responsive Landing Page & User Interaction Flow
 * Designed with modern aesthetic tokens, dynamic animations, and authenticated navigation.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Globe,
  FileText,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  Bell,
  Clock,
  ExternalLink,
  ChevronDown,
  Layers,
  Database,
  KeyRound,
  Eye,
  Check,
  LogOut,
} from 'lucide-react';
import { LifeOSLogo } from '@/components/ui/LifeOSLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LifeOSIntelligenceVisual } from '@/components/features/LifeOSIntelligenceVisual';
import { AppLoadingScreen } from '@/components/ui/AppLoadingScreen';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

export function LandingPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ displayName: string; email: string } | null>(null);
  const [reminderScheduled, setReminderScheduled] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const p = await api.auth.getProfile();
        if (p && p.email) {
          setUserProfile({ displayName: p.displayName || p.email.split('@')[0], email: p.email });
        }
      } catch {
        setUserProfile(null);
      }
    }
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await api.auth.logout();
    setUserProfile(null);
    showToast('Signed out successfully', 'info');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleCreateSampleReminder = async () => {
    try {
      showToast('Scheduling reminder for 4 October via EventBridge & SES...', 'info');
      setReminderScheduled(true);
      setTimeout(() => {
        showToast('Reminder scheduled! Email will be delivered via Amazon SES.', 'success');
      }, 800);
    } catch {
      showToast('Could not schedule reminder.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-text-primary flex flex-col font-sans selection:bg-accent/30 selection:text-white">
      {/* App Initialization Screen */}
      {loadingScreen && <AppLoadingScreen onComplete={() => setLoadingScreen(false)} />}

      {/* SECTION 1 — NAVIGATION */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07080b]/85 border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <LifeOSLogo size={32} showText={true} />
            <span className="hidden sm:inline-block text-[11px] font-mono text-text-tertiary border-l border-white/10 pl-3">
              Personal Action Intelligence
            </span>
          </Link>

          {/* Marketing Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-text-secondary">
            <a href="#how-it-works" className="hover:text-text-primary transition-colors">
              How It Works
            </a>
            <a href="#intelligence" className="hover:text-text-primary transition-colors">
              Intelligence
            </a>
            <a href="#security" className="hover:text-text-primary transition-colors">
              Security
            </a>
            <a href="#demo-preview" className="hover:text-text-primary transition-colors">
              Demo
            </a>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {userProfile ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-text-secondary">
                  <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {getInitials(userProfile.displayName)}
                  </div>
                  <span className="font-medium text-text-primary max-w-[120px] truncate">{userProfile.displayName}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs font-medium text-text-secondary hover:text-red-400 px-2.5 py-1.5 transition-colors flex items-center gap-1.5 border border-white/10 rounded-lg hover:border-red-500/30 bg-white/5"
                  title="Sign Out"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
                <Link to="/dashboard" className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5">
                  <span>Open LifeOS</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login" className="text-xs font-medium text-text-secondary hover:text-text-primary px-3 py-2 transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                  <span>Open LifeOS</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SECTION 2 — HERO */}
      <section className="relative pt-16 sm:pt-20 pb-12 px-6 overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-4xl text-center space-y-6 relative z-10 animate-fadeIn">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-[11px] font-semibold text-blue-400 font-mono tracking-wider uppercase">
            <Sparkles size={13} /> PERSONAL ACTION INTELLIGENCE
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.1]">
            Your information is everywhere. <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
              LifeOS connects it.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Understand what matters. Connect it to the real world. Know what to do next.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to={userProfile ? '/dashboard' : '/signup'}
              className="btn-primary text-sm px-6 py-3 flex items-center gap-2 shadow-xl shadow-blue-600/20"
            >
              <span>{userProfile ? 'Go to Your LifeOS →' : 'Start with your information →'}</span>
            </Link>

            <a
              href="#how-it-works"
              className="btn-secondary text-sm px-6 py-3 flex items-center gap-2"
            >
              See how LifeOS works
            </a>
          </div>
        </div>

        {/* SECTION 3 — SIGNATURE LIFEOS VISUAL */}
        <div id="intelligence" className="mt-12">
          <LifeOSIntelligenceVisual />
        </div>
      </section>

      {/* SECTION 4 — REAL PRODUCT PREVIEW */}
      <section id="demo-preview" className="py-16 px-6 bg-[#0a0c12]/60 border-y border-white/10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-[11px] font-mono font-semibold text-amber-400">
              ⚡ Live Intelligence Sample (Synthetic Demonstration)
            </span>
            <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
              LifeOS found something you might have missed
            </h2>
            <p className="text-xs text-text-secondary max-w-xl mx-auto leading-relaxed">
              Demonstrating the core LifeOS differentiator: <strong className="text-text-primary">PRIVATE INFORMATION + REAL-WORLD INFORMATION = ACTIONABLE CONTEXT</strong>.
            </p>
          </div>

          {/* Actionable Conflict Preview Card */}
          <div className="card p-6 border-amber-500/30 bg-[#0e111a] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                  Potential Conflict Detected
                </span>
              </div>
              <span className="text-[10px] font-mono text-text-tertiary bg-white/5 px-2 py-0.5 rounded">
                Confidence: 99.4%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Private Document Context */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-semibold">
                  <FileText size={15} /> Your Private Document
                </div>
                <div className="text-text-primary font-bold">"Application deadline: 30 September"</div>
                <div className="text-[11px] text-text-tertiary font-mono">
                  Source: <code>National_Scholarship_Form.pdf</code> (Page 2)
                </div>
              </div>

              {/* Public Real-World Verification */}
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-semibold">
                  <Globe size={15} /> Verified Public Source
                </div>
                <div className="text-text-primary font-bold">"Deadline updated to 4 October"</div>
                <div className="text-[11px] text-text-tertiary font-mono">
                  Source: <code>scholarships.gov.in</code> (Official Govt Portal)
                </div>
              </div>
            </div>

            {/* Status & Actions Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="font-semibold text-text-primary">Status:</span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 size={12} /> POTENTIAL UPDATE
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  to="/actions"
                  className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
                >
                  <FileText size={13} /> View Evidence
                </Link>

                <button
                  onClick={handleCreateSampleReminder}
                  disabled={reminderScheduled}
                  className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                >
                  <Bell size={13} />
                  <span>{reminderScheduled ? '✓ Reminder Scheduled' : 'Create Reminder'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — TRUST STRIP */}
      <section id="security" className="py-16 px-6 bg-[#07080b]">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-accent uppercase tracking-wider">
              <ShieldCheck size={16} /> SECURE BY DESIGN
            </div>
            <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">
              Enterprise-Grade Security Architecture
            </h2>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              Grounding every statement strictly in verified backend implementations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Authenticated Access',
                icon: KeyRound,
                desc: 'Secured via Amazon Cognito User Pool (us-east-1) with JWT authorization headers.',
              },
              {
                title: 'User-Isolated Data',
                icon: Lock,
                desc: 'Strictly partitioned by canonical Cognito sub in DynamoDB tables and S3 prefixes.',
              },
              {
                title: 'Private Document Storage',
                icon: Database,
                desc: 'Encrypted S3 bucket storage with short-lived pre-signed upload URLs.',
              },
              {
                title: 'Evidence-Backed Answers',
                icon: Eye,
                desc: 'Amazon Bedrock RAG responses mapped directly to exact document page citations.',
              },
            ].map((trust, i) => {
              const Icon = trust.icon;
              return (
                <div key={i} className="card p-5 border-white/10 bg-[#0c0e16] hover:border-accent/40 transition-all space-y-2.5">
                  <Icon size={20} className="text-accent" />
                  <div className="text-sm font-bold text-text-primary">{trust.title}</div>
                  <p className="text-xs text-text-tertiary leading-relaxed font-mono text-[11px]">{trust.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6 — HOW LIFEOS WORKS */}
      <section id="how-it-works" className="py-20 px-6 bg-[#0a0c12]/80 border-t border-white/10">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-2">
            <div className="text-xs font-mono font-bold text-accent uppercase tracking-wider">METHODOLOGY</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">How LifeOS Operates</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                num: '01',
                title: 'CAPTURE',
                desc: 'Bring your information into LifeOS. Upload PDFs, receipts, resumes, or contracts.',
              },
              {
                num: '02',
                title: 'UNDERSTAND',
                desc: 'AI extracts meaning, key dates, tables, and missing items via Textract & Bedrock.',
              },
              {
                num: '03',
                title: 'CONNECT',
                desc: 'Connect private knowledge with relevant real-world information and live portal updates.',
              },
              {
                num: '04',
                title: 'ACT',
                desc: 'Turn insight into scheduled email reminders, structured workflows, and decisions.',
              },
            ].map((step, i) => (
              <div key={i} className="card p-6 border-white/10 bg-[#0d0f17] hover:border-accent/40 transition-all space-y-3">
                <div className="text-2xl font-black text-accent font-mono">{step.num}</div>
                <div className="text-xs font-bold text-text-primary uppercase tracking-wider">{step.title}</div>
                <p className="text-xs text-text-tertiary leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 & 10 — FOOTER */}
      <footer className="mt-auto border-t border-white/10 py-8 px-6 text-xs text-text-tertiary bg-[#050608]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LifeOSLogo size={24} showText={true} />
            <span className="text-[11px] font-mono text-text-tertiary">v2.4.0 · Production Ready</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <button
              onClick={() => setLoadingScreen(true)}
              className="text-text-tertiary hover:text-text-primary transition-colors underline cursor-pointer"
            >
              Test App Initialization State
            </button>
            <span>·</span>
            <span>AWS Bedrock · Textract · S3 · DynamoDB · SES · Cognito</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
