import { Metadata } from "next";
import { ForumContent } from "./forum-content";

export const metadata: Metadata = {
  title: "Community Forum - Discuss Dev Tools & Tech Stacks",
  description:
    "Join the VibeBuff community forum to discuss development tools, share tech stack experiences, get recommendations, and connect with fellow developers.",
  keywords: [
    "developer forum",
    "tech stack discussion",
    "developer community",
    "programming help",
    "tool recommendations",
    "web development forum",
  ],
  openGraph: {
    title: "VibeBuff Community Forum - Developer Discussions",
    description:
      "Discuss development tools, share experiences, and connect with fellow developers in the VibeBuff community forum.",
    type: "website",
  },
};

export default function ForumPage() {
  return <ForumContent />;
}
