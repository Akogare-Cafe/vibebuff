/* eslint-disable react-compiler/react-compiler */
"use client";

import { useState } from "react";
import { Send, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { PixelButton } from "./pixel-button";
import { PixelCard } from "./pixel-card";
import type { ErrorReport } from "@/lib/error-reporter";

interface ErrorReportDialogProps {
  report: ErrorReport;
  onSubmit: (message: string) => Promise<boolean>;
  onClose: () => void;
}

export function ErrorReportDialog({
  report,
  onSubmit,
  onClose,
}: ErrorReportDialogProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    const success = await onSubmit(message);
    setIsSubmitting(false);

    if (success) {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <PixelCard className="max-w-md w-full">
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <Send className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold">Report Sent!</h3>
            <p className="text-muted-foreground">
              Thank you for helping us improve VibeBuff.
            </p>
          </div>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <PixelCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">Report Error</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Help us fix this issue by describing what happened
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                What were you doing when this happened?
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the steps that led to this error..."
                className="w-full min-h-[120px] px-3 py-2 bg-background border-2 border-border rounded-lg focus:outline-none focus:border-primary resize-none"
                disabled={isSubmitting}
              />
            </div>

            {report.screenshot && (
              <div>
                <button
                  onClick={() => setShowScreenshot(!showScreenshot)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                  {showScreenshot ? "Hide" : "Show"} Screenshot
                </button>
                {showScreenshot && (
                  <div className="mt-2 border-2 border-border rounded-lg overflow-hidden">
                    <img
                      src={report.screenshot}
                      alt="Error screenshot"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>The following information will be included:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Error message and type</li>
                <li>Screenshot of the page</li>
                <li>Browser and device information</li>
                <li>Page URL</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <PixelButton
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </PixelButton>
            <PixelButton
              onClick={handleSubmit}
              disabled={!message.trim() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Report
                </>
              )}
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    </div>
  );
}
