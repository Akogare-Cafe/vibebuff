"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Search,
  Scale,
  Building2,
  FileText,
  X,
  Loader2,
  ArrowRight,
  Sparkles,
  Command,
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

  const isFocused = isOpen || query.length > 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`relative rounded-xl transition-all duration-300 ${
          isFocused
            ? "shadow-[0_0_20px_rgba(127,19,236,0.15)] ring-1 ring-primary/30"
            : "hover:shadow-[0_0_15px_rgba(127,19,236,0.08)]"
        }`}
      >
        <div
          className={`absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 transition-opacity duration-300 ${
            isFocused ? "opacity-100" : "group-hover:opacity-50"
          }`}
        />
        <label
          className="relative flex w-full items-stretch rounded-xl h-11 group cursor-text bg-card/80 backdrop-blur-sm border border-border/50 overflow-hidden"
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
        >
          <div className={`flex items-center justify-center pl-4 transition-colors duration-200 ${
            isFocused ? "text-primary" : "text-muted-foreground"
          }`}>
            <Search className={`w-4 h-4 transition-transform duration-200 ${isFocused ? "scale-110" : ""}`} />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden bg-transparent text-foreground focus:outline-none h-full placeholder:text-muted-foreground/60 px-3 text-sm font-normal tracking-wide"
            placeholder="Search tools, comparisons, companies..."
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
              className="flex items-center justify-center px-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {!query && (
            <div className="hidden sm:flex items-center gap-1.5 pr-3">
              <kbd className="inline-flex h-6 items-center gap-1 rounded-md bg-muted/80 border border-border/60 px-2 font-mono text-[11px] font-medium text-muted-foreground shadow-sm">
                <Command className="w-3 h-3" />
                <span>K</span>
              </kbd>
            </div>
          )}
        </label>
      </div>

      {isOpen && (query.length >= 2 || hasResults) && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl shadow-black/20 z-50 max-h-[70vh] overflow-y-auto overflow-x-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none rounded-xl" />
          
          {isLoading && (
            <div className="relative flex items-center justify-center gap-3 py-10">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
                <Loader2 className="relative w-5 h-5 animate-spin text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Searching...</span>
            </div>
          )}

          {!isLoading && debouncedQuery.length >= 2 && !hasResults && (
            <div className="relative py-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-3">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No results found for <span className="text-foreground font-medium">&quot;{debouncedQuery}&quot;</span>
              </p>
            </div>
          )}

          {!isLoading && hasResults && (
            <div className="relative py-2">
              {searchResults.pages.length > 0 && (
                <div className="px-2 py-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    <FileText className="w-3 h-3" />
                    Pages
                  </div>
                  {searchResults.pages.map((page) => (
                    <button
                      key={page.href}
                      onClick={() => handleSelect(page.href)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-all duration-150 text-left group"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/10">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {page.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {page.description}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </button>
                  ))}
                </div>
              )}

              {searchResults.tools.length > 0 && (
                <div className="px-2 py-2">
                  {searchResults.pages.length > 0 && <div className="h-px bg-border/50 mx-3 mb-2" />}
                  <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    Tools
                  </div>
                  {searchResults.tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSelect(`/tools/${tool.slug}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-all duration-150 text-left group"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-card ring-1 ring-border/60 overflow-hidden">
                        {tool.logoUrl ? (
                          <Image
                            src={tool.logoUrl}
                            alt={tool.name}
                            width={36}
                            height={36}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ToolIcon toolSlug={tool.slug} className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {tool.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {tool.tagline}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </button>
                  ))}
                </div>
              )}

              {searchResults.comparisons.length > 0 && (
                <div className="px-2 py-2">
                  {(searchResults.pages.length > 0 || searchResults.tools.length > 0) && <div className="h-px bg-border/50 mx-3 mb-2" />}
                  <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    <Scale className="w-3 h-3" />
                    Comparisons
                  </div>
                  {searchResults.comparisons.map((comparison) => (
                    <button
                      key={comparison.id}
                      onClick={() =>
                        handleSelect(`/compare/${comparison.slug}`)
                      }
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-all duration-150 text-left group"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 text-orange-500 ring-1 ring-orange-500/10">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {comparison.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {comparison.tool1Slug} vs {comparison.tool2Slug}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </button>
                  ))}
                </div>
              )}

              {searchResults.companies.length > 0 && (
                <div className="px-2 py-2">
                  {(searchResults.pages.length > 0 || searchResults.tools.length > 0 || searchResults.comparisons.length > 0) && <div className="h-px bg-border/50 mx-3 mb-2" />}
                  <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    <Building2 className="w-3 h-3" />
                    Companies
                  </div>
                  {searchResults.companies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() =>
                        handleSelect(`/companies/${company.slug}`)
                      }
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-all duration-150 text-left group"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-card ring-1 ring-border/60 overflow-hidden">
                        {company.logoUrl ? (
                          <Image
                            src={company.logoUrl}
                            alt={company.name}
                            width={36}
                            height={36}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {company.name}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </button>
                  ))}
                </div>
              )}

              {debouncedQuery.length >= 2 && (
                <div className="px-3 py-3 border-t border-border/50 bg-muted/30">
                  <button
                    onClick={() => handleSelect(`/tools?search=${encodeURIComponent(debouncedQuery)}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-all duration-150 ring-1 ring-primary/20 hover:ring-primary/30"
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
