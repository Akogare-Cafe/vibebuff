import { Search, Store, Trophy, Filter, LayoutGrid } from "lucide-react";
import {
  TrendingSectionSkeleton,
  NewToolsSectionSkeleton,
  CategoriesSkeleton,
  FeaturedToolSkeleton,
  ToolsGridSkeleton,
  SkeletonPulse,
} from "@/components/skeletons";
import { AdDisplay } from "@/components/ad-display";

export default function ToolsLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Store className="w-4 h-4" />
              <SkeletonPulse className="h-3 w-28" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Tech Stack Armory</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">Equip yourself with legendary frameworks and libraries. Check requirements before acquiring.</p>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-transparent border border-yellow-500/50 text-yellow-400 text-sm font-medium rounded flex items-center gap-2 opacity-50">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboards</span>
            </div>
            <div className="px-4 py-2 border border-border text-foreground text-sm font-medium rounded flex items-center gap-2 opacity-50">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </div>
            <SkeletonPulse className="h-10 w-32 rounded" />
          </div>
        </div>

        <div className="flex-1 max-w-lg py-4">
          <label className="flex w-full items-stretch rounded-lg h-10 border border-border opacity-50">
            <div className="text-muted-foreground flex border-none items-center justify-center pl-4 rounded-l-lg">
              <Search className="w-5 h-5" />
            </div>
            <input
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none text-foreground focus:outline-0 bg-transparent border-none h-full placeholder:text-muted-foreground/50 px-4 pl-2 text-sm font-normal"
              placeholder="Search armory for tools..."
              disabled
            />
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TrendingSectionSkeleton />
          <NewToolsSectionSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start mt-6">
          <aside className="lg:col-span-3 flex flex-col gap-4 lg:gap-6 lg:sticky lg:top-24">
            <CategoriesSkeleton />

            <div className="border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <SkeletonPulse className="h-4 w-20" />
              </div>
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <SkeletonPulse className="size-4 rounded" />
                    <SkeletonPulse className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>

            <AdDisplay placement="sidebar" />
          </aside>

          <section className="lg:col-span-9 flex flex-col gap-8">
            <FeaturedToolSkeleton />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                  Available Tools
                </h3>
                <SkeletonPulse className="h-3 w-32" />
              </div>
              <ToolsGridSkeleton count={12} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
