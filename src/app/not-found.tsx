import { Home, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PixelCard } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <PixelCard className="max-w-2xl w-full">
        <div className="flex flex-col items-center text-center space-y-6 p-8">
          <div className="relative">
            <div className="text-9xl font-bold text-primary/20">404</div>
            <Search className="w-16 h-16 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Page Not Found</h1>
            <p className="text-lg text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/">
              <PixelButton className="gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </PixelButton>
            </Link>
            <Link href="/tools">
              <PixelButton variant="outline" className="gap-2">
                <Search className="w-4 h-4" />
                Browse Tools
              </PixelButton>
            </Link>
            <PixelButton
              onClick={() => window.history.back()}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    </div>
  );
}
