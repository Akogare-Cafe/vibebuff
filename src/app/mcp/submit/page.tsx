"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  ChevronLeft,
  Package,
  Globe,
  Github,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const categories = [
  { value: "database", label: "Database" },
  { value: "api", label: "API" },
  { value: "devtools", label: "Dev Tools" },
  { value: "productivity", label: "Productivity" },
  { value: "ai", label: "AI" },
  { value: "cloud", label: "Cloud" },
  { value: "analytics", label: "Analytics" },
  { value: "security", label: "Security" },
  { value: "communication", label: "Communication" },
  { value: "file_system", label: "File System" },
  { value: "version_control", label: "Version Control" },
  { value: "documentation", label: "Documentation" },
  { value: "testing", label: "Testing" },
  { value: "deployment", label: "Deployment" },
  { value: "other", label: "Other" },
];

const transportOptions = [
  { value: "stdio", label: "stdio (Standard I/O)" },
  { value: "http", label: "HTTP (Streamable)" },
  { value: "sse", label: "SSE (Server-Sent Events)" },
];

export default function SubmitMcpPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const submitMcp = useMutation(api.mcpServers.submitMcpServer);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    websiteUrl: "",
    githubUrl: "",
    category: "",
    transportTypes: [] as string[],
    sampleConfig: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransportChange = (value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      transportTypes: checked
        ? [...prev.transportTypes, value]
        : prev.transportTypes.filter((t) => t !== value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user?.id) {
      setError("You must be signed in to submit an MCP server");
      return;
    }

    if (!formData.name || !formData.description || !formData.category) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.transportTypes.length === 0) {
      setError("Please select at least one transport type");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitMcp({
        name: formData.name,
        description: formData.description,
        websiteUrl: formData.websiteUrl || undefined,
        githubUrl: formData.githubUrl || undefined,
        category: formData.category,
        transportTypes: formData.transportTypes,
        sampleConfig: formData.sampleConfig || undefined,
        submittedBy: user.id,
      });
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2 font-heading">
            Sign In Required
          </h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to submit an MCP server.
          </p>
          <Link href="/sign-in">
            <PixelButton>Sign In</PixelButton>
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2 font-heading">
            Submission Received!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for submitting an MCP server. Our team will review it and add it to the directory if approved.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/mcp">
              <PixelButton variant="outline">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Directory
              </PixelButton>
            </Link>
            <PixelButton onClick={() => {
              setSubmitted(false);
              setFormData({
                name: "",
                description: "",
                websiteUrl: "",
                githubUrl: "",
                category: "",
                transportTypes: [],
                sampleConfig: "",
              });
            }}>
              Submit Another
            </PixelButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/mcp"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to MCP Directory
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Package className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-heading">
            Submit MCP Server
          </h1>
        </div>

        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle>Server Details</PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., GitHub MCP Server"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this MCP server does and its key features..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Transport Types <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2">
                  {transportOptions.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <Checkbox
                        id={option.value}
                        checked={formData.transportTypes.includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleTransportChange(option.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={option.value} className="text-sm font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website URL
                </Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.websiteUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, websiteUrl: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">
                  <Github className="w-4 h-4 inline mr-1" />
                  GitHub URL
                </Label>
                <Input
                  id="githubUrl"
                  type="url"
                  placeholder="https://github.com/org/repo"
                  value={formData.githubUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, githubUrl: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sampleConfig">Sample Configuration (JSON)</Label>
                <Textarea
                  id="sampleConfig"
                  placeholder={`{
  "mcpServers": {
    "your-server": {
      "command": "npx",
      "args": ["-y", "@your-org/mcp-server"]
    }
  }
}`}
                  value={formData.sampleConfig}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sampleConfig: e.target.value }))
                  }
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Provide a sample configuration that users can copy to their IDE
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href="/mcp" className="flex-1">
                  <PixelButton type="button" variant="outline" className="w-full">
                    Cancel
                  </PixelButton>
                </Link>
                <PixelButton type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </PixelButton>
              </div>
            </form>
          </PixelCardContent>
        </PixelCard>
      </div>
    </div>
  );
}
