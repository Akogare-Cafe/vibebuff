import { Puzzle, Search } from "lucide-react";
import { PixelInput } from "@/components/pixel-input";
import { ToolCardSkeleton } from "@/components/skeletons";

export default function McpLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Puzzle className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-foreground text-2xl">MCP SERVERS</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Discover Model Context Protocol servers to extend AI capabilities.
          </p>
        </div>

        <div className="mb-6">
          <div className="max-w-md relative">
            <PixelInput
              placeholder="Search MCP servers..."
              disabled
              className="w-full pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <ToolCardSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
