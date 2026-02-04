import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { ShieldOff, Globe } from "lucide-react";

export default function BlockedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <PixelCard className="max-w-md w-full">
        <PixelCardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Globe className="w-16 h-16 text-muted-foreground" />
              <ShieldOff className="w-8 h-8 text-destructive absolute -bottom-1 -right-1" />
            </div>
          </div>
          <PixelCardTitle className="text-2xl">Access Restricted</PixelCardTitle>
        </PixelCardHeader>
        <PixelCardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We apologize, but access to VibeBuff is currently restricted in your region.
          </p>
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact our support team.
          </p>
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}
