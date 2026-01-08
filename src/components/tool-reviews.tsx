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
  MessageSquare, 
  Star,
  ThumbsUp,
  ThumbsDown,
  Check,
  Rocket,
  Plus,
  X
} from "lucide-react";

interface ToolReviewsProps {
  toolId: Id<"tools">;
  userId?: string;
  className?: string;
}

const EXPERIENCE_LEVELS = {
  tried_it: { label: "Tried It", icon: Star },
  used_in_project: { label: "Used in Project", icon: Star },
  shipped_product: { label: "Shipped Product", icon: Rocket },
  production_veteran: { label: "Production Veteran", icon: Check },
};

export function ToolReviews({ toolId, userId, className }: ToolReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  
  const reviews = useQuery(api.reviews.getToolReviews, { toolId });
  const ratingSummary = useQuery(api.reviews.getToolRatingSummary, { toolId });

  if (!reviews || !ratingSummary) {
    return (
      <div className="text-center p-4">
        <div className="text-muted-foreground text-sm pixel-loading">LOADING REVIEWS...</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-primary text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> REVIEWS
        </h2>
        {userId && (
          <PixelButton size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-3 h-3 mr-1" /> WRITE REVIEW
          </PixelButton>
        )}
      </div>

      <RatingSummary summary={ratingSummary} />

      {showForm && userId && (
        <ReviewForm toolId={toolId} userId={userId} onClose={() => setShowForm(false)} />
      )}

      {reviews.length === 0 ? (
        <PixelCard className="p-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">NO REVIEWS YET</p>
          <p className="text-muted-foreground text-xs">Be the first to review this tool!</p>
        </PixelCard>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <ReviewCard key={review._id} review={review} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}

function RatingSummary({ summary }: { summary: any }) {
  return (
    <PixelCard className="p-4">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-primary text-3xl">{summary.averageRating.toFixed(1)}</p>
          <div className="flex gap-0.5 justify-center my-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={cn(
                  "w-4 h-4",
                  star <= Math.round(summary.averageRating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                )} 
              />
            ))}
          </div>
          <p className="text-muted-foreground text-xs">{summary.totalReviews} reviews</p>
        </div>

        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = summary.distribution[rating];
            const percent = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs w-3">{rating}</span>
                <div className="flex-1 h-2 bg-[#0a0f1a] border border-border">
                  <div className="h-full bg-yellow-400" style={{ width: `${percent}%` }} />
                </div>
                <span className="text-muted-foreground text-xs w-6">{count}</span>
              </div>
            );
          })}
        </div>

        {summary.shippedCount > 0 && (
          <div className="text-center">
            <Rocket className="w-6 h-6 mx-auto text-green-400 mb-1" />
            <p className="text-green-400 text-lg">{summary.shippedCount}</p>
            <p className="text-muted-foreground text-[6px]">SHIPPED WITH</p>
          </div>
        )}
      </div>
    </PixelCard>
  );
}

interface ReviewFormProps {
  toolId: Id<"tools">;
  userId: string;
  onClose: () => void;
}

