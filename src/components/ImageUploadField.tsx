import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Link as LinkIcon, X, Check, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';

export interface ImageUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  aspectRatio?: 'video' | 'portrait' | 'square' | 'auto';
  compact?: boolean;
  className?: string;
}

// Client-side lightweight image optimizer using HTML Canvas
async function optimizeImageFile(file: File, maxDim = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG or gif, read as data URL directly to preserve animation/vector
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Export as WebP if supported, fallback to JPEG
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // ignore
        }
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  label,
  required = false,
  placeholder = 'https://images.unsplash.com/... or upload local image file',
  helperText,
  aspectRatio = 'video',
  compact = false,
  className = ''
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>(value && value.startsWith('data:') ? 'upload' : 'upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If initial value is an HTTP URL, default tab to 'url'
  useEffect(() => {
    if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
      setMode('url');
    }
  }, []);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }

    // Limit to 20MB source file
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Image file size exceeds 20MB limit. Please choose a smaller image.');
      return;
    }

    setIsProcessing(true);
    try {
      const optimizedDataUrl = await optimizeImageFile(file);
      onChange(optimizedDataUrl);
      setMode('upload');
    } catch {
      setErrorMsg('Failed to process image file. Please try again or use an image URL.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files[0]) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        handleFile(file);
      }
    }
  };

  const aspectClass =
    aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : 'min-h-[140px]';

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and mode toggle */}
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label className="text-[11px] font-semibold text-zinc-300 block">
            {label} {required && <span className="text-emerald-400">*</span>}
          </label>
        )}

        {/* Mode switch */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800 text-[10px] font-semibold ml-auto">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
              mode === 'upload'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>Upload Image</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
              mode === 'url'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Mode: Direct File Upload / Dropzone */}
      {mode === 'upload' ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onPaste={handlePaste}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer text-center overflow-hidden ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900/80'
          } ${compact ? 'p-3' : 'p-4 sm:p-5'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          {isProcessing ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Optimizing & loading image...</span>
            </div>
          ) : value ? (
            <div className="space-y-3">
              <div className={`relative ${aspectClass} max-h-56 mx-auto rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-md`}>
                <img
                  src={value}
                  alt="Uploaded preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-950/80 text-rose-400 hover:text-rose-300 hover:bg-zinc-900 border border-zinc-800 transition-colors shadow-lg cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Image uploaded
                </span>
                <span>•</span>
                <span className="hover:text-white underline font-medium">Click or drop to replace</span>
              </div>
            </div>
          ) : (
            <div className="py-4 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <div className="w-10 h-10 rounded-2xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-zinc-300 shadow-inner group-hover:scale-105 transition-transform">
                <UploadCloud className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-zinc-200">
                  Click to upload image or drag & drop here
                </p>
                <p className="text-[10px] text-zinc-500">
                  PNG, JPG, WebP, GIF, SVG up to 20MB
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mode: Image URL Input */
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required={required}
              className="w-full pl-3.5 pr-8 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {value && (
            <div className={`relative ${aspectClass} max-h-48 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800`}>
              <img
                src={value}
                alt="URL Preview"
                className="w-full h-full object-cover"
                onError={() => setErrorMsg('Could not load image from this URL. Please verify the link.')}
                onLoad={() => setErrorMsg(null)}
              />
            </div>
          )}
        </div>
      )}

      {helperText && (
        <p className="text-[10px] text-zinc-500 leading-tight">
          {helperText}
        </p>
      )}
    </div>
  );
};
