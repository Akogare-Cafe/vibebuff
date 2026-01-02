"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function ComparisonViewTracker({ slug }: { slug: string }) {
  const incrementViews = useMutation(api.seo.incrementComparisonViews);

  useEffect(() => {
    incrementViews({ slug });
  }, [slug, incrementViews]);

  return null;
}
