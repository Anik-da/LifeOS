import React from 'react';
import { UserCheck, Globe, Zap, ArrowRight, ShieldCheck, FileText, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import { SourceBadge } from '@/components/ui/Badge';
import type { SourceReference, PublicSourceReference } from '@/types';

interface YourWorldRealWorldProps {
  privateSources?: SourceReference[];
  publicSources?: PublicSourceReference[];
  connectedInsight?: string;
  suggestedAction?: string;
  actionLink?: string;
}

export function YourWorldRealWorld({
  privateSources = [],
  publicSources = [],
  connectedInsight,
  suggestedAction,
  actionLink = '/actions',
}: YourWorldRealWorldProps) {
  return (
    <div className="card p-6 border border-white/10 bg-gradient-to-b from-[#0e111a] to-[#08090d] shadow-2xl relative overflow-hidden animate-fadeIn">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Title Badge Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-accent to-purple-500 text-white shadow-md shadow-accent/20">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-text-primary tracking-tight">YOUR WORLD <span className="text-accent">↔</span> REAL WORLD</h3>
            <p className="text-[11px] text-text-tertiary">LifeOS Dual-Knowledge Intelligence Loop</p>
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold flex items-center gap-1">
          <Zap size={12} /> Connected Stream
        </span>
      </div>

      {/* Grid: 3 Columns (Your World | Connected Intelligence | Real World) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

        {/* LEFT COLUMN — YOUR WORLD (Private Knowledge) */}
        <div className="lg:col-span-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck size={14} /> YOUR WORLD
              </span>
              <span className="text-[10px] text-text-tertiary font-mono">Private Docs</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              Your personal documents, requirements, dates, and historical records stored privately.
            </p>

            {privateSources.length > 0 ? (
              <div className="space-y-2">
                {privateSources.map((src, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <SourceBadge type={src.type} name={src.name} />
                    </div>
                    {src.page && (
                      <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
                        {src.page}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-white/5 border border-dashed border-white/10 text-xs text-text-tertiary">
                Your private document evidence is indexed here.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-blue-500/10 text-[11px] text-blue-300/80 flex items-center gap-1.5">
            <ShieldCheck size={13} className="shrink-0 text-blue-400" />
            <span>Isolated under your Cognito User ID</span>
          </div>
        </div>

        {/* CENTER COLUMN — LIFEOS CONNECTED INTELLIGENCE */}
        <div className="lg:col-span-4 rounded-xl border border-accent/30 bg-gradient-to-b from-accent/10 to-purple-500/10 p-4 flex flex-col justify-between space-y-3 shadow-lg relative">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} /> CONNECTED INSIGHT
              </span>
              <span className="text-[10px] text-accent font-mono">AI Bridge</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0e111a]/80 border border-accent/20 text-xs text-text-primary leading-relaxed">
              {connectedInsight || "LifeOS automatically correlates private document facts with live real-world updates, identifying deadline changes, missing requirements, and next steps."}
            </div>
          </div>

          {suggestedAction && (
            <a
              href={actionLink}
              className="w-full py-2 px-3 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-accent/20"
            >
              <span>{suggestedAction}</span>
              <ArrowRight size={13} />
            </a>
          )}
        </div>

        {/* RIGHT COLUMN — REAL WORLD (Public Knowledge) */}
        <div className="lg:col-span-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe size={14} /> REAL WORLD
              </span>
              <span className="text-[10px] text-text-tertiary font-mono">Public Sources</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              Official portals, government guidelines, university updates, and verified web documentation.
            </p>

            {publicSources.length > 0 ? (
              <div className="space-y-2">
                {publicSources.map((pub, idx) => (
                  <a
                    key={idx}
                    href={pub.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-400/40 transition-colors group text-xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-text-primary group-hover:text-purple-300 truncate max-w-[170px]">
                        {pub.title}
                      </span>
                      <ExternalLink size={12} className="text-text-tertiary group-hover:text-purple-300 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-text-tertiary font-mono">
                      <span>{pub.domain}</span>
                      <span>•</span>
                      <span className="text-purple-300">{pub.sourceType}</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-white/5 border border-dashed border-white/10 text-xs text-text-tertiary">
                Real-world web information is verified here.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-purple-500/10 text-[11px] text-purple-300/80 flex items-center gap-1.5">
            <Globe size={13} className="shrink-0 text-purple-400" />
            <span>Verified from public web portals</span>
          </div>
        </div>

      </div>
    </div>
  );
}
