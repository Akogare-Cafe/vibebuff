"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Trophy,
  ChevronRight,
  Play,
  FileText,
  Gamepad2,
  HelpCircle,
  Check,
  Lock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "../../convex/_generated/dataModel";

type Difficulty = "beginner" | "intermediate" | "advanced";

const difficultyColors = {
  beginner: "text-green-400 bg-green-500/20",
  intermediate: "text-yellow-400 bg-yellow-500/20",
  advanced: "text-red-400 bg-red-500/20",
};

const lessonTypeIcons = {
  video: Play,
  article: FileText,
  interactive: Gamepad2,
  quiz: HelpCircle,
};

interface LearningPath {
  _id: Id<"learningPaths">;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  icon: string;
  color: string;
  xpReward: number;
  lessonCount: number;
  lessons: {
    _id: Id<"learningLessons">;
    title: string;
    lessonType: "video" | "article" | "interactive" | "quiz";
    estimatedMinutes: number;
    xpReward: number;
  }[];
  tools: { name: string }[];
}

interface UserProgress {
  pathId: Id<"learningPaths">;
  completedLessons: Id<"learningLessons">[];
  percentComplete: number;
  totalXpEarned: number;
}

function PathCard({
  path,
  progress,
  onStart,
}: {
  path: LearningPath;
  progress?: UserProgress;
  onStart: () => void;
}) {
  const isStarted = !!progress;
  const isCompleted = progress?.percentComplete === 100;

  return (
    <PixelCard
      rarity={isCompleted ? "legendary" : isStarted ? "rare" : "common"}
      className="h-full"
    >
      <PixelCardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${path.color}20` }}
            >
              <GraduationCap className="w-6 h-6" style={{ color: path.color }} />
            </div>
            <div>
              <PixelCardTitle>{path.title}</PixelCardTitle>
              <div className="flex items-center gap-2 mt-1">
                <PixelBadge className={difficultyColors[path.difficulty]}>
                  {path.difficulty}
                </PixelBadge>
                <span className="text-[#3b82f6] text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {path.estimatedMinutes} min
                </span>
              </div>
            </div>
          </div>
          {isCompleted && (
            <Trophy className="w-6 h-6 text-[#fbbf24]" />
          )}
        </div>
      </PixelCardHeader>

      <PixelCardContent>
        <p className="text-[#3b82f6] text-sm mb-4">{path.description}</p>

        {progress && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#3b82f6] mb-1">
              <span>Progress</span>
              <span>{progress.percentComplete}%</span>
            </div>
            <div className="h-2 bg-[#1e3a5f] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentComplete}%` }}
                className="h-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-[#3b82f6] text-xs">
            {path.lessonCount} lessons
          </span>
          <span className="text-[#fbbf24] text-xs flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {path.xpReward} XP
          </span>
        </div>

        {path.tools.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {path.tools.slice(0, 3).map((tool, i) => (
              <PixelBadge key={i} className="text-[8px]">
                {tool.name}
              </PixelBadge>
            ))}
          </div>
        )}

        <PixelButton onClick={onStart} className="w-full">
          {isCompleted ? (
            <>
              Review Path
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          ) : isStarted ? (
            <>
              Continue Learning
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              Start Path
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </PixelButton>
      </PixelCardContent>
    </PixelCard>
  );
}

