import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-bg-secondary border-r border-border relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
            <Brain size={20} />
          </div>
          <div>
            <div className="text-base font-bold text-text-primary tracking-tight">LifeOS</div>
            <div className="text-[10px] text-text-tertiary font-medium">Personal Action Intelligence</div>
          </div>
        </Link>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-text-primary leading-tight max-w-md">
            Turn scattered information into connected, explainable intelligence.
          </h1>
          <p className="text-text-secondary mt-4 max-w-md leading-relaxed">
            LifeOS understands your documents, detects what changed, what requires action, and what you might forget — so you never miss what matters.
          </p>
        </div>

        <div className="relative z-10 flex gap-3">
          <div className="flex-1 card p-4">
            <div className="text-2xl font-bold text-text-primary">128</div>
            <div className="text-xs text-text-tertiary mt-1">Sources connected</div>
          </div>
          <div className="flex-1 card p-4">
            <div className="text-2xl font-bold text-text-primary">7</div>
            <div className="text-xs text-text-tertiary mt-1">Actions detected</div>
          </div>
          <div className="flex-1 card p-4">
            <div className="text-2xl font-bold text-text-primary">3</div>
            <div className="text-xs text-text-tertiary mt-1">Active processes</div>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-blue-500/8 blur-3xl" />
          <div className="absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-emerald-500/8 blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
                <Brain size={20} />
              </div>
              <div className="text-base font-bold text-text-primary">LifeOS</div>
            </Link>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
          <p className="text-sm text-text-secondary mt-2 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
