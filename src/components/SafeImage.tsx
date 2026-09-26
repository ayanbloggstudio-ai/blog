import React, { useState } from 'react';
import { ImageOff, Sparkles, BookOpen, Package } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'product' | 'novel' | 'article' | 'avatar' | 'general';
  fallbackTitle?: string;
  containerClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Image',
  className = '',
  containerClassName = '',
  fallbackType = 'general',
  fallbackTitle,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getIcon = () => {
    switch (fallbackType) {
      case 'novel':
        return <BookOpen className="w-8 h-8 text-indigo-400/80 stroke-1" />;
      case 'product':
        return <Package className="w-8 h-8 text-emerald-400/80 stroke-1" />;
      case 'article':
        return <Sparkles className="w-8 h-8 text-cyan-400/80 stroke-1" />;
      default:
        return <ImageOff className="w-8 h-8 text-zinc-500 stroke-1" />;
    }
  };

  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full min-h-[140px] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-zinc-900 via-[#0b0e14] to-zinc-950 border border-zinc-800/80 text-zinc-400 select-none ${containerClassName} ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center mb-2 shadow-inner">
          {getIcon()}
        </div>
        {fallbackTitle && (
          <span className="text-xs font-semibold text-zinc-400 text-center line-clamp-1 max-w-[90%]">
            {fallbackTitle}
          </span>
        )}
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mt-1">
          {fallbackType === 'novel' ? 'No Cover' : fallbackType === 'product' ? 'No Image' : 'PRISM'}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-zinc-900/80 animate-pulse flex items-center justify-center z-10" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        decoding="async"
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
};
