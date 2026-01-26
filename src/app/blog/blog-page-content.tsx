"use client";

import { BlogList } from "@/components/blog-list";
import { BlogPromoSection } from "@/components/blog-promo-section";
import { PageHeader } from "@/components/page-header";
import { PageLayout } from "@/components/page-layout";
import { BookOpen } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog-types";

interface BlogPageContentProps {
  posts: BlogPostMeta[];
}

export function BlogPageContent({ posts }: BlogPageContentProps) {
  return (
    <PageLayout maxWidth="xl">
      <PageHeader
        title="DEVELOPER BLOG"
        description="Expert guides, tutorials, and insights on choosing the right tech stack for your projects. Stay ahead with the latest developer tools and best practices."
        icon={BookOpen}
      />

      <BlogList posts={posts} />

      <section className="mb-12">
        <BlogPromoSection />
      </section>

      <section className="border-4 border-primary bg-card p-8 text-center">
        <h2 className="text-primary text-sm mb-4">
          STAY UPDATED WITH TECH INSIGHTS
        </h2>
        <p className="text-muted-foreground text-xs mb-6 max-w-xl mx-auto">
          Get weekly updates on the latest developer tools, framework
          comparisons, and tech stack recommendations delivered to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="ENTER YOUR EMAIL..."
            className="flex-1 bg-background border-4 border-border text-primary px-4 py-2 text-sm focus:border-primary outline-none"
          />
          <button className="bg-primary text-background px-6 py-2 text-sm hover:bg-primary transition-colors">
            SUBSCRIBE
          </button>
        </div>
      </section>
    </PageLayout>
  );
}
