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
import { 
  Users, 
  Plus,
  Play,
  Check,
  Copy,
  Clock,
  Trophy,
  Crown,
  ThumbsUp
} from "lucide-react";

interface DraftModeProps {
  userId: string;
  className?: string;
}

export function DraftMode({ userId, className }: DraftModeProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [lobbyName, setLobbyName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const userLobbies = useQuery(api.draft.getUserLobbies, { userId });
  const createLobby = useMutation(api.draft.createLobby);
  const joinLobby = useMutation(api.draft.joinLobby);

  const handleCreate = async () => {
    if (!lobbyName) return;
    await createLobby({ hostId: userId, name: lobbyName });
    setLobbyName("");
    setShowCreate(false);
  };

  const handleJoin = async () => {
    if (!joinCode) return;
    await joinLobby({ userId, code: joinCode });
    setJoinCode("");
    setShowJoin(false);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <Users className="w-4 h-4" /> DRAFT MODE
        </h2>
        <div className="flex gap-2">
          <PixelButton size="sm" onClick={() => setShowJoin(!showJoin)}>
            JOIN
          </PixelButton>
          <PixelButton size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="w-3 h-3 mr-1" /> CREATE
          </PixelButton>
        </div>
      </div>

      {showCreate && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3">CREATE DRAFT LOBBY</h3>
          <div className="space-y-3">
            <PixelInput
              value={lobbyName}
              onChange={(e) => setLobbyName(e.target.value)}
              placeholder="LOBBY NAME"
            />
            <div className="flex gap-2">
              <PixelButton onClick={handleCreate} disabled={!lobbyName}>
                CREATE
              </PixelButton>
              <PixelButton variant="ghost" onClick={() => setShowCreate(false)}>
                CANCEL
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      )}

      {showJoin && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3">JOIN DRAFT</h3>
          <div className="flex gap-2">
            <PixelInput
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              maxLength={6}
              className="flex-1"
            />
            <PixelButton onClick={handleJoin} disabled={!joinCode}>
              JOIN
            </PixelButton>
          </div>
        </PixelCard>
      )}

      {userLobbies && userLobbies.length > 0 ? (
        <div className="space-y-4">
          {userLobbies.map((lobby: any) => (
            <DraftLobbyCard key={lobby._id} lobbyCode={lobby.code} userId={userId} />
          ))}
        </div>
      ) : (
        <PixelCard className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
          <p className="text-[#3b82f6] text-[10px]">NO ACTIVE DRAFTS</p>
          <p className="text-[#1e3a5f] text-[8px]">Create or join a draft to compete!</p>
        </PixelCard>
      )}
    </div>
  );
}

