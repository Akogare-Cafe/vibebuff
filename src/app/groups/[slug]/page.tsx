"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import Link from "next/link";
import {
  Users,
  ChevronLeft,
  Globe,
  Lock,
  Mail,
  Medal,
  Settings,
  UserPlus,
  LogOut,
  Layers,
  Crown,
  Shield,
  User,
  Search,
  X,
  Loader2,
  Check,
} from "lucide-react";

export default function GroupDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useUser();

  const group = useQuery(api.groups.getBySlug, { slug });
  const members = useQuery(
    api.groups.getMembers,
    group?._id ? { groupId: group._id } : "skip"
  );
  const sharedDecks = useQuery(
    api.groups.getSharedDecks,
    group?._id ? { groupId: group._id } : "skip"
  );

  const joinGroup = useMutation(api.groups.join);
  const leaveGroup = useMutation(api.groups.leave);
  const inviteMember = useMutation(api.groups.inviteMember);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviting, setIsInviting] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const searchResults = useQuery(
    api.friends.searchUsers,
    searchQuery.length >= 2 ? { query: searchQuery, limit: 10 } : "skip"
  );

  const currentUserMembership = members?.find((m) => m.userId === user?.id);
  const isOwner = group?.ownerId === user?.id;
  const isAdmin = currentUserMembership?.role === "admin" || currentUserMembership?.role === "moderator";
  const canInvite = isOwner || isAdmin;
  const isMember = !!currentUserMembership;

  const handleJoin = async () => {
    if (!user?.id || !group?._id) return;
    try {
      await joinGroup({ groupId: group._id, userId: user.id });
    } catch (error) {
      console.error("Failed to join group:", error);
    }
  };

  const handleLeave = async () => {
    if (!user?.id || !group?._id) return;
    if (!confirm("Are you sure you want to leave this group?")) return;
    try {
      await leaveGroup({ groupId: group._id, userId: user.id });
    } catch (error) {
      console.error("Failed to leave group:", error);
    }
  };

  const handleInvite = async (inviteeId: string) => {
    if (!user?.id || !group?._id) return;
    setIsInviting(inviteeId);
    setInviteSuccess(null);
    try {
      await inviteMember({
        groupId: group._id,
        inviterId: user.id,
        inviteeId,
      });
      setInviteSuccess(inviteeId);
      setTimeout(() => setInviteSuccess(null), 2000);
    } catch (error) {
      console.error("Failed to invite member:", error);
    } finally {
      setIsInviting(null);
    }
  };

  const filteredSearchResults = searchResults?.filter(
    (result) => !members?.some((m) => m.userId === result.clerkId)
  );

  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case "public":
        return <Globe className="w-4 h-4" />;
      case "private":
        return <Lock className="w-4 h-4" />;
      case "invite_only":
        return <Mail className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="w-3 h-3 text-yellow-500" />;
      case "admin":
        return <Shield className="w-3 h-3 text-blue-500" />;
      case "moderator":
        return <Medal className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50 animate-pulse" />
          <p className="text-muted-foreground">Loading group...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/groups" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to Groups
          </Link>
        </div>

        <PixelCard className="mb-6">
          <PixelCardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="size-24 md:size-32 rounded-xl bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0 mx-auto md:mx-0">
                {group.avatarUrl ? (
                  <img src={group.avatarUrl} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-12 h-12 text-primary" />
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
                  {group.isVerified && <Medal className="w-5 h-5 text-primary mx-auto md:mx-0" />}
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  {group.description || "No description"}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                  <PixelBadge variant="outline" className="flex items-center gap-1">
                    {getGroupTypeIcon(group.groupType)}
                    {group.groupType}
                  </PixelBadge>
                  <PixelBadge variant="outline" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {group.memberCount} members
                  </PixelBadge>
                </div>
                {group.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                    {group.tags.map((tag) => (
                      <PixelBadge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </PixelBadge>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {!isMember && group.groupType === "public" && user && (
                    <PixelButton size="sm" onClick={handleJoin}>
                      <UserPlus className="w-4 h-4 mr-2" /> Join Group
                    </PixelButton>
                  )}
                  {isMember && !isOwner && (
                    <PixelButton variant="outline" size="sm" onClick={handleLeave}>
                      <LogOut className="w-4 h-4 mr-2" /> Leave Group
                    </PixelButton>
                  )}
                  {canInvite && (
                    <PixelButton variant="outline" size="sm" onClick={() => setShowInviteModal(true)}>
                      <UserPlus className="w-4 h-4 mr-2" /> Invite Members
                    </PixelButton>
                  )}
                  {isOwner && (
                    <Link href={`/groups/${slug}/settings`}>
                      <PixelButton variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" /> Settings
                      </PixelButton>
                    </Link>
                  )}
                  {!user && (
                    <Link href="/sign-in">
                      <PixelButton size="sm">
                        <UserPlus className="w-4 h-4 mr-2" /> Sign in to Join
                      </PixelButton>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <PixelCard>
              <PixelCardContent className="p-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-primary" /> Shared Decks
                </h2>
                {sharedDecks && sharedDecks.length > 0 ? (
                  <div className="space-y-3">
                    {sharedDecks.filter((shared) => shared !== null).map((shared) => (
                      <Link key={shared!._id} href={`/decks/${shared!.deck._id}`}>
                        <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors">
                          <div className="size-10 rounded bg-primary/20 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground font-medium truncate">{shared.deck.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {shared.deck.toolIds.length} tools - Shared by {shared.sharer?.username || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Layers className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground text-sm">No shared decks yet</p>
                    {isMember && (
                      <p className="text-muted-foreground text-xs mt-1">
                        Share a deck from your profile to get started
                      </p>
                    )}
                  </div>
                )}
              </PixelCardContent>
            </PixelCard>
          </div>

          <div className="space-y-6">
            <PixelCard>
              <PixelCardContent className="p-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" /> Members
                </h2>
                {members && members.length > 0 ? (
                  <div className="space-y-3">
                    {members.slice(0, 10).map((member) => (
                      <Link key={member.userId} href={`/users/${member.userId}`}>
                        <div className="flex items-center gap-3 hover:bg-secondary p-2 rounded-lg transition-colors">
                          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt={member.username || ""} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-foreground text-sm font-medium truncate">
                                {member.username || "Unknown"}
                              </p>
                              {getRoleIcon(member.role)}
                            </div>
                            <p className="text-muted-foreground text-xs">Level {member.level}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {members.length > 10 && (
                      <p className="text-muted-foreground text-xs text-center">
                        +{members.length - 10} more members
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground text-sm">No members yet</p>
                  </div>
                )}
              </PixelCardContent>
            </PixelCard>

            {group.owner && (
              <PixelCard>
                <PixelCardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">Created by</p>
                  <Link href={`/users/${group.owner.clerkId}`}>
                    <div className="flex items-center gap-3 hover:bg-secondary p-2 rounded-lg transition-colors">
                      <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {group.owner.avatarUrl ? (
                          <img src={group.owner.avatarUrl} alt={group.owner.username || ""} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">
                          {group.owner.username || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </PixelCardContent>
              </PixelCard>
            )}
          </div>
        </div>
      </main>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <PixelCard className="w-full max-w-md">
            <PixelCardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" /> Invite Members
                </h2>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setSearchQuery("");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <PixelInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by username..."
                  className="pl-10"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {searchQuery.length < 2 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Type at least 2 characters to search
                  </p>
                ) : filteredSearchResults && filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((result) => (
                    <div
                      key={result.clerkId}
                      className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border"
                    >
                      <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        {result.avatarUrl ? (
                          <img src={result.avatarUrl} alt={result.username || ""} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium truncate">
                          {result.username || "Unknown"}
                        </p>
                        <p className="text-muted-foreground text-xs">Level {result.level}</p>
                      </div>
                      <PixelButton
                        size="sm"
                        variant={inviteSuccess === result.clerkId ? "default" : "outline"}
                        onClick={() => handleInvite(result.clerkId)}
                        disabled={isInviting === result.clerkId || inviteSuccess === result.clerkId}
                      >
                        {isInviting === result.clerkId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : inviteSuccess === result.clerkId ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                      </PixelButton>
                    </div>
                  ))
                ) : searchResults && searchResults.length > 0 && filteredSearchResults?.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    All matching users are already members
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No users found
                  </p>
                )}
              </div>
            </PixelCardContent>
          </PixelCard>
        </div>
      )}
    </div>
  );
}
