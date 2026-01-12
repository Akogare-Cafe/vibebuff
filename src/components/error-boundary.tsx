"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.state.hasError &&
      prevProps.resetKeys !== this.props.resetKeys
    ) {
      this.setState({ hasError: false, error: null });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent error={this.state.error} resetError={this.resetError} />
      );
    }

    return this.props.children;
  }
}

export function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <PixelCard className="max-w-2xl w-full">
        <div className="flex flex-col items-center text-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
            <AlertTriangle className="w-16 h-16 text-red-500 relative z-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-red-500">
              Something went wrong
            </h2>
            <p className="text-muted-foreground">
              We encountered an unexpected error. Don&apos;t worry, your progress is safe.
            </p>
          </div>

          {isDev && (
            <div className="w-full bg-red-950/20 border border-red-500/30 rounded-lg p-4 text-left">
              <div className="flex items-start gap-2 mb-2">
                <Bug className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-red-400 break-words">
                    {error.name}: {error.message}
                  </p>
                </div>
              </div>
              {error.stack && (
                <pre className="text-xs text-red-300/70 overflow-x-auto mt-2 whitespace-pre-wrap break-words">
                  {error.stack}
                </pre>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            <PixelButton onClick={resetError} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </PixelButton>
            <PixelButton
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    </div>
  );
}

export function CompactErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-red-500 mb-1">
            Error loading component
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {error.message}
          </p>
          <PixelButton onClick={resetError} size="sm" className="gap-2">
            <RefreshCw className="w-3 h-3" />
            Retry
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