function LessonList({
  path,
  progress,
  onLessonClick,
}: {
  path: LearningPath;
  progress?: UserProgress;
  onLessonClick: (lessonId: Id<"learningLessons">) => void;
}) {
  const completedLessons = progress?.completedLessons ?? [];

  return (
    <div className="space-y-2">
      {path.lessons.map((lesson, index) => {
        const isCompleted = completedLessons.includes(lesson._id);
        const isLocked = index > 0 && !completedLessons.includes(path.lessons[index - 1]._id);
        const Icon = lessonTypeIcons[lesson.lessonType];

        return (
          <button
            key={lesson._id}
            onClick={() => !isLocked && onLessonClick(lesson._id)}
            disabled={isLocked}
            className={cn(
              "w-full p-4 rounded-lg border-2 transition-all text-left",
              "flex items-center gap-4",
              isLocked
                ? "border-[#1e3a5f]/50 bg-[#0a1628]/50 cursor-not-allowed opacity-50"
                : isCompleted
                ? "border-[#22c55e]/50 bg-[#22c55e]/10 hover:border-[#22c55e]"
                : "border-[#1e3a5f] bg-[#0d1f3c]/30 hover:border-[#60a5fa]"
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                isCompleted ? "bg-[#22c55e]/20" : "bg-[#1e3a5f]"
              )}
            >
              {isLocked ? (
                <Lock className="w-5 h-5 text-[#3b82f6]/50" />
              ) : isCompleted ? (
                <Check className="w-5 h-5 text-[#22c55e]" />
              ) : (
                <Icon className="w-5 h-5 text-[#60a5fa]" />
              )}
            </div>

            <div className="flex-1">
              <p
                className={cn(
                  "font-bold text-sm",
                  isCompleted ? "text-[#22c55e]" : "text-[#60a5fa]"
                )}
              >
                {index + 1}. {lesson.title}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-[#3b82f6]">
                <span className="capitalize">{lesson.lessonType}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lesson.estimatedMinutes} min
                </span>
                <span className="flex items-center gap-1 text-[#fbbf24]">
                  <Zap className="w-3 h-3" />
                  {lesson.xpReward} XP
                </span>
              </div>
            </div>

            {!isLocked && (
              <ChevronRight
                className={cn(
                  "w-5 h-5",
                  isCompleted ? "text-[#22c55e]" : "text-[#60a5fa]"
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function LearningAcademy() {
  const { user } = useUser();
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");

  const paths = useQuery(api.learningPaths.list, {
    difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
    publishedOnly: true,
  });

  const userProgress = useQuery(
    api.learningPaths.getUserProgress,
    user?.id ? { userId: user.id } : "skip"
  );

  const startPath = useMutation(api.learningPaths.startPath);
  const completeLesson = useMutation(api.learningPaths.completeLesson);

  const getProgressForPath = (pathId: Id<"learningPaths">): UserProgress | undefined => {
    return userProgress?.find((p) => p.pathId === pathId) as UserProgress | undefined;
  };

  const handleStartPath = async (path: LearningPath) => {
    if (!user?.id) return;
    await startPath({ userId: user.id, pathId: path._id });
    setSelectedPath(path);
  };

  const handleLessonClick = async (lessonId: Id<"learningLessons">) => {
    if (!user?.id || !selectedPath) return;
    await completeLesson({
      userId: user.id,
      pathId: selectedPath._id,
      lessonId,
    });
  };

  if (selectedPath) {
    const progress = getProgressForPath(selectedPath._id);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <PixelButton
            variant="outline"
            onClick={() => setSelectedPath(null)}
          >
            Back to Paths
          </PixelButton>
          <div>
            <h1 className="text-xl font-bold text-[#60a5fa]">
              {selectedPath.title}
            </h1>
            <p className="text-[#3b82f6] text-sm">{selectedPath.description}</p>
          </div>
        </div>

        {progress && (
          <PixelCard>
            <PixelCardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#60a5fa] font-bold">Your Progress</span>
                <span className="text-[#fbbf24] flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {progress.totalXpEarned} XP earned
                </span>
              </div>
              <div className="h-3 bg-[#1e3a5f] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentComplete}%` }}
                  className="h-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]"
                />
              </div>
              <p className="text-[#3b82f6] text-xs mt-2">
                {progress.completedLessons.length} of {selectedPath.lessonCount} lessons completed
              </p>
            </PixelCardContent>
          </PixelCard>
        )}

        <LessonList
          path={selectedPath}
          progress={progress}
          onLessonClick={handleLessonClick}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#60a5fa] flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            Vibe Coding Academy
          </h1>
          <p className="text-[#3b82f6] text-sm mt-1">
            Master vibe coding through guided learning paths
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(["all", "beginner", "intermediate", "advanced"] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-colors",
                selectedDifficulty === diff
                  ? "bg-[#60a5fa] text-white"
                  : "bg-[#1e3a5f] text-[#3b82f6] hover:bg-[#60a5fa]/20"
              )}
            >
              {diff === "all" ? "All Levels" : diff}
            </button>
          ))}
        </div>
      </div>

      {userProgress && userProgress.length > 0 && (
        <PixelCard rarity="rare">
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#fbbf24]" />
              Your Learning Stats
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#60a5fa]">
                  {userProgress.length}
                </p>
                <p className="text-[#3b82f6] text-xs">Paths Started</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#22c55e]">
                  {userProgress.filter((p) => p.percentComplete === 100).length}
                </p>
                <p className="text-[#3b82f6] text-xs">Paths Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#fbbf24]">
                  {userProgress.reduce((sum, p) => sum + (p.totalXpEarned || 0), 0)}
                </p>
                <p className="text-[#3b82f6] text-xs">Total XP</p>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>
      )}

      {!paths ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-[#1e3a5f] rounded-lg" />
            </div>
          ))}
        </div>
      ) : paths.length === 0 ? (
        <PixelCard>
          <PixelCardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-[#3b82f6] mx-auto mb-4" />
            <p className="text-[#60a5fa] font-bold">No learning paths available</p>
            <p className="text-[#3b82f6] text-sm">
              Check back soon for new content
            </p>
          </PixelCardContent>
        </PixelCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path) => (
            <PathCard
              key={path._id}
              path={path as LearningPath}
              progress={getProgressForPath(path._id)}
              onStart={() => handleStartPath(path as LearningPath)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