function DraftLobbyCard({ lobbyCode, userId }: { lobbyCode: string; userId: string }) {
  const [copied, setCopied] = useState(false);
  
  const lobby = useQuery(api.draft.getLobby, { code: lobbyCode });
  const setReady = useMutation(api.draft.setReady);
  const startDraft = useMutation(api.draft.startDraft);
  const makePick = useMutation(api.draft.makePick);

  if (!lobby) return null;

  const currentPlayer = lobby.players.find((p: any) => p.userId === userId);
  const isHost = lobby.hostId === userId;
  const isMyTurn = lobby.status === "drafting" && 
    lobby.players[lobby.currentPickerIndex]?.userId === userId;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(lobby.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReady = () => {
    setReady({ userId, lobbyId: lobby._id, isReady: !currentPlayer?.isReady });
  };

  const handleStart = () => {
    startDraft({ userId, lobbyId: lobby._id });
  };

  const handlePick = (toolId: Id<"tools">) => {
    makePick({ userId, lobbyId: lobby._id, toolId });
  };

  return (
    <PixelCard className={cn("p-4", isMyTurn && "border-yellow-400")}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[#60a5fa] text-[12px]">{lobby.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <PixelBadge variant="outline" className="text-[8px]">
              {lobby.status.toUpperCase()}
            </PixelBadge>
            {lobby.status === "drafting" && (
              <span className="text-[#3b82f6] text-[8px]">
                Round {lobby.currentRound}/{lobby.settings.totalRounds}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#60a5fa] text-[10px] font-mono">{lobby.code}</span>
          <button onClick={handleCopyCode} className="text-[#3b82f6] hover:text-[#60a5fa]">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {lobby.players.map((player: any, index: number) => (
          <div 
            key={player._id}
            className={cn(
              "border p-2 text-center",
              player.userId === userId && "border-[#3b82f6]",
              lobby.status === "drafting" && index === lobby.currentPickerIndex && "border-yellow-400 bg-yellow-400/10"
            )}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              {player.userId === lobby.hostId && <Crown className="w-3 h-3 text-yellow-400" />}
              <span className="text-[#60a5fa] text-[10px]">
                {player.userId === userId ? "YOU" : `P${index + 1}`}
              </span>
            </div>
            {lobby.status === "waiting" && (
              <PixelBadge 
                variant="outline" 
                className={cn("text-[6px]", player.isReady ? "text-green-400 border-green-400" : "text-[#3b82f6]")}
              >
                {player.isReady ? "READY" : "WAITING"}
              </PixelBadge>
            )}
            {lobby.status !== "waiting" && (
              <span className="text-[#3b82f6] text-[8px]">{player.tools?.length || 0} picks</span>
            )}
          </div>
        ))}
      </div>

      {lobby.status === "waiting" && (
        <div className="flex gap-2">
          <PixelButton 
            size="sm" 
            variant={currentPlayer?.isReady ? "ghost" : "default"}
            onClick={handleReady}
          >
            {currentPlayer?.isReady ? "UNREADY" : "READY"}
          </PixelButton>
          {isHost && (
            <PixelButton 
              size="sm" 
              onClick={handleStart}
              disabled={lobby.players.length < 2 || !lobby.players.every((p: any) => p.isReady || p.userId === userId)}
            >
              <Play className="w-3 h-3 mr-1" /> START
            </PixelButton>
          )}
        </div>
      )}

      {lobby.status === "drafting" && isMyTurn && (
        <div>
          <p className="text-yellow-400 text-[10px] mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" /> YOUR TURN TO PICK!
          </p>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
            {lobby.availableTools.slice(0, 24).map((tool: any) => (
              <button
                key={tool._id}
                onClick={() => handlePick(tool._id)}
                className="border border-[#1e3a5f] p-2 hover:border-[#3b82f6] text-left"
              >
                <p className="text-[#60a5fa] text-[8px] truncate">{tool.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {lobby.status === "drafting" && !isMyTurn && (
        <p className="text-[#3b82f6] text-[10px] text-center">
          Waiting for {lobby.players[lobby.currentPickerIndex]?.userId === userId ? "you" : "other player"} to pick...
        </p>
      )}

      {(lobby.status === "voting" || lobby.status === "completed") && (
        <DraftResults lobbyId={lobby._id} userId={userId} />
      )}
    </PixelCard>
  );
}

function DraftResults({ lobbyId, userId }: { lobbyId: Id<"draftLobbies">; userId: string }) {
  const results = useQuery(api.draft.getResults, { lobbyId });
  const voteForDraft = useMutation(api.draft.voteForDraft);

  if (!results) return null;

  const handleVote = (votedForUserId: string) => {
    voteForDraft({ oderId: userId, lobbyId, votedForUserId });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-[#60a5fa] text-[10px] uppercase flex items-center gap-2">
        <Trophy className="w-4 h-4" /> DRAFT RESULTS
      </h4>

      {results.players.map((player: any, index: number) => (
        <div 
          key={player._id}
          className={cn(
            "border p-3",
            index === 0 && results.lobby.status === "completed" && "border-yellow-400 bg-yellow-400/10"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {index === 0 && results.lobby.status === "completed" && (
                <Trophy className="w-4 h-4 text-yellow-400" />
              )}
              <span className="text-[#60a5fa] text-[10px]">
                {player.userId === userId ? "YOUR DRAFT" : `PLAYER ${index + 1}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PixelBadge variant="outline" className="text-[6px]">
                <ThumbsUp className="w-2 h-2 mr-1" /> {player.votes}
              </PixelBadge>
              {results.lobby.status === "voting" && player.userId !== userId && (
                <PixelButton size="sm" onClick={() => handleVote(player.userId)}>
                  VOTE
                </PixelButton>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {player.tools.map((tool: any) => (
              <PixelBadge key={tool._id} variant="outline" className="text-[6px]">
                {tool.name}
              </PixelBadge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
