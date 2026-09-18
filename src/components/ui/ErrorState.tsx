import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  secondaryAction,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  secondaryAction?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fadeIn">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm leading-relaxed mb-6">{message}</p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <button onClick={onRetry} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
            <RefreshCw size={14} />
            Retry
          </button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
}
