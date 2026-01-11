import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { PixelInput } from "@/components/pixel-input";
import { PixelButton } from "@/components/pixel-button";
import { ToolCardSkeleton } from "@/components/skeletons";

export default function ToolsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/30 py-3">
        <div className="h-[72px] flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Loading tools...</span>
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <div className="max-w-2xl mx-auto relative mb-4">
            <PixelInput
              placeholder="Search tools..."
              disabled
              className="w-full pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <PixelButton key={i} variant="outline" size="sm" disabled>
                <span className="w-16 h-4 bg-muted rounded animate-pulse" />
              </PixelButton>
            ))}
          </div>

          <div className="flex gap-2 justify-center">
            <PixelButton variant="outline" size="sm" disabled>
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filter
            </PixelButton>
            <PixelButton variant="outline" size="sm" disabled>
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Sort
            </PixelButton>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <ToolCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
