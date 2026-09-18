export function LoadingSkeleton({ variant = 'card' }: { variant?: 'card' | 'text' | 'list' | 'dashboard' | 'detail' | 'workflow' }) {
  if (variant === 'dashboard') {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="space-y-2">
          <div className="shimmer h-8 w-64 rounded-lg" />
          <div className="shimmer h-4 w-80 rounded" />
        </div>
        <div className="shimmer h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="shimmer h-64 rounded-xl" />
          <div className="shimmer h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3 animate-fadeIn">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="shimmer h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
        <div className="shimmer h-96 rounded-xl" />
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'workflow') {
    return (
      <div className="flex flex-col items-center gap-4 py-12 animate-fadeIn">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-4">
            <div className="shimmer h-16 w-64 rounded-xl" />
            {i < 4 && <div className="shimmer h-6 w-px" />}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="space-y-2 animate-fadeIn">
        <div className="shimmer h-4 w-full rounded" />
        <div className="shimmer h-4 w-3/4 rounded" />
        <div className="shimmer h-4 w-5/6 rounded" />
      </div>
    );
  }

  return <div className="shimmer h-32 rounded-xl animate-fadeIn" />;
}
