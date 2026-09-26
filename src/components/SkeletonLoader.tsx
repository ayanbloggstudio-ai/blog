import React from 'react';

export const SkeletonCard: React.FC<{ layoutVariant?: 'default' | 'horizontal' | 'compact' }> = ({
  layoutVariant = 'default'
}) => {
  if (layoutVariant === 'compact') {
    return (
      <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-zinc-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-zinc-800 rounded w-3/4" />
          <div className="h-2.5 bg-zinc-800/60 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (layoutVariant === 'horizontal') {
    return (
      <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48 h-36 rounded-2xl bg-zinc-800 shrink-0" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 bg-zinc-800 rounded w-2/3" />
          <div className="h-3 bg-zinc-800/60 rounded w-full" />
          <div className="h-3 bg-zinc-800/60 rounded w-4/5" />
          <div className="pt-2 flex items-center gap-2">
            <div className="h-3 bg-zinc-800/80 rounded w-16" />
            <div className="h-3 bg-zinc-800/80 rounded w-20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden animate-pulse">
      <div className="w-full aspect-[16/10] bg-zinc-800" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-zinc-800/70 rounded w-1/4" />
        <div className="h-4 bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-800/50 rounded w-full" />
        <div className="h-3 bg-zinc-800/50 rounded w-5/6" />
        <div className="pt-2 flex items-center justify-between">
          <div className="h-3 bg-zinc-800/60 rounded w-20" />
          <div className="h-3 bg-zinc-800/60 rounded w-14" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number; columns?: number }> = ({
  count = 6,
  columns = 3
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-5 sm:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export const SkeletonProductCard: React.FC = () => {
  return (
    <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 animate-pulse space-y-4">
      <div className="w-full aspect-video rounded-2xl bg-zinc-800" />
      <div className="space-y-2">
        <div className="h-3 bg-zinc-800/60 rounded w-1/3" />
        <div className="h-4 bg-zinc-800 rounded w-2/3" />
        <div className="h-3 bg-zinc-800/50 rounded w-full" />
      </div>
      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
        <div className="h-3 bg-zinc-800/60 rounded w-16" />
        <div className="h-3 bg-zinc-800/60 rounded w-20" />
      </div>
    </div>
  );
};

export const SkeletonNovelCard: React.FC = () => {
  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden animate-pulse">
      <div className="w-full aspect-[3/4] bg-zinc-800" />
      <div className="p-3.5 space-y-2">
        <div className="h-2.5 bg-zinc-800/70 rounded w-1/3" />
        <div className="h-3.5 bg-zinc-800 rounded w-4/5" />
        <div className="h-2.5 bg-zinc-800/50 rounded w-full" />
        <div className="pt-2 flex items-center justify-between">
          <div className="h-2.5 bg-zinc-800/60 rounded w-12" />
          <div className="h-2.5 bg-zinc-800/60 rounded w-14" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonTableRow: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-zinc-850">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-3 px-3">
          <div className="h-3 bg-zinc-800 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
};
