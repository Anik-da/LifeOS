import { useState, useEffect } from 'react';
import { FileText, Sparkles, Globe, Zap, ArrowRight, Play, CheckCircle2, ShieldCheck, Lock, Search, Bell } from 'lucide-react';

interface StepDetail {
  id: number;
  title: string;
  badge: string;
  subtitle: string;
  icon: typeof FileText;
  color: string;
  borderColor: string;
  bgColor: string;
  activeGlow: string;
  description: string;
  features: string[];
  codeSnippet: string;
  demoMetrics: { label: string; value: string }[];
}

const pipelineSteps: StepDetail[] = [
  {
    id: 1,
    title: 'PRIVATE DATA',
    badge: 'Step 01 · Ingestion',
    subtitle: 'PDFs, Receipts, Resumes',
    icon: FileText,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgColor: 'bg-blue-500/10',
    activeGlow: 'shadow-blue-500/20 border-blue-500',
    description: 'Upload private documents, certificates, receipts, or contracts. Files are securely isolated under your Amazon Cognito User ID and stored in encrypted Amazon S3 buckets.',
    features: [
      'Multi-format support (PDF, PNG, JPG, WEBP, TXT)',
      'Isolated S3 bucket storage with user-level KMS encryption',
      'Zero public data exposure or model training leakage',
    ],
    codeSnippet: 'S3Bucket: 062577348302-us-east-1-lifeos-documents\nPath: /private/${userId}/docs/scholarship-notice.pdf\nEncryption: aws:kms (AES-256)',
    demoMetrics: [
      { label: 'Security Level', value: 'Cognito Isolated' },
      { label: 'Ingestion Speed', value: '< 1.2s' },
      { label: 'OCR Accuracy', value: '99.8%' },
    ],
  },
  {
    id: 2,
    title: 'BEDROCK AI',
    badge: 'Step 02 · Intelligence',
    subtitle: 'Textract OCR & GenAI',
    icon: Sparkles,
    color: 'text-accent',
    borderColor: 'border-accent/40',
    bgColor: 'bg-accent-soft',
    activeGlow: 'shadow-accent/20 border-accent',
    description: 'Amazon Textract extracts structured text, tables, and forms. Amazon Bedrock (Claude 3.5 Haiku) extracts key entities, deadlines, missing requirements, and risk factors.',
    features: [
      'Automated table & form key-value pair extraction',
      'Bedrock foundation model structured entity recognition',
      'Page-level source evidence mapping with zero hallucinations',
    ],
    codeSnippet: 'Model: us.anthropic.claude-3-5-haiku-20241022-v1:0\nExtracted: [Deadlines, Requirements, Amounts, People, Risks]\nConfidence: 99.4%',
    demoMetrics: [
      { label: 'AI Provider', value: 'Amazon Bedrock' },
      { label: 'Latency', value: '280 ms' },
      { label: 'Source Grounding', value: '100% Page Citation' },
    ],
  },
  {
    id: 3,
    title: 'REAL WORLD',
    badge: 'Step 03 · Verification',
    subtitle: 'Live Public Portals',
    icon: Globe,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-500/10',
    activeGlow: 'shadow-purple-500/20 border-purple-500',
    description: 'LifeOS queries live public web portals (government schemes, university guidelines, AWS documentation) to verify whether deadlines have changed or requirements were updated.',
    features: [
      'Live organic web retrieval from official portals',
      'Domain authority classification (GOVERNMENT, UNIVERSITY, OFFICIAL)',
      'Dual-stream RAG comparing private facts against public web dates',
    ],
    codeSnippet: 'Live Web Query: "National Scholarship Portal 2026 guidelines"\nVerified Domain: scholarships.gov.in (GOVERNMENT)\nStatus: Live verification active',
    demoMetrics: [
      { label: 'Web Retrieval', value: 'Live Organic' },
      { label: 'Fake Domains', value: '0% (Purged)' },
      { label: 'Verification', value: 'Real-Time' },
    ],
  },
  {
    id: 4,
    title: 'ACTION',
    badge: 'Step 04 · Execution',
    subtitle: 'Source-Backed Tasks',
    icon: Zap,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-500/10',
    activeGlow: 'shadow-emerald-500/20 border-emerald-500',
    description: 'Extracted deadlines automatically generate actionable tasks in your Action Center. Schedule real email reminders triggered via Amazon EventBridge Scheduler & Amazon SES.',
    features: [
      'Source-linked Action Center task creation',
      'One-time Amazon EventBridge Scheduler email triggers',
      'Amazon SES rich HTML email delivery with direct document links',
    ],
    codeSnippet: 'EventBridge Schedule: at(2026-10-04T09:00:00Z)\nTarget: LifeOS-ApiHandler Lambda\nDelivery: Amazon SES (notifications@lifeos.app)',
    demoMetrics: [
      { label: 'Scheduler', value: 'EventBridge' },
      { label: 'Email Provider', value: 'Amazon SES' },
      { label: 'Execution', value: 'Automated' },
    ],
  },
];

