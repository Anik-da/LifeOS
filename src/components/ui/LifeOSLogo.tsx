import React from 'react';

interface LifeOSLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function LifeOSLogo({ size = 28, className = '', showText = true }: LifeOSLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Enhanced Glowing 'L' Emblem SVG matching the brand design */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]"
      >
        <defs>
          <linearGradient id="logoGradMain" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#3b82f6" />
            <stop offset="80%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="logoGradHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Back glowing ambient shape */}
        <path
          d="M 46 10 C 26 24 22 55 24 74 C 26 84 38 90 56 90 C 74 90 84 76 84 62 C 84 48 70 42 54 48 C 38 54 30 70 30 78 C 30 60 36 28 46 10 Z"
          fill="url(#logoGradMain)"
        />

        {/* Glossy inner curve */}
        <path
          d="M 46 12 C 30 28 27 52 28 72 C 38 82 58 84 78 68 C 64 58 50 56 42 72 C 36 60 38 32 46 12 Z"
          fill="url(#logoGradHighlight)"
        />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center text-base font-extrabold tracking-tight leading-none">
            <span className="text-text-primary">Life</span>
            <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              OS
            </span>
          </div>
          <span className="text-[8px] font-bold text-text-tertiary uppercase tracking-widest mt-0.5">
            YOUR INFORMATION. CONNECTED.
          </span>
        </div>
      )}
    </div>
  );
}
