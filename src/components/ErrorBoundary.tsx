import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Suppress exposing technical errors to user; log for telemetry only
    console.error('Application Error caught by boundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[280px] p-8 flex flex-col items-center justify-center text-center rounded-3xl bg-[#0a0d14]/90 border border-zinc-800 text-zinc-300">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-center text-rose-400 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {this.props.fallbackTitle || 'Unable to load content'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mt-1 mb-6 leading-relaxed">
            {this.props.fallbackMessage ||
              'A temporary issue occurred while loading this section. Please try refreshing or check back in a moment.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 border border-zinc-700 transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
