"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import Link from "next/link";
import {
  User,
  Users,
  Trophy,
  Swords,
  Layers,
  Map,
  ChevronLeft,
  UserPlus,
  UserMinus,
  UserCheck,
  Clock,
  Ban,
  Zap,
  Star,
  BarChart3,
} from "lucide-react";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user: currentUser } = useUser();

  const profile = useQuery(api.userProfiles.getProfile, { clerkId: userId });
  const userRank = useQuery(api.userProfiles.getUserRank, { clerkId: userId });
  const friendshipStatus = useQuery(
    api.friends.getFriendshipStatus,
    currentUser?.id ? { userId: currentUser.id, otherUserId: userId } : "skip"
  );

  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);
  const acceptFriendRequest = useMutation(api.friends.acceptFriendRequest);
  const removeFriend = useMutation(api.friends.removeFriend);
  const blockUser = useMutation(api.friends.blockUser);

  const handleSendRequest = async () => {
    if (!currentUser?.id) return;
    try {
      await sendFriendRequest({ userId: currentUser.id, friendId: userId });
    } catch (error) {
      console.error("Failed to send friend request:", error);
    }
  };

  const handleAcceptRequest = async () => {
    if (!currentUser?.id) return;
    try {
      await acceptFriendRequest({ userId: currentUser.id, friendId: userId });
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleRemoveFriend = async () => {
    if (!currentUser?.id) return;
    try {
      await removeFriend({ userId: currentUser.id, friendId: userId });
    } catch (error) {
      console.error("Failed to remove friend:", error);
    }
  };

  const handleBlockUser = async () => {
    if (!currentUser?.id) return;
    if (!confirm("Are you sure you want to block this user?")) return;
    try {
      await blockUser({ userId: currentUser.id, blockedUserId: userId });
    } catch (error) {
      console.error("Failed to block user:", error);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50 animate-pulse" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;
  const userName = profile.username || "Unknown Adventurer";
  const userTitle = profile.title || "Novice Developer";
  const userLevel = profile.level || 1;
  const xpCurrent = profile.xp || 0;

  const characterStats = [
    { name: "Tools Viewed", value: profile.toolsViewed || 0, icon: <Star className="w-4 h-4" /> },
    { name: "Battles Won", value: profile.battlesWon || 0, icon: <Swords className="w-4 h-4" /> },
    { name: "Decks Created", value: profile.decksCreated || 0, icon: <Layers className="w-4 h-4" /> },
    { name: "Quests Completed", value: profile.questsCompleted || 0, icon: <Map className="w-4 h-4" /> },
  ];

  const renderFriendshipButton = () => {
    if (isOwnProfile) return null;
    if (!currentUser) {
      return (
        <Link href="/sign-in">
          <PixelButton variant="outline" size="sm">
            <UserPlus className="w-4 h-4 mr-2" /> Sign in to Connect
          </PixelButton>
        </Link>
      );
    }

    switch (friendshipStatus?.status) {
      case "accepted":
        return (
          <PixelButton variant="outline" size="sm" onClick={handleRemoveFriend}>
            <UserCheck className="w-4 h-4 mr-2" /> Friends
          </PixelButton>
        );
      case "pending":
        return (
          <PixelButton variant="outline" size="sm" disabled>
            <Clock className="w-4 h-4 mr-2" /> Request Sent
          </PixelButton>
        );
      case "pending_incoming":
        return (
          <PixelButton size="sm" onClick={handleAcceptRequest}>
            <UserPlus className="w-4 h-4 mr-2" /> Accept Request
          </PixelButton>
        );
      case "blocked":
        return (
          <PixelButton variant="outline" size="sm" disabled>
            <Ban className="w-4 h-4 mr-2" /> Blocked
          </PixelButton>
        );
      default:
        return (
          <PixelButton size="sm" onClick={handleSendRequest}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Friend
          </PixelButton>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/community" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to Community
          </Link>
        </div>

        <PixelCard className="mb-6">
          <PixelCardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="size-24 md:size-32 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0 mx-auto md:mx-0">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{userName}</h1>
                  <PixelBadge variant="default">Level {userLevel}</PixelBadge>
                </div>
                <p className="text-primary font-medium mb-2">{userTitle}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-primary" /> {xpCurrent.toLocaleString()} XP
                  </span>
                  {userRank && (
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" /> Rank #{userRank.rank}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {renderFriendshipButton()}
                  {!isOwnProfile && currentUser && friendshipStatus?.status !== "blocked" && (
                    <PixelButton variant="outline" size="sm" onClick={handleBlockUser}>
                      <Ban className="w-4 h-4 mr-2" /> Block
                    </PixelButton>
                  )}
                  {isOwnProfile && (
                    <Link href="/profile">
                      <PixelButton variant="outline" size="sm">
                        <User className="w-4 h-4 mr-2" /> Edit Profile
                      </PixelButton>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {characterStats.map((stat) => (
            <PixelCard key={stat.name}>
              <PixelCardContent className="p-4 text-center">
                <div className="text-primary mb-2">{stat.icon}</div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.name}</p>
              </PixelCardContent>
            </PixelCard>
          ))}
        </div>

        <PixelCard>
          <PixelCardContent className="p-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" /> Activity
            </h2>
            <div className="text-center py-8">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">Activity feed coming soon</p>
            </div>
          </PixelCardContent>
        </PixelCard>
      </main>
    </div>
  );
}
