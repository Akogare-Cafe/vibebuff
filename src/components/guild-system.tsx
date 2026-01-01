"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { PixelInput } from "./pixel-input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Users, 
  Plus,
  Crown,
  Shield,
  Swords,
  Trophy,
  Star,
  LogOut,
  Settings,
  Layers
} from "lucide-react";

interface GuildSystemProps {
  userId: string;
  className?: string;
}

export function GuildSystem({ userId, className }: GuildSystemProps) {
  const [showCreate, setShowCreate] = useState(false);
  const userGuilds = useQuery(api.guilds.getUserGuilds, { userId });
  const publicGuilds = useQuery(api.guilds.listPublic, { limit: 10 });

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Users className="w-4 h-4" /> GUILDS
        </h2>
        <PixelButton size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="w-3 h-3 mr-1" /> CREATE
        </PixelButton>
      </div>

      {showCreate && (
        <CreateGuildForm userId={userId} onClose={() => setShowCreate(false)} />
      )}

      {userGuilds && userGuilds.length > 0 && (
        <div>
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3">YOUR GUILDS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userGuilds.map((guild: any) => (
              <GuildCard key={guild._id} guild={guild} userId={userId} isMember />
            ))}
          </div>
        </div>
      )}

      {publicGuilds && publicGuilds.length > 0 && (
        <div>
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3">DISCOVER GUILDS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicGuilds
              .filter((g: any) => !userGuilds?.some((ug: any) => ug._id === g._id))
              .map((guild: any) => (
                <GuildCard key={guild._id} guild={guild} userId={userId} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateGuildForm({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const createGuild = useMutation(api.guilds.create);

  const handleCreate = async () => {
    if (!name) return;
    await createGuild({
      ownerId: userId,
      name,
      description,
      icon: "Shield",
      isPublic,
    });
    onClose();
  };

  return (
    <PixelCard className="p-4">
      <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3">CREATE GUILD</h3>
      <div className="space-y-3">
        <PixelInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="GUILD NAME"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description..."
          className="w-full bg-[#0a1628] border-4 border-[#1e3a5f] p-2 text-[#60a5fa] text-[10px] h-20 resize-none"
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="accent-[#3b82f6]"
          />
          <span className="text-[#3b82f6] text-[10px]">Public Guild</span>
        </label>
        <div className="flex gap-2">
          <PixelButton onClick={handleCreate} disabled={!name}>
            CREATE
          </PixelButton>
          <PixelButton variant="ghost" onClick={onClose}>
            CANCEL
          </PixelButton>
        </div>
      </div>
    </PixelCard>
  );
}

interface GuildCardProps {
  guild: any;
  userId: string;
  isMember?: boolean;
}

function GuildCard({ guild, userId, isMember }: GuildCardProps) {
  const joinGuild = useMutation(api.guilds.join);
  const leaveGuild = useMutation(api.guilds.leave);

  const handleJoin = async () => {
    await joinGuild({ userId, guildId: guild._id });
  };

  const handleLeave = async () => {
    if (confirm("Leave this guild?")) {
      await leaveGuild({ userId, guildId: guild._id });
    }
  };

  const RoleIcon = guild.role === "owner" ? Crown : guild.role === "admin" ? Shield : Users;

  return (
    <PixelCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-[#3b82f6]" />
          <div>
            <h4 className="text-[#60a5fa] text-[12px]">{guild.name}</h4>
            <p className="text-[#3b82f6] text-[8px]">{guild.description}</p>
          </div>
        </div>
        {isMember && (
          <PixelBadge variant="outline" className="text-[6px]">
            <RoleIcon className="w-2 h-2 mr-1" />
            {guild.role?.toUpperCase()}
          </PixelBadge>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3 text-[8px]">
        <span className="text-[#3b82f6] flex items-center gap-1">
          <Users className="w-3 h-3" /> {guild.memberCount}
        </span>
        <span className="text-[#3b82f6] flex items-center gap-1">
          <Star className="w-3 h-3" /> LV.{guild.level}
        </span>
        <span className="text-[#3b82f6] flex items-center gap-1">
          <Trophy className="w-3 h-3" /> {guild.xp} XP
        </span>
      </div>

      {isMember ? (
        <div className="flex gap-2">
          <Link href={`/guilds/${guild.slug}`} className="flex-1">
            <PixelButton size="sm" className="w-full">
              VIEW
            </PixelButton>
          </Link>
          {guild.role !== "owner" && (
            <PixelButton size="sm" variant="ghost" onClick={handleLeave}>
              <LogOut className="w-3 h-3" />
            </PixelButton>
          )}
        </div>
      ) : (
        <PixelButton size="sm" onClick={handleJoin} className="w-full">
          JOIN GUILD
        </PixelButton>
      )}
    </PixelCard>
  );
}

export function GuildLeaderboard() {
  const leaderboard = useQuery(api.guilds.getLeaderboard, { limit: 10 });

  if (!leaderboard) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4" /> TOP GUILDS
      </h3>
      <div className="space-y-2">
        {leaderboard.map((guild: any) => (
          <div
            key={guild._id}
            className={cn(
              "flex items-center justify-between p-2 border",
              guild.rank === 1 && "border-yellow-400 bg-yellow-400/10",
              guild.rank === 2 && "border-gray-400 bg-gray-400/10",
              guild.rank === 3 && "border-orange-400 bg-orange-400/10",
              guild.rank > 3 && "border-[#1e3a5f]"
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-6 text-center text-[10px]",
                guild.rank === 1 && "text-yellow-400",
                guild.rank === 2 && "text-gray-400",
                guild.rank === 3 && "text-orange-400",
                guild.rank > 3 && "text-[#3b82f6]"
              )}>
                #{guild.rank}
              </span>
              <Shield className="w-4 h-4 text-[#3b82f6]" />
              <span className="text-[#60a5fa] text-[10px]">{guild.name}</span>
            </div>
            <span className="text-[#3b82f6] text-[8px]">{guild.xp} XP</span>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
