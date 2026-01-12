"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Search,
  Package,
  Scale,
  Building2,
  FileText,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { ToolIcon } from "@/components/dynamic-icon";

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchResults = useQuery(
    api.globalSearch.search,
    debouncedQuery.length >= 2 ? { query: debouncedQuery, limit: 5 } : "skip"
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (event.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      router.push(href);
      setIsOpen(false);
      setQuery("");
    },
    [router]
  );

  const hasResults =
    searchResults &&
    (searchResults.tools.length > 0 ||
      searchResults.comparisons.length > 0 ||
      searchResults.companies.length > 0 ||
      searchResults.pages.length > 0);

  const isLoading = debouncedQuery.length >= 2 && searchResults === undefined;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label
        className="flex w-full items-stretch rounded-lg h-10 group focus-within:ring-2 focus-within:ring-primary/50 transition-all cursor-text"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="text-muted-foreground flex border-none bg-card items-center justify-center pl-4 rounded-l-lg">
          <Search className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none text-foreground focus:outline-0 bg-card border-none h-full placeholder:text-muted-foreground/50 px-4 pl-2 text-sm font-normal"
          placeholder="Search everything..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuery("");
              inputRef.current?.focus();
            }}
            className="flex items-center justify-center px-2 bg-card rounded-r-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {!query && (
          <div className="hidden sm:flex items-center pr-3 bg-card rounded-r-lg">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        )}
      </label>

      {isOpen && (query.length >= 2 || hasResults) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-[70vh] overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && debouncedQuery.length >= 2 && !hasResults && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No results found for &quot;{debouncedQuery}&quot;
            </div>
          )}

          {!isLoading && hasResults && (
            <div className="py-2">
              {searchResults.pages.length > 0 && (
                <div className="px-3 py-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Pages
                  </div>
                  {searchResults.pages.map((page) => (
                    <button
                      key={page.href}
                      onClick={() => handleSelect(page.href)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {page.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {page.description}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {searchResults.tools.length > 0 && (
                <div className="px-3 py-2 border-t border-border">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Tools
                  </div>
                  {searchResults.tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelect(`/tools/${tool.slug}`)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                        <ToolIcon toolSlug={tool.slug} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {tool.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {tool.tagline}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {searchResults.comparisons.length > 0 && (
                <div className="px-3 py-2 border-t border-border">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Comparisons
                  </div>
                  {searchResults.comparisons.map((comparison) => (
                    <button
                      key={comparison.id}
                      onClick={() =>
                        handleSelect(`/compare/${comparison.slug}`)
                      }
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {comparison.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {comparison.tool1Slug} vs {comparison.tool2Slug}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {searchResults.companies.length > 0 && (
                <div className="px-3 py-2 border-t border-border">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Companies
                  </div>
                  {searchResults.companies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() =>
                        handleSelect(`/companies/${company.slug}`)
                      }
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left group"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-card border border-border overflow-hidden">
                        {company.logoUrl ? (
                          <Image
                            src={company.logoUrl}
                            alt={company.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {company.name}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {debouncedQuery.length >= 2 && (
                <div className="px-3 py-2 border-t border-border">
                  <button
                    onClick={() => handleSelect(`/tools?search=${encodeURIComponent(debouncedQuery)}`)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Search all tools for &quot;{debouncedQuery}&quot;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
