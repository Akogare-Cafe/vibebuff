"use client";

import React, { useState } from "react";
import { AlertTriangle, RefreshCw, Home, Flag } from "lucide-react";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { ErrorReportDialog } from "./error-report-dialog";
import { createErrorReport, submitErrorReport, type ErrorReport } from "@/lib/error-reporter";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  resetError: () => void;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    this.setState({ errorInfo });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.state.hasError &&
      prevProps.resetKeys !== this.props.resetKeys
    ) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error} 
          errorInfo={this.state.errorInfo || undefined}
          resetError={this.resetError} 
        />
      );
    }

    return this.props.children;
  }
}

export function DefaultErrorFallback({ error, errorInfo, resetError }: ErrorFallbackProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [errorReport, setErrorReport] = useState<ErrorReport | null>(null);

  const handleReportClick = async () => {
    const report = await createErrorReport(
      error,
      errorInfo?.componentStack || undefined
    );
    setErrorReport(report);
    setShowReportDialog(true);
  };

  const handleSubmitReport = async (userMessage: string) => {
    if (!errorReport) return false;
    return await submitErrorReport(errorReport, userMessage);
  };

  return (
    <>
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

            <div className="flex flex-wrap gap-3 justify-center">
              <PixelButton onClick={resetError} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </PixelButton>
              <PixelButton
                onClick={handleReportClick}
                variant="outline"
                className="gap-2"
              >
                <Flag className="w-4 h-4" />
                Report Issue
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

      {showReportDialog && errorReport && (
        <ErrorReportDialog
          report={errorReport}
          onSubmit={handleSubmitReport}
          onClose={() => setShowReportDialog(false)}
        />
      )}
    </>
  );
}

export function CompactErrorFallback({ error, errorInfo, resetError }: ErrorFallbackProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [errorReport, setErrorReport] = useState<ErrorReport | null>(null);

  const handleReportClick = async () => {
    const report = await createErrorReport(
      error,
      errorInfo?.componentStack || undefined
    );
    setErrorReport(report);
    setShowReportDialog(true);
  };

  const handleSubmitReport = async (userMessage: string) => {
    if (!errorReport) return false;
    return await submitErrorReport(errorReport, userMessage);
  };

  return (
    <>
      <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-500 mb-1">
              Error loading component
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Something went wrong while loading this section.
            </p>
            <div className="flex gap-2">
              <PixelButton onClick={resetError} size="sm" className="gap-2">
                <RefreshCw className="w-3 h-3" />
                Retry
              </PixelButton>
              <PixelButton onClick={handleReportClick} size="sm" variant="outline" className="gap-2">
                <Flag className="w-3 h-3" />
                Report
              </PixelButton>
            </div>
          </div>
        </div>
      </div>

      {showReportDialog && errorReport && (
        <ErrorReportDialog
          report={errorReport}
          onSubmit={handleSubmitReport}
          onClose={() => setShowReportDialog(false)}
        />
      )}
    </>
  );
}
