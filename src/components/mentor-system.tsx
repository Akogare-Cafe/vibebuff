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
  GraduationCap, 
  Users,
  Star,
  Check,
  X,
  Plus,
  Trophy,
  Target,
  Clock
} from "lucide-react";

interface MentorSystemProps {
  userId: string;
  className?: string;
}

export function MentorSystem({ userId, className }: MentorSystemProps) {
  const [showFindMentor, setShowFindMentor] = useState(false);
  
  const mentorships = useQuery(api.mentorship.getMentorships, { userId });
  const availableMentors = useQuery(api.mentorship.getAvailableMentors, { limit: 10 });

  const activeMentorships = [
    ...(mentorships?.asMentor?.filter((m: any) => m.status === "active") || []),
    ...(mentorships?.asApprentice?.filter((m: any) => m.status === "active") || []),
  ];

  const pendingRequests = [
    ...(mentorships?.asMentor?.filter((m: any) => m.status === "pending") || []),
    ...(mentorships?.asApprentice?.filter((m: any) => m.status === "pending") || []),
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-[#60a5fa] text-sm flex items-center gap-2">
          <GraduationCap className="w-4 h-4" /> MENTORSHIP
        </h2>
        <PixelButton size="sm" onClick={() => setShowFindMentor(!showFindMentor)}>
          <Users className="w-3 h-3 mr-1" /> FIND MENTOR
        </PixelButton>
      </div>

      {showFindMentor && (
        <PixelCard className="p-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3">AVAILABLE MENTORS</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableMentors?.map((mentor: any) => (
              <MentorCard key={mentor.oderId} mentor={mentor} userId={userId} />
            ))}
            {(!availableMentors || availableMentors.length === 0) && (
              <p className="col-span-full text-[#3b82f6] text-[10px] text-center">
                No mentors available right now
              </p>
            )}
          </div>
        </PixelCard>
      )}

      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> PENDING REQUESTS
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((m: any) => (
              <PendingMentorshipCard key={m._id} mentorship={m} userId={userId} />
            ))}
          </div>
        </div>
      )}

      {activeMentorships.length > 0 ? (
        <div>
          <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3">ACTIVE MENTORSHIPS</h3>
          <div className="space-y-4">
            {activeMentorships.map((m: any) => (
              <ActiveMentorshipCard key={m._id} mentorship={m} userId={userId} />
            ))}
          </div>
        </div>
      ) : (
        <PixelCard className="p-8 text-center">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 text-[#1e3a5f]" />
          <p className="text-[#3b82f6] text-[10px]">NO ACTIVE MENTORSHIPS</p>
          <p className="text-[#1e3a5f] text-[8px]">Find a mentor or become one!</p>
        </PixelCard>
      )}

      <MentorLeaderboard />
    </div>
  );
}

function MentorCard({ mentor, userId }: { mentor: any; userId: string }) {
  const requestMentorship = useMutation(api.mentorship.requestMentorship);

  const handleRequest = async () => {
    await requestMentorship({ apprenticeId: userId, odorId: mentor.oderId });
  };

  return (
    <PixelCard className="p-3">
      <div className="text-center mb-2">
        <GraduationCap className="w-8 h-8 mx-auto text-[#3b82f6]" />
        <p className="text-[#60a5fa] text-[10px] mt-1">{mentor.username || "Anonymous"}</p>
        <div className="flex justify-center gap-2 mt-1">
          <PixelBadge variant="outline" className="text-[6px]">
            LV.{mentor.level}
          </PixelBadge>
          {mentor.title && (
            <PixelBadge variant="outline" className="text-[6px]">
              {mentor.title}
            </PixelBadge>
          )}
        </div>
      </div>
      <PixelButton size="sm" className="w-full" onClick={handleRequest}>
        REQUEST
      </PixelButton>
    </PixelCard>
  );
}

