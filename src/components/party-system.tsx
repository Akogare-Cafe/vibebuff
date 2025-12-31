"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard, PixelCardHeader, PixelCardTitle, PixelCardContent } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { PixelInput } from "./pixel-input";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Plus, 
  Copy, 
  Check,
  Crown,
  UserPlus,
  MessageSquare,
  Layers,
  LogOut,
  Trash2,
  Send
} from "lucide-react";

interface PartySystemProps {
  userId: string;
  className?: string;
}

export function PartySystem({ userId, className }: PartySystemProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [partyName, setPartyName] = useState("");
  const [partyDescription, setPartyDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const userParties = useQuery(api.parties.getUserParties, { userId });
  const createParty = useMutation(api.parties.createParty);
  const joinParty = useMutation(api.parties.joinParty);

  const handleCreateParty = async () => {
    if (!partyName) return;
    await createParty({
      userId,
      name: partyName,
      description: partyDescription || undefined,
    });
    setPartyName("");
    setPartyDescription("");
    setShowCreateForm(false);
  };

  const handleJoinParty = async () => {
    if (!inviteCode) return;
    const result = await joinParty({ userId, inviteCode });
    if (result.success) {
      setInviteCode("");
      setShowJoinForm(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Users className="w-4 h-4" /> GUILDS
        </h2>
        <div className="flex gap-2">
          <PixelButton size="sm" onClick={() => setShowJoinForm(!showJoinForm)}>
            <UserPlus className="w-3 h-3 mr-1" /> JOIN
          </PixelButton>
          <PixelButton size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-3 h-3 mr-1" /> CREATE
          </PixelButton>
        </div>
      </div>

      {/* Join Form */}
      {showJoinForm && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3">JOIN A GUILD</h3>
          <div className="flex gap-2">
            <PixelInput
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ENTER INVITE CODE"
              className="flex-1"
              maxLength={6}
            />
            <PixelButton onClick={handleJoinParty} disabled={!inviteCode}>
              JOIN
            </PixelButton>
          </div>
        </PixelCard>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3">CREATE NEW GUILD</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[#3b82f6] text-[8px] block mb-1">GUILD NAME</label>
              <PixelInput
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="MY AWESOME GUILD"
              />
            </div>
            <div>
              <label className="text-[#3b82f6] text-[8px] block mb-1">DESCRIPTION (OPTIONAL)</label>
              <textarea
                value={partyDescription}
                onChange={(e) => setPartyDescription(e.target.value)}
                placeholder="What is this guild for?"
                className="w-full bg-[#0a1628] border-4 border-[#1e3a5f] p-2 text-[#60a5fa] text-[10px] h-16 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <PixelButton onClick={handleCreateParty} disabled={!partyName}>
                <Plus className="w-3 h-3 mr-1" /> CREATE GUILD
              </PixelButton>
              <PixelButton variant="ghost" onClick={() => setShowCreateForm(false)}>
                CANCEL
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Party List */}
      {!userParties || userParties.length === 0 ? (
        <PixelCard className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
          <p className="text-[#3b82f6] text-[10px]">NO GUILDS YET</p>
          <p className="text-[#1e3a5f] text-[8px]">Create or join a guild to collaborate!</p>
        </PixelCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userParties.map((party: any) => (
            <PartyCard key={party._id} party={party} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}

interface PartyCardProps {
  party: {
    _id: Id<"parties">;
    name: string;
    description?: string;
    inviteCode: string;
    role: "owner" | "admin" | "member";
    memberCount: number;
  };
  userId: string;
}

function PartyCard({ party, userId }: PartyCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const partyDetails = useQuery(
    api.parties.getParty,
    showDetails ? { partyId: party._id } : "skip"
  );

  const leaveParty = useMutation(api.parties.leaveParty);
  const deleteParty = useMutation(api.parties.deleteParty);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(party.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    if (confirm("Are you sure you want to leave this guild?")) {
      await leaveParty({ userId, partyId: party._id });
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this guild? This cannot be undone.")) {
      await deleteParty({ userId, partyId: party._id });
    }
  };

  return (
    <PixelCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[#60a5fa] text-[12px]">{party.name}</h3>
            {party.role === "owner" && (
              <Crown className="w-3 h-3 text-yellow-400" />
            )}
          </div>
          {party.description && (
            <p className="text-[#3b82f6] text-[8px] mt-1">{party.description}</p>
          )}
        </div>
        <PixelBadge variant="outline" className="text-[8px]">
          <Users className="w-3 h-3 mr-1" />
          {party.memberCount}
        </PixelBadge>
      </div>

      {/* Invite Code */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-[#0a1628] border border-[#1e3a5f]">
        <span className="text-[#3b82f6] text-[8px]">INVITE CODE:</span>
        <span className="text-[#60a5fa] text-[10px] font-mono flex-1">{party.inviteCode}</span>
        <button onClick={handleCopyCode} className="text-[#3b82f6] hover:text-[#60a5fa]">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <PixelButton 
          variant="ghost" 
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "HIDE" : "VIEW DETAILS"}
        </PixelButton>
        {party.role === "owner" ? (
          <PixelButton variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="w-3 h-3 mr-1" /> DELETE
          </PixelButton>
        ) : (
          <PixelButton variant="ghost" size="sm" onClick={handleLeave}>
            <LogOut className="w-3 h-3 mr-1" /> LEAVE
          </PixelButton>
        )}
      </div>

      {/* Expanded Details */}
      {showDetails && partyDetails && (
        <div className="mt-4 pt-4 border-t-2 border-[#1e3a5f] space-y-4">
          {/* Members */}
          <div>
            <h4 className="text-[#60a5fa] text-[10px] mb-2 flex items-center gap-1">
              <Users className="w-3 h-3" /> MEMBERS
            </h4>
            <div className="space-y-1">
              {partyDetails.members.map((member: any) => (
                <div key={member._id} className="flex items-center justify-between text-[8px]">
                  <span className="text-[#3b82f6]">{member.userId}</span>
                  <PixelBadge variant="outline" className="text-[6px]">
                    {member.role.toUpperCase()}
                  </PixelBadge>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Decks */}
          {partyDetails.sharedDecks.length > 0 && (
            <div>
              <h4 className="text-[#60a5fa] text-[10px] mb-2 flex items-center gap-1">
                <Layers className="w-3 h-3" /> SHARED DECKS
              </h4>
              <div className="space-y-1">
                {partyDetails.sharedDecks.map((pd: any) => (
                  <div key={pd._id} className="text-[8px] text-[#3b82f6]">
                    {pd.deck?.name || "Unknown Deck"}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {partyDetails.comments.length > 0 && (
            <div>
              <h4 className="text-[#60a5fa] text-[10px] mb-2 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> RECENT COMMENTS
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {partyDetails.comments.slice(-5).map((comment: any) => (
                  <div key={comment._id} className="text-[8px] p-2 bg-[#0a1628] border border-[#1e3a5f]">
                    <p className="text-[#60a5fa]">{comment.content}</p>
                    <p className="text-[#1e3a5f] mt-1">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PixelCard>
  );
}

// Quick party widget for sidebar
export function PartyWidget({ userId }: { userId: string }) {
  const userParties = useQuery(api.parties.getUserParties, { userId });

  if (!userParties || userParties.length === 0) return null;

  return (
    <PixelCard className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#60a5fa] text-[10px]">👥 YOUR GUILDS</span>
        <PixelBadge variant="outline" className="text-[6px]">
          {userParties.length}
        </PixelBadge>
      </div>
      
      <div className="space-y-1">
        {userParties.slice(0, 3).map((party: any) => (
          <div key={party._id} className="flex items-center justify-between text-[8px]">
            <span className="text-[#3b82f6]">{party.name}</span>
            <span className="text-[#1e3a5f]">{party.memberCount} members</span>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
