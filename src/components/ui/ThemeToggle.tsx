import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary transition-all duration-200 shadow-sm ${className}`}
      aria-label="Toggle Light/Dark Theme"
    >
      {isDark ? (
        <Sun size={17} className="text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon size={17} className="text-indigo-600 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
