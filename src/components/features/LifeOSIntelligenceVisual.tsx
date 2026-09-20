import { useState } from 'react';
import { FileText, Globe, Sparkles, Zap, ShieldCheck, ArrowRight, CheckCircle2, Lock, ExternalLink } from 'lucide-react';

interface NodeItem {
  id: string;
  category: 'private' | 'public' | 'action';
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  details: string;
}

const privateItems: NodeItem[] = [
  {
    id: 'p1',
    category: 'private',
    title: 'Scholarship Notice PDF',
    subtitle: 'National_Scholarship_2026.pdf',
    badge: 'S3 Private',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    details: 'User document isolated under Cognito sub in private encrypted S3 bucket.',
  },
  {
    id: 'p2',
    category: 'private',
    title: 'Laptop Purchase Receipt',
    subtitle: 'Invoice_Gigabyte_Service.pdf',
    badge: 'Textract Form',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    details: 'Extracted serial number, purchase date (14 Oct 2024), and 2-year warranty clause.',
  },
  {
    id: 'p3',
    category: 'private',
    title: 'Software Developer Resume',
    subtitle: 'Anik_Das_Resume_2026.pdf',
    badge: 'DynamoDB Index',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    details: 'Extracted key skills (React, TypeScript, AWS, Node.js) for career matching.',
  },
];

const publicItems: NodeItem[] = [
  {
    id: 'pub1',
    category: 'public',
    title: 'Official Portal Notice',
    subtitle: 'scholarships.gov.in',
    badge: 'GOVERNMENT',
    icon: Globe,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    details: 'Live public web check verified scholarship submission deadline extended to 4 Oct.',
  },
  {
    id: 'pub2',
    category: 'public',
    title: 'Gigabyte Warranty Policy',
    subtitle: 'gigabyte.com/support',
    badge: 'OFFICIAL',
    icon: Globe,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    details: 'Verified online RMA registration requirement prior to claim submission.',
  },
  {
    id: 'pub3',
    category: 'public',
    title: 'Target Job Requirements',
    subtitle: 'linkedin.com/jobs',
    badge: 'CAREER WEB',
    icon: Globe,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    details: 'Matched Senior Developer skill requirements against private resume vector chunks.',
  },
];

const actionItems: NodeItem[] = [
  {
    id: 'a1',
    category: 'action',
    title: 'Scholarship Deadline Email Reminder',
    subtitle: 'Amazon SES · 4 Oct 2026',
    badge: 'EventBridge Scheduled',
    icon: Zap,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    details: 'EventBridge Scheduler trigger scheduled to send reminder email to user.',
  },
  {
    id: 'a2',
    category: 'action',
    title: 'Warranty Claim Checklist',
    subtitle: 'Action Center #AC-88',
    badge: 'Action Item',
    icon: Zap,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    details: 'Pre-filled serial number and invoice PDF citation attached for one-click claim.',
  },
];