function PendingMentorshipCard({ mentorship, userId }: { mentorship: any; userId: string }) {
  const acceptMentorship = useMutation(api.mentorship.acceptMentorship);
  const isMentor = mentorship.odorId === userId;

  const handleAccept = async () => {
    await acceptMentorship({ odorId: userId, mentorshipId: mentorship._id });
  };

  return (
    <div className="flex items-center justify-between p-3 border border-yellow-400 bg-yellow-400/10">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-yellow-400" />
        <div>
          <p className="text-[#60a5fa] text-[10px]">
            {isMentor ? "Apprentice request" : "Awaiting mentor response"}
          </p>
          <p className="text-[#3b82f6] text-[8px]">
            {new Date(mentorship.startedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      {isMentor && (
        <div className="flex gap-2">
          <PixelButton size="sm" onClick={handleAccept}>
            <Check className="w-3 h-3" />
          </PixelButton>
          <PixelButton size="sm" variant="ghost">
            <X className="w-3 h-3" />
          </PixelButton>
        </div>
      )}
    </div>
  );
}

function ActiveMentorshipCard({ mentorship, userId }: { mentorship: any; userId: string }) {
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const challenges = useQuery(api.mentorship.getMentorshipChallenges, { mentorshipId: mentorship._id });
  const isMentor = mentorship.odorId === userId;

  return (
    <PixelCard className="p-4 border-green-400">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-green-400" />
          <div>
            <p className="text-[#60a5fa] text-[12px]">
              {isMentor ? "Mentoring" : "Learning from"} someone
            </p>
            <div className="flex gap-2 mt-1">
              <PixelBadge variant="outline" className="text-[6px] text-green-400 border-green-400">
                {isMentor ? "MENTOR" : "APPRENTICE"}
              </PixelBadge>
              <span className="text-[#3b82f6] text-[8px]">
                +{isMentor ? mentorship.mentorXpEarned : mentorship.apprenticeXpEarned} XP
              </span>
            </div>
          </div>
        </div>
        {isMentor && (
          <PixelButton size="sm" onClick={() => setShowCreateChallenge(!showCreateChallenge)}>
            <Plus className="w-3 h-3 mr-1" /> CHALLENGE
          </PixelButton>
        )}
      </div>

      {showCreateChallenge && (
        <CreateChallengeForm 
          mentorshipId={mentorship._id} 
          odorId={userId} 
          onClose={() => setShowCreateChallenge(false)} 
        />
      )}

      {challenges && challenges.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-[#60a5fa] text-[10px] uppercase flex items-center gap-2">
            <Target className="w-4 h-4" /> CHALLENGES
          </h4>
          {challenges.map((challenge: any) => (
            <ChallengeCard key={challenge._id} challenge={challenge} />
          ))}
        </div>
      )}
    </PixelCard>
  );
}

function CreateChallengeForm({ mentorshipId, odorId, onClose }: { mentorshipId: Id<"mentorships">; odorId: string; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("5");
  const createChallenge = useMutation(api.mentorship.createChallenge);

  const handleCreate = async () => {
    await createChallenge({
      odorId,
      mentorshipId,
      title,
      description,
      requirement: { type: "complete_tasks", target: parseInt(target) },
      reward: { mentorXp: 100, apprenticeXp: 200 },
    });
    onClose();
  };

  return (
    <div className="p-3 border border-[#1e3a5f] bg-[#0a1628] mb-4">
      <PixelInput
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="CHALLENGE TITLE"
        className="mb-2"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description..."
        className="w-full bg-[#0a1628] border-2 border-[#1e3a5f] p-2 text-[#60a5fa] text-[10px] h-16 resize-none mb-2"
      />
      <PixelInput
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="TARGET"
        type="number"
        className="mb-2"
      />
      <div className="flex gap-2">
        <PixelButton size="sm" onClick={handleCreate} disabled={!title}>
          CREATE
        </PixelButton>
        <PixelButton size="sm" variant="ghost" onClick={onClose}>
          CANCEL
        </PixelButton>
      </div>
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: any }) {
  const progressPercent = (challenge.progress / challenge.requirement.target) * 100;

  return (
    <div className={cn(
      "p-3 border",
      challenge.status === "completed" ? "border-green-400 bg-green-400/10" : "border-[#1e3a5f]"
    )}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[#60a5fa] text-[10px]">{challenge.title}</p>
        <PixelBadge variant="outline" className={cn(
          "text-[6px]",
          challenge.status === "completed" && "text-green-400 border-green-400"
        )}>
          {challenge.status.toUpperCase()}
        </PixelBadge>
      </div>
      <p className="text-[#3b82f6] text-[8px] mb-2">{challenge.description}</p>
      <div className="h-2 bg-[#0a1628] border border-[#1e3a5f]">
        <div 
          className={cn("h-full", challenge.status === "completed" ? "bg-green-400" : "bg-[#3b82f6]")}
          style={{ width: `${Math.min(100, progressPercent)}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[8px]">
        <span className="text-[#3b82f6]">{challenge.progress}/{challenge.requirement.target}</span>
        <span className="text-[#1e3a5f]">+{challenge.reward.apprenticeXp} XP</span>
      </div>
    </div>
  );
}

function MentorLeaderboard() {
  const leaderboard = useQuery(api.mentorship.getMentorLeaderboard, { limit: 5 });

  if (!leaderboard || leaderboard.length === 0) return null;

  return (
    <PixelCard className="p-4">
      <h3 className="text-[#60a5fa] text-[10px] uppercase mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4" /> TOP MENTORS
      </h3>
      <div className="space-y-2">
        {leaderboard.map((mentor: any) => (
          <div key={mentor.oderId} className="flex items-center justify-between p-2 border border-[#1e3a5f]">
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-6 text-center text-[10px]",
                mentor.rank === 1 && "text-yellow-400",
                mentor.rank === 2 && "text-gray-400",
                mentor.rank === 3 && "text-orange-400",
                mentor.rank > 3 && "text-[#3b82f6]"
              )}>
                #{mentor.rank}
              </span>
              <GraduationCap className="w-4 h-4 text-[#3b82f6]" />
              <span className="text-[#60a5fa] text-[10px]">{mentor.oderId.slice(-6)}</span>
            </div>
            <span className="text-[#3b82f6] text-[8px]">{mentor.completedMentorships} mentored</span>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
