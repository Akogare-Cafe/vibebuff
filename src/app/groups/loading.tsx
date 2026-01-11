import { Users, Search, Plus, ChevronLeft } from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { GroupGridSkeleton } from "@/components/skeletons";
import Link from "next/link";

export default function GroupsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/community" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to Community
          </Link>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <h1 className="font-heading text-foreground text-2xl">GROUPS</h1>
            </div>
            <Link href="/groups/new">
              <PixelButton>
                <Plus className="w-4 h-4 mr-2" /> Create Group
              </PixelButton>
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            Join groups to connect with others who share your tech stack interests.
          </p>
        </div>

        <div className="mb-8">
          <div className="max-w-md relative">
            <PixelInput
              placeholder="Search groups..."
              disabled
              className="w-full pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <GroupGridSkeleton count={9} />
      </main>
    </div>
  );
}
