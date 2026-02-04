"use client";

import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useEffect, useState } from "react";
import { CollaborativeStackBuilder } from "@/components/collaborative-stack-builder";
import { PixelCard } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { Users, Layers, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CollabSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const code = (params.code as string)?.toUpperCase();

  const [guestName, setGuestName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  const session = useQuery(
    api.stackBuilderCollab.getSessionByShareCode,
    code ? { shareCode: code } : "skip"
  );

  const joinSession = useMutation(api.stackBuilderCollab.joinSession);

  useEffect(() => {
    if (session && user && !hasJoined) {
      handleJoin();
    }
  }, [session, user]);

  const handleJoin = async () => {
    if (!session || !code) return;

    const userName = user?.fullName || user?.username || guestName || "Anonymous";
    const userId = user?.id || `guest-${Date.now()}`;

    if (!user && !guestName.trim()) {
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      await joinSession({
        shareCode: code,
        userId,
        userName,
        userAvatarUrl: user?.imageUrl,
      });
      setHasJoined(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join session");
    } finally {
      setIsJoining(false);
    }
  };

  if (!isUserLoaded) {
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

  if (session === null) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-center h-96">
          <PixelCard className="p-8 max-w-md w-full text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
            <h1 className="text-xl font-bold text-primary mb-2">Session Not Found</h1>
            <p className="text-muted-foreground text-sm mb-6">
              This session may have ended or the code is incorrect.
            </p>
            <Link href="/stack-builder">
              <PixelButton>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Stack Builder
              </PixelButton>
            </Link>
          </PixelCard>
        </div>
      </main>
    );
  }

  if (session === undefined) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Finding session...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!hasJoined && !user) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-center h-96">
          <PixelCard className="p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 mx-auto text-primary mb-4" />
              <h1 className="text-xl font-bold text-primary mb-2">Join Collaborative Session</h1>
              <p className="text-muted-foreground text-sm">
                You&apos;re joining <span className="text-primary font-bold">{session.name}</span>
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Hosted by {session.hostName}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-primary text-xs mb-2 block">YOUR NAME</label>
                <PixelInput
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}

              <PixelButton
                onClick={handleJoin}
                disabled={isJoining || !guestName.trim()}
                className="w-full"
              >
                {isJoining ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Join Session
                  </>
                )}
              </PixelButton>

              <p className="text-muted-foreground text-xs text-center">
                Or{" "}
                <Link href="/sign-in" className="text-primary hover:underline">
                  sign in
                </Link>{" "}
                for a better experience
              </p>
            </div>
          </PixelCard>
        </div>
      </main>
    );
  }

  if (!hasJoined) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Joining session...</p>
          </div>
        </div>
      </main>
    );
  }

  const isHost = session.hostUserId === user?.id;

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <CollaborativeStackBuilder sessionId={session._id} isHost={isHost} />
    </main>
  );
}
