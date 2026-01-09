"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { PixelCard } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { Users, Layers, ArrowLeft, Play } from "lucide-react";
import Link from "next/link";

export default function NewCollabSessionPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [sessionName, setSessionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useMutation(api.stackBuilderCollab.createSession);

  const handleCreate = async () => {
    if (!user) {
      setError("You must be signed in to create a session");
      return;
    }

    if (!sessionName.trim()) {
      setError("Please enter a session name");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const { shareCode } = await createSession({
        name: sessionName.trim(),
        hostUserId: user.id,
        hostName: user.fullName || user.username || "Host",
        hostAvatarUrl: user.imageUrl,
      });

      router.push(`/stack-builder/collab/${shareCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      setIsCreating(false);
    }
  };

  if (!isLoaded) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-center h-96">
          <PixelCard className="p-8 max-w-md w-full text-center">
            <Users className="w-12 h-12 mx-auto text-primary mb-4" />
            <h1 className="text-xl font-bold text-primary mb-2">Sign In Required</h1>
            <p className="text-muted-foreground text-sm mb-6">
              You need to be signed in to create a collaborative session.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/sign-in">
                <PixelButton>Sign In</PixelButton>
              </Link>
              <Link href="/stack-builder">
                <PixelButton variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </PixelButton>
              </Link>
            </div>
          </PixelCard>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex items-center justify-center min-h-[60vh]">
        <PixelCard className="p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              Start Collaborative Session
            </h1>
            <p className="text-muted-foreground text-sm">
              Build AI stacks together with your engineering team in real-time
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-primary text-xs mb-2 block">SESSION NAME</label>
              <PixelInput
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., Team Stack Planning"
                className="w-full"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="text-primary text-xs font-bold">FEATURES</h3>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Real-time cursor presence
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Synchronized node editing
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  AI stack scoring in real-time
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  Share link to invite teammates
                </li>
              </ul>
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <div className="flex gap-2">
              <Link href="/stack-builder" className="flex-1">
                <PixelButton variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Cancel
                </PixelButton>
              </Link>
              <PixelButton
                onClick={handleCreate}
                disabled={isCreating || !sessionName.trim()}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Session
                  </>
                )}
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      </div>
    </main>
  );
}
