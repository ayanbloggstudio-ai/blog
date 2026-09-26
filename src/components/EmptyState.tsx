import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  className = '',
  compact = false
}) => {
  return (
    <div
      className={`text-center rounded-3xl border border-zinc-850/80 bg-[#0a0d14]/70 backdrop-blur-sm ${
        compact ? 'py-8 px-4' : 'py-14 sm:py-18 px-6 sm:px-8'
      } ${className}`}
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-4 shadow-inner">
        <Icon className="w-6 h-6 text-zinc-400" aria-hidden="true" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mt-1.5 leading-relaxed">
          {description}
        </p>
      )}

      {(actionLabel || secondaryLabel) && (
        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              type="button"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              {actionLabel}
            </button>
          )}

          {secondaryLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              type="button"
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-750 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
