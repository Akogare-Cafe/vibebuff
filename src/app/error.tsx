"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Home, Flag } from "lucide-react";
import { PixelCard } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { ErrorReportDialog } from "@/components/error-report-dialog";
import { createErrorReport, submitErrorReport, type ErrorReport } from "@/lib/error-reporter";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [errorReport, setErrorReport] = useState<ErrorReport | null>(null);

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const handleReportClick = async () => {
    const report = await createErrorReport(error);
    setErrorReport(report);
    setShowReportDialog(true);
  };

  const handleSubmitReport = async (userMessage: string) => {
    if (!errorReport) return false;
    return await submitErrorReport(errorReport, userMessage);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <PixelCard className="max-w-2xl w-full">
          <div className="flex flex-col items-center text-center space-y-6 p-8">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
              <AlertTriangle className="w-20 h-20 text-red-500 relative z-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-red-500">
                Oops! Something broke
              </h1>
              <p className="text-lg text-muted-foreground">
                We encountered an unexpected error. Your data is safe.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <PixelButton onClick={reset} className="gap-2">
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
