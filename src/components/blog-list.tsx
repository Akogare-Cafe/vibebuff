"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Calendar, Clock, Search, Filter, X } from "lucide-react";
import { BLOG_CATEGORIES, type BlogCategory, type BlogPostMeta } from "@/lib/blog-types";

interface BlogListProps {
  posts: BlogPostMeta[];
}

export function BlogList({ posts }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, searchQuery, selectedCategory]);

  const featuredPosts = filteredPosts.filter((post) => post.featured);
  const recentPosts = filteredPosts.filter((post) => !post.featured);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: posts.length };
    BLOG_CATEGORIES.forEach((cat) => {
      counts[cat] = posts.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [posts]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const hasActiveFilters = searchQuery !== "" || selectedCategory !== "all";

  return (
    <>
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="SEARCH ARTICLES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border-4 border-border text-primary pl-10 pr-4 py-2 text-sm focus:border-primary outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border-4 text-sm transition-colors ${
              showFilters || selectedCategory !== "all"
                ? "border-primary bg-primary text-background"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <Filter className="w-4 h-4" />
            FILTER
            {selectedCategory !== "all" && (
              <span className="ml-1 px-1.5 py-0.5 bg-background text-primary text-[10px]">
                1
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="border-4 border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-primary text-xs">CATEGORIES</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-primary text-xs flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  CLEAR ALL
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 text-xs border-2 transition-colors ${
                  selectedCategory === "all"
                    ? "border-primary bg-primary text-background"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                ALL ({categoryCounts.all})
              </button>
              {BLOG_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-xs border-2 transition-colors ${
                    selectedCategory === category
                      ? "border-primary bg-primary text-background"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {category.toUpperCase()} ({categoryCounts[category]})
                </button>
              ))}
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              Showing {filteredPosts.length} of {posts.length} articles
            </span>
            {selectedCategory !== "all" && (
              <span className="px-2 py-0.5 border border-primary text-primary">
                {selectedCategory}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 border border-primary text-primary">
                &quot;{searchQuery}&quot;
              </span>
            )}
          </div>
        )}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="border-4 border-border bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            No articles found matching your criteria.
          </p>
          <button
            onClick={clearFilters}
            className="text-primary hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {featuredPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" /> FEATURED ARTICLES
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}

          {recentPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />{" "}
                {featuredPosts.length > 0 ? "MORE ARTICLES" : "ALL ARTICLES"}
              </h2>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <BlogCardCompact key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

function BlogCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="border-4 border-border bg-card p-6 h-full hover:border-primary transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] px-2 py-0.5 border border-primary/50 text-primary/80">
            {post.category.toUpperCase()}
          </span>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <h3 className="text-primary text-sm mb-3 leading-relaxed">
          {post.title}
        </h3>
        <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
          {post.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[6px] px-2 py-1 border border-border text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
        </div>
      </article>
    </Link>
  );
}

function BlogCardCompact({ post }: { post: BlogPostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="border-4 border-border bg-card p-6 hover:border-primary transition-colors cursor-pointer">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] px-2 py-0.5 border border-primary/50 text-primary/80">
                {post.category.toUpperCase()}
              </span>
            </div>
            <h3 className="text-primary text-sm mb-2">{post.title}</h3>
            <p className="text-muted-foreground text-xs">{post.description}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
            <span>{post.readTime}</span>
            <span>
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
