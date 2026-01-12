"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Home, Shield, Flag } from "lucide-react";
import { PixelCard } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { ErrorReportDialog } from "@/components/error-report-dialog";
import { createErrorReport, submitErrorReport, type ErrorReport } from "@/lib/error-reporter";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [errorReport, setErrorReport] = useState<ErrorReport | null>(null);

  useEffect(() => {
    console.error("Admin page error:", error);
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
    <div className="container mx-auto px-4 py-12">
      <PixelCard className="max-w-xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-6 p-8">
          <div className="relative">
            <Shield className="w-16 h-16 text-red-500" />
            <AlertTriangle className="w-8 h-8 text-red-500 absolute -bottom-1 -right-1" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-red-500">
              Admin Panel Error
            </h2>
            <p className="text-muted-foreground">
              An error occurred in the admin panel. Please try again.
            </p>
          </div>

          <div className="flex gap-3">
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
              Report
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
