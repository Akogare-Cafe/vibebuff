"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit3,
  Send,
  X,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface Tool {
  _id: Id<"tools">;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  githubUrl?: string;
  docsUrl?: string;
  logoUrl?: string;
  pricingModel: "free" | "freemium" | "paid" | "open_source" | "enterprise";
  isOpenSource: boolean;
  pros: string[];
  cons: string[];
  bestFor: string[];
  features: string[];
  tags: string[];
}

interface SuggestEditModalProps {
  tool: Tool;
  trigger?: React.ReactNode;
}

export function SuggestEditModal({ tool, trigger }: SuggestEditModalProps) {
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [name, setName] = useState(tool.name);
  const [tagline, setTagline] = useState(tool.tagline);
  const [description, setDescription] = useState(tool.description);
  const [websiteUrl, setWebsiteUrl] = useState(tool.websiteUrl);
  const [githubUrl, setGithubUrl] = useState(tool.githubUrl || "");
  const [docsUrl, setDocsUrl] = useState(tool.docsUrl || "");
  const [pros, setPros] = useState<string[]>([...tool.pros]);
  const [cons, setCons] = useState<string[]>([...tool.cons]);
  const [bestFor, setBestFor] = useState<string[]>([...tool.bestFor]);
  const [features, setFeatures] = useState<string[]>([...tool.features]);
  const [tags, setTags] = useState<string[]>([...tool.tags]);
  const [reason, setReason] = useState("");

  const submitSuggestion = useMutation(api.toolSuggestions.submit);

  const hasChanges = () => {
    return (
      name !== tool.name ||
      tagline !== tool.tagline ||
      description !== tool.description ||
      websiteUrl !== tool.websiteUrl ||
      githubUrl !== (tool.githubUrl || "") ||
      docsUrl !== (tool.docsUrl || "") ||
      JSON.stringify(pros) !== JSON.stringify(tool.pros) ||
      JSON.stringify(cons) !== JSON.stringify(tool.cons) ||
      JSON.stringify(bestFor) !== JSON.stringify(tool.bestFor) ||
      JSON.stringify(features) !== JSON.stringify(tool.features) ||
      JSON.stringify(tags) !== JSON.stringify(tool.tags)
    );
  };

  const handleSubmit = async () => {
    if (!hasChanges()) return;
    
    setIsSubmitting(true);
    try {
      const suggestedChanges: Record<string, any> = {};
      
      if (name !== tool.name) suggestedChanges.name = name;
      if (tagline !== tool.tagline) suggestedChanges.tagline = tagline;
      if (description !== tool.description) suggestedChanges.description = description;
      if (websiteUrl !== tool.websiteUrl) suggestedChanges.websiteUrl = websiteUrl;
      if (githubUrl !== (tool.githubUrl || "")) suggestedChanges.githubUrl = githubUrl || undefined;
      if (docsUrl !== (tool.docsUrl || "")) suggestedChanges.docsUrl = docsUrl || undefined;
      if (JSON.stringify(pros) !== JSON.stringify(tool.pros)) suggestedChanges.pros = pros;
      if (JSON.stringify(cons) !== JSON.stringify(tool.cons)) suggestedChanges.cons = cons;
      if (JSON.stringify(bestFor) !== JSON.stringify(tool.bestFor)) suggestedChanges.bestFor = bestFor;
      if (JSON.stringify(features) !== JSON.stringify(tool.features)) suggestedChanges.features = features;
      if (JSON.stringify(tags) !== JSON.stringify(tool.tags)) suggestedChanges.tags = tags;

      await submitSuggestion({
        toolId: tool._id,
        suggestedChanges,
        reason: reason || undefined,
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit suggestion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName(tool.name);
    setTagline(tool.tagline);
    setDescription(tool.description);
    setWebsiteUrl(tool.websiteUrl);
    setGithubUrl(tool.githubUrl || "");
    setDocsUrl(tool.docsUrl || "");
    setPros([...tool.pros]);
    setCons([...tool.cons]);
    setBestFor([...tool.bestFor]);
    setFeatures([...tool.features]);
    setTags([...tool.tags]);
    setReason("");
  };

  const handleClose = () => {
    setOpen(false);
    setSubmitted(false);
    resetForm();
  };

  const addToArray = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ""]);
  };

  const updateArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const removeFromArray = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isSignedIn) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger || (
            <PixelButton size="sm" variant="outline">
              <Edit3 className="w-3 h-3 mr-1" /> SUGGEST EDIT
            </PixelButton>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-primary text-sm flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> SIGN IN REQUIRED
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Please sign in to suggest edits to tools.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        {trigger || (
          <PixelButton size="sm" variant="outline">
            <Edit3 className="w-3 h-3 mr-1" /> SUGGEST EDIT
          </PixelButton>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary text-sm flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> SUGGEST EDIT FOR {tool.name.toUpperCase()}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-primary text-lg mb-2">SUGGESTION SUBMITTED</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Thank you for helping improve VibeBuff! An admin will review your suggestion.
            </p>
            <PixelButton onClick={handleClose}>CLOSE</PixelButton>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-primary text-xs mb-1 block">NAME</label>
                <PixelInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-primary text-xs mb-1 block">TAGLINE</label>
                <PixelInput
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-primary text-xs mb-1 block">DESCRIPTION</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[80px] bg-background border border-border text-foreground text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-primary text-xs mb-1 block">WEBSITE URL</label>
                <PixelInput
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-primary text-xs mb-1 block">GITHUB URL</label>
                <PixelInput
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-primary text-xs mb-1 block">DOCS URL</label>
                <PixelInput
                  value={docsUrl}
                  onChange={(e) => setDocsUrl(e.target.value)}
                  className="w-full"
                  placeholder="Optional"
                />
              </div>
            </div>

            <ArrayEditor
              label="STRENGTHS (PROS)"
              items={pros}
              onAdd={() => addToArray(setPros)}
              onUpdate={(i, v) => updateArrayItem(setPros, i, v)}
              onRemove={(i) => removeFromArray(setPros, i)}
            />

            <ArrayEditor
              label="WEAKNESSES (CONS)"
              items={cons}
              onAdd={() => addToArray(setCons)}
              onUpdate={(i, v) => updateArrayItem(setCons, i, v)}
              onRemove={(i) => removeFromArray(setCons, i)}
            />

            <ArrayEditor
              label="BEST FOR"
              items={bestFor}
              onAdd={() => addToArray(setBestFor)}
              onUpdate={(i, v) => updateArrayItem(setBestFor, i, v)}
              onRemove={(i) => removeFromArray(setBestFor, i)}
            />

            <ArrayEditor
              label="FEATURES"
              items={features}
              onAdd={() => addToArray(setFeatures)}
              onUpdate={(i, v) => updateArrayItem(setFeatures, i, v)}
              onRemove={(i) => removeFromArray(setFeatures, i)}
            />

            <ArrayEditor
              label="TAGS"
              items={tags}
              onAdd={() => addToArray(setTags)}
              onUpdate={(i, v) => updateArrayItem(setTags, i, v)}
              onRemove={(i) => removeFromArray(setTags, i)}
            />

            <div>
              <label className="text-primary text-xs mb-1 block">REASON FOR CHANGES (OPTIONAL)</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full min-h-[60px] bg-background border border-border text-foreground text-sm"
                placeholder="Explain why you're suggesting these changes..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <PixelButton variant="outline" onClick={handleClose}>
                <X className="w-3 h-3 mr-1" /> CANCEL
              </PixelButton>
              <PixelButton
                onClick={handleSubmit}
                disabled={!hasChanges() || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Send className="w-3 h-3 mr-1" />
                )}
                SUBMIT SUGGESTION
              </PixelButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ArrayEditor({
  label,
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  label: string;
  items: string[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-primary text-xs">{label}</label>
        <button
          type="button"
          onClick={onAdd}
          className="text-primary hover:text-primary/80 text-xs flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> ADD
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <PixelInput
              value={item}
              onChange={(e) => onUpdate(index, e.target.value)}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-muted-foreground hover:text-red-500 p-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground text-xs italic">No items</p>
        )}
      </div>
    </div>
  );
}