function ReviewForm({ toolId, userId, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");
  const [shippedWith, setShippedWith] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState<keyof typeof EXPERIENCE_LEVELS>("tried_it");

  const createReview = useMutation(api.reviews.create);
  const recordMasteryInteraction = useMutation(api.mastery.recordInteraction);

  const handleSubmit = async () => {
    await createReview({
      toolId,
      rating,
      title,
      content,
      pros,
      cons,
      shippedWith,
      experienceLevel,
    });
    await recordMasteryInteraction({
      userId,
      toolId,
      interactionType: "review",
    });
    onClose();
  };

  const addPro = () => {
    if (newPro.trim()) {
      setPros([...pros, newPro.trim()]);
      setNewPro("");
    }
  };

  const addCon = () => {
    if (newCon.trim()) {
      setCons([...cons, newCon.trim()]);
      setNewCon("");
    }
  };

  return (
    <PixelCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary text-sm uppercase">WRITE A REVIEW</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-primary">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-muted-foreground text-xs block mb-1">RATING</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)}>
                <Star className={cn(
                  "w-6 h-6",
                  star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                )} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-muted-foreground text-xs block mb-1">EXPERIENCE LEVEL</label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(EXPERIENCE_LEVELS) as [keyof typeof EXPERIENCE_LEVELS, typeof EXPERIENCE_LEVELS.tried_it][]).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setExperienceLevel(key)}
                className={cn(
                  "px-2 py-1 border text-xs",
                  experienceLevel === key ? "border-primary text-primary" : "border-border text-muted-foreground"
                )}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-muted-foreground text-xs block mb-1">TITLE</label>
          <PixelInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="REVIEW TITLE" />
        </div>

        <div>
          <label className="text-muted-foreground text-xs block mb-1">REVIEW</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience..."
            className="w-full bg-[#0a0f1a] border-4 border-border p-2 text-primary text-sm h-24 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-muted-foreground text-xs block mb-1">PROS</label>
            <div className="flex gap-1 mb-2">
              <PixelInput value={newPro} onChange={(e) => setNewPro(e.target.value)} placeholder="ADD PRO" className="flex-1" />
              <PixelButton size="sm" onClick={addPro}><Plus className="w-3 h-3" /></PixelButton>
            </div>
            <div className="flex flex-wrap gap-1">
              {pros.map((pro, i) => (
                <PixelBadge key={i} variant="outline" className="text-[6px] text-green-400 border-green-400">
                  {pro}
                  <button onClick={() => setPros(pros.filter((_, j) => j !== i))} className="ml-1">
                    <X className="w-2 h-2" />
                  </button>
                </PixelBadge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-muted-foreground text-xs block mb-1">CONS</label>
            <div className="flex gap-1 mb-2">
              <PixelInput value={newCon} onChange={(e) => setNewCon(e.target.value)} placeholder="ADD CON" className="flex-1" />
              <PixelButton size="sm" onClick={addCon}><Plus className="w-3 h-3" /></PixelButton>
            </div>
            <div className="flex flex-wrap gap-1">
              {cons.map((con, i) => (
                <PixelBadge key={i} variant="outline" className="text-[6px] text-red-400 border-red-400">
                  {con}
                  <button onClick={() => setCons(cons.filter((_, j) => j !== i))} className="ml-1">
                    <X className="w-2 h-2" />
                  </button>
                </PixelBadge>
              ))}
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={shippedWith} onChange={(e) => setShippedWith(e.target.checked)} className="accent-primary" />
          <span className="text-muted-foreground text-sm">I shipped a product with this tool</span>
          <Rocket className="w-3 h-3 text-green-400" />
        </label>

        <PixelButton onClick={handleSubmit} disabled={!title || !content}>
          SUBMIT REVIEW
        </PixelButton>
      </div>
    </PixelCard>
  );
}

function ReviewCard({ review, userId }: { review: any; userId?: string }) {
  const voteHelpful = useMutation(api.reviews.voteHelpful);
  const expConfig = EXPERIENCE_LEVELS[review.experienceLevel as keyof typeof EXPERIENCE_LEVELS];

  return (
    <PixelCard className={cn("p-4", review.shippedWith && "border-green-400")}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={cn("w-3 h-3", star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
              ))}
            </div>
            <h4 className="text-primary text-[11px]">{review.title}</h4>
          </div>
          <div className="flex items-center gap-2">
            <PixelBadge variant="outline" className="text-[6px]">
              {expConfig?.label}
            </PixelBadge>
            {review.shippedWith && (
              <PixelBadge variant="outline" className="text-[6px] text-green-400 border-green-400">
                <Rocket className="w-2 h-2 mr-1" /> SHIPPED
              </PixelBadge>
            )}
          </div>
        </div>
        <span className="text-muted-foreground text-xs">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="text-muted-foreground text-sm mb-3">{review.content}</p>

      {(review.pros.length > 0 || review.cons.length > 0) && (
        <div className="grid grid-cols-2 gap-4 mb-3">
          {review.pros.length > 0 && (
            <div>
              <p className="text-green-400 text-xs mb-1">PROS</p>
              <div className="flex flex-wrap gap-1">
                {review.pros.map((pro: string, i: number) => (
                  <PixelBadge key={i} variant="outline" className="text-[6px] text-green-400 border-green-400">
                    {pro}
                  </PixelBadge>
                ))}
              </div>
            </div>
          )}
          {review.cons.length > 0 && (
            <div>
              <p className="text-red-400 text-xs mb-1">CONS</p>
              <div className="flex flex-wrap gap-1">
                {review.cons.map((con: string, i: number) => (
                  <PixelBadge key={i} variant="outline" className="text-[6px] text-red-400 border-red-400">
                    {con}
                  </PixelBadge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => userId && voteHelpful({ reviewId: review._id, isHelpful: true })}
            className="flex items-center gap-1 text-muted-foreground hover:text-primary text-xs"
            disabled={!userId}
          >
            <ThumbsUp className="w-3 h-3" /> Helpful
          </button>
          <button
            onClick={() => userId && voteHelpful({ reviewId: review._id, isHelpful: false })}
            className="flex items-center gap-1 text-muted-foreground hover:text-primary text-xs"
            disabled={!userId}
          >
            <ThumbsDown className="w-3 h-3" />
          </button>
        </div>
        <span className="text-muted-foreground text-xs">{review.helpfulVotes} found helpful</span>
      </div>
    </PixelCard>
  );
}
