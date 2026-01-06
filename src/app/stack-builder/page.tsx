"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import { VisualStackBuilder } from "@/components/visual-stack-builder";

interface InitialTool {
  name: string;
  category: string;
  tagline: string;
}

function StackBuilderContent() {
  const searchParams = useSearchParams();
  
  const initialTools = useMemo(() => {
    const toolsParam = searchParams.get("tools");
    if (!toolsParam) return undefined;
    
    try {
      const parsed = JSON.parse(toolsParam) as InitialTool[];
      return Array.isArray(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }, [searchParams]);

  return <VisualStackBuilder initialTools={initialTools} />;
}

export default function StackBuilderPage() {
  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <StackBuilderContent />
      </Suspense>
    </main>
  );
}
