"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { ReactNode } from "react";

export function ErrorBoundaryProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("App error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