export function LifeOSIntelligenceVisual() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const activeItem =
    [...privateItems, ...publicItems, ...actionItems].find((x) => x.id === hoveredNode) || privateItems[0];

  return (
    <div className="w-full max-w-6xl mx-auto my-8">
      {/* Outer Container */}
      <div className="card p-6 sm:p-8 bg-[#090b10]/95 border-white/10 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Lighting Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-mono text-blue-400">
            <Sparkles size={13} /> DUAL-STREAM KNOWLEDGE PIPELINE
          </div>
          <h3 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Connecting Private World to Real-World Verification
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Hover over any item to trace how LifeOS transforms raw documents and live web checks into actionable context.
          </p>
        </div>

        {/* Main 3-Column Visual Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch relative z-10">
          {/* Column 1: PRIVATE WORLD (4 Cols) */}
          <div className="md:col-span-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <Lock size={14} /> Private World
              </div>
              <span className="text-[10px] font-mono text-blue-300/80 bg-blue-500/20 px-2 py-0.5 rounded">
                Cognito Isolated
              </span>
            </div>

            <div className="flex-1 space-y-2.5">
              {privateItems.map((item) => {
                const Icon = item.icon;
                const isHovered = hoveredNode === item.id;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredNode(item.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${
                      isHovered
                        ? 'border-blue-500 bg-blue-500/15 shadow-lg scale-[1.02]'
                        : 'border-white/10 bg-[#0e111a] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Icon size={15} className="text-blue-400 shrink-0" />
                        <span className="text-xs font-semibold text-text-primary">{item.title}</span>
                      </div>
                      <span className="text-[9px] font-mono text-text-tertiary bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                        {item.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-tertiary font-mono truncate">{item.subtitle}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: LIFEOS AI CORE NODE (4 Cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl border border-accent/40 bg-gradient-to-b from-[#0f1422] to-[#0a0d18] relative shadow-2xl text-center space-y-4">
            {/* Pulsing Central Ring */}
            <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-accent/20 border border-accent/60 shadow-lg shadow-accent/20">
              <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping opacity-30" />
              <Sparkles size={36} className="text-accent animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono font-bold tracking-widest text-accent uppercase">
                LifeOS Intelligence
              </div>
              <h4 className="text-sm font-bold text-text-primary">Personal AI Core</h4>
              <p className="text-[11px] text-text-tertiary max-w-xs leading-relaxed">
                Bedrock Claude 3.5 Haiku + Textract OCR + Live Web Search with 100% Page Citation Grounding.
              </p>
            </div>

            <div className="w-full pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] font-mono text-text-secondary">
              <div className="rounded border border-white/5 bg-white/5 p-1.5">
                <span className="text-emerald-400 font-bold">0%</span> Hallucination
              </div>
              <div className="rounded border border-white/5 bg-white/5 p-1.5">
                <span className="text-blue-400 font-bold">&lt; 300ms</span> Latency
              </div>
            </div>
          </div>

          {/* Column 3: REAL WORLD (4 Cols) */}
          <div className="md:col-span-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <Globe size={14} /> Real World
              </div>
              <span className="text-[10px] font-mono text-purple-300/80 bg-purple-500/20 px-2 py-0.5 rounded">
                Live Verification
              </span>
            </div>

            <div className="flex-1 space-y-2.5">
              {publicItems.map((item) => {
                const Icon = item.icon;
                const isHovered = hoveredNode === item.id;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredNode(item.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${
                      isHovered
                        ? 'border-purple-500 bg-purple-500/15 shadow-lg scale-[1.02]'
                        : 'border-white/10 bg-[#0e111a] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <Icon size={15} className="text-purple-400 shrink-0" />
                        <span className="text-xs font-semibold text-text-primary">{item.title}</span>
                      </div>
                      <span className="text-[9px] font-mono text-text-tertiary bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                        {item.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-tertiary font-mono truncate">{item.subtitle}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Output Row — ACTIONS GENERATED */}
        <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Zap size={14} /> Actionable Context Generated
            </div>
            <span className="text-[11px] text-text-tertiary">Real-time reminders & decision steps</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actionItems.map((item) => {
              const Icon = item.icon;
              const isHovered = hoveredNode === item.id;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredNode(item.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`rounded-xl border p-4 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    isHovered
                      ? 'border-emerald-500 bg-emerald-500/15 shadow-lg scale-[1.01]'
                      : 'border-white/10 bg-[#0b0e16] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-text-primary truncate">{item.title}</div>
                      <div className="text-[11px] text-text-tertiary font-mono truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
                    {item.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detail Bar */}
        <div className="mt-5 p-3.5 rounded-xl border border-white/10 bg-[#07090e] flex items-center gap-3 text-xs text-text-secondary animate-fadeIn">
          <ShieldCheck size={16} className="text-accent shrink-0" />
          <div className="min-w-0 flex-1 truncate font-mono text-[11px]">
            <span className="text-text-primary font-bold">{activeItem.title}:</span> {activeItem.details}
          </div>
        </div>
      </div>
    </div>
  );
}