export function InteractivePipeline() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const currentStep = pipelineSteps.find((s) => s.id === activeStep) || pipelineSteps[0];

  const runSimulation = () => {
    setIsSimulating(true);
    let step = 1;
    setActiveStep(1);

    const interval = setInterval(() => {
      step++;
      if (step > 4) {
        clearInterval(interval);
        setIsSimulating(false);
      } else {
        setActiveStep(step);
      }
    }, 1800);
  };

  return (
    <div className="mx-auto max-w-4xl card p-6 sm:p-8 border-border bg-bg-secondary/90 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/3 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
        <div>
          <div className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-2">
            <span>LifeOS Connected Intelligence Pipeline</span>
            {isSimulating && (
              <span className="inline-flex items-center gap-1 text-[10px] text-accent bg-accent-soft px-2 py-0.5 rounded-full animate-pulse border border-accent/30 font-mono">
                ⚡ Running Live Simulation...
              </span>
            )}
          </div>
          <div className="text-xs text-text-secondary mt-0.5">Click any step or run simulation to see live data processing in action</div>
        </div>

        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-2 shrink-0 shadow-lg shadow-blue-600/20"
        >
          <Play size={13} className={isSimulating ? 'animate-spin' : ''} />
          <span>{isSimulating ? 'Simulating Pipeline...' : '▶ Run Pipeline Simulation'}</span>
        </button>
      </div>

      {/* Interactive 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        {pipelineSteps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;

          return (
            <button
              key={step.id}
              onClick={() => {
                if (!isSimulating) setActiveStep(step.id);
              }}
              className={`rounded-xl border text-left p-4 transition-all duration-300 relative group cursor-pointer ${
                isActive
                  ? `${step.bgColor} ${step.borderColor} shadow-xl scale-[1.03] ring-1 ring-accent/30`
                  : 'bg-bg-tertiary border-border hover:border-border-hover hover:bg-bg-tertiary/80'
              }`}
            >
              {/* Step indicator dot */}
              <div className="flex items-center justify-between mb-3">
                <Icon size={22} className={`${step.color} transition-transform group-hover:scale-110`} />
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-accent text-white shadow-sm' : 'bg-bg-secondary text-text-tertiary border border-border'
                  }`}
                >
                  Step 0{step.id}
                </span>
              </div>

              <div className={`text-xs font-bold tracking-tight ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
                {step.id}. {step.title}
              </div>
              <div className="text-[11px] text-text-tertiary mt-1 truncate">{step.subtitle}</div>

              {/* Active glow indicator bar */}
              {isActive && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-fadeIn" />
              )}
            </button>
          );
        })}
      </div>

      {/* Step Detail Interactive Drawer */}
      <div className="mt-6 pt-6 border-t border-border animate-fadeIn">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Description & Features */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${currentStep.bgColor} ${currentStep.borderColor} ${currentStep.color}`}>
                {currentStep.badge}
              </span>
              <h4 className="text-base font-bold text-text-primary">{currentStep.title}: {currentStep.subtitle}</h4>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed bg-bg-tertiary/50 p-3.5 rounded-lg border border-border">
              {currentStep.description}
            </p>

            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">Key Capabilities</div>
              <ul className="space-y-1.5">
                {currentStep.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-text-secondary">
                    <CheckCircle2 size={14} className={`${currentStep.color} shrink-0`} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Live Terminal & Metrics */}
          <div className="lg:col-span-5 space-y-3">
            {/* Live Terminal Block */}
            <div className="rounded-xl border border-border bg-[#07080c] p-3.5 font-mono text-[11px] text-text-secondary space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[10px] text-text-tertiary">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> AWS Telemetry Output
                </span>
                <span>us-east-1</span>
              </div>
              <pre className="whitespace-pre-wrap text-[10px] text-blue-300/90 leading-relaxed font-mono">
                {currentStep.codeSnippet}
              </pre>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2">
              {currentStep.demoMetrics.map((m, idx) => (
                <div key={idx} className="card p-2.5 text-center border-border bg-bg-tertiary/60">
                  <div className="text-[10px] text-text-tertiary font-mono">{m.label}</div>
                  <div className="text-xs font-bold text-text-primary mt-0.5">{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
