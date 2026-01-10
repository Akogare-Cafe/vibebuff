import {
  Search,
  Sparkles,
  Package,
  Swords,
  Users,
  Trophy,
  Wrench,
  Globe,
  Lock,
  Plus,
  Filter,
  Star,
  Layers,
  Target,
  MessageSquare,
  Bell,
  Settings,
  Award,
  Heart,
  TrendingUp,
  Gamepad2,
  BookOpen,
} from "lucide-react";
import type { PageTourConfig } from "@/components/page-tour";

export const homeTourConfig: PageTourConfig = {
  pageId: "home",
  title: "Welcome to Vibebuff",
  steps: [
    {
      title: "WELCOME TO VIBEBUFF",
      content: "Your quest for the perfect tech stack begins here! Let us show you around.",
      icon: Gamepad2,
      position: "center",
    },
    {
      target: "[data-tour='ai-builder']",
      title: "AI STACK BUILDER",
      content: "Describe your project and our AI will recommend the perfect tools for your needs.",
      icon: Sparkles,
      position: "bottom",
    },
    {
      target: "[data-tour='search']",
      title: "SEARCH TOOLS",
      content: "Quickly find any tool from our database of 500+ development tools.",
      icon: Search,
      position: "bottom",
    },
    {
      target: "[data-tour='categories']",
      title: "BROWSE CATEGORIES",
      content: "Explore tools organized by category - from frameworks to databases to AI tools.",
      icon: Package,
      position: "top",
    },
    {
      target: "[data-tour='featured']",
      title: "FEATURED TOOLS",
      content: "Check out the most popular and trending tools in the community.",
      icon: Star,
      position: "top",
    },
  ],
};

export const toolsTourConfig: PageTourConfig = {
  pageId: "tools",
  title: "Browse Tools",
  steps: [
    {
      title: "TOOL DIRECTORY",
      content: "Browse our comprehensive directory of development tools, frameworks, and services.",
      icon: Package,
      position: "center",
    },
    {
      target: "[data-tour='tool-search']",
      title: "SEARCH & FILTER",
      content: "Use the search bar and filters to find exactly what you're looking for.",
      icon: Search,
      position: "bottom",
    },
    {
      target: "[data-tour='tool-categories']",
      title: "FILTER BY CATEGORY",
      content: "Narrow down tools by selecting a specific category.",
      icon: Filter,
      position: "bottom",
    },
    {
      target: "[data-tour='tool-card']",
      title: "TOOL CARDS",
      content: "Click on any tool to see detailed information, reviews, and alternatives.",
      icon: Wrench,
      position: "right",
    },
  ],
};

export const compareTourConfig: PageTourConfig = {
  pageId: "compare",
  title: "Compare Tools",
  steps: [
    {
      title: "TOOL COMPARISON",
      content: "Compare tools side-by-side to make informed decisions for your stack.",
      icon: Target,
      position: "center",
    },
    {
      target: "[data-tour='compare-search']",
      title: "ADD TOOLS",
      content: "Search and add tools to compare their features, pricing, and community ratings.",
      icon: Search,
      position: "bottom",
    },
    {
      target: "[data-tour='compare-table']",
      title: "COMPARISON TABLE",
      content: "View detailed comparisons including features, pros, cons, and user ratings.",
      icon: Layers,
      position: "top",
    },
  ],
};

export const decksTourConfig: PageTourConfig = {
  pageId: "decks-new",
  title: "Create a Deck",
  steps: [
    {
      title: "BUILD YOUR DECK",
      content: "Create a collection of your favorite tools to share with the community.",
      icon: Package,
      position: "center",
    },
    {
      target: "[data-tour='deck-name']",
      title: "NAME YOUR DECK",
      content: "Give your deck a memorable name and description.",
      icon: Sparkles,
      position: "bottom",
    },
    {
      target: "[data-tour='deck-visibility']",
      title: "SET VISIBILITY",
      content: "Choose whether your deck is public (shareable) or private (just for you).",
      icon: Globe,
      position: "bottom",
    },
    {
      target: "[data-tour='deck-tools']",
      title: "ADD TOOLS",
      content: "Search and select tools to add to your deck. You can add more later!",
      icon: Wrench,
      position: "top",
    },
    {
      target: "[data-tour='deck-preview']",
      title: "DECK PREVIEW",
      content: "See a preview of your deck as you build it. Click Create when ready!",
      icon: Package,
      position: "left",
    },
  ],
};

export const battlesTourConfig: PageTourConfig = {
  pageId: "battles",
  title: "Tool Battles",
  steps: [
    {
      title: "TOOL BATTLES",
      content: "Vote on head-to-head matchups between tools and see community preferences!",
      icon: Swords,
      position: "center",
    },
    {
      target: "[data-tour='battle-card']",
      title: "CAST YOUR VOTE",
      content: "Click on a tool to vote for it. Each vote earns you XP!",
      icon: Trophy,
      position: "bottom",
    },
    {
      target: "[data-tour='battle-stats']",
      title: "VIEW RESULTS",
      content: "See how the community has voted and discover popular tools.",
      icon: TrendingUp,
      position: "bottom",
    },
  ],
};

export const profileTourConfig: PageTourConfig = {
  pageId: "profile",
  title: "Your Profile",
  steps: [
    {
      title: "YOUR PROFILE",
      content: "Track your progress, achievements, and contributions to the community.",
      icon: Users,
      position: "center",
    },
    {
      target: "[data-tour='profile-stats']",
      title: "YOUR STATS",
      content: "See your XP, level, and activity statistics at a glance.",
      icon: TrendingUp,
      position: "bottom",
    },
    {
      target: "[data-tour='profile-achievements']",
      title: "ACHIEVEMENTS",
      content: "Unlock achievements by exploring tools, creating decks, and engaging with the community.",
      icon: Award,
      position: "bottom",
    },
    {
      target: "[data-tour='profile-decks']",
      title: "YOUR DECKS",
      content: "View and manage all the decks you've created.",
      icon: Package,
      position: "bottom",
    },
  ],
};

export const leaderboardsTourConfig: PageTourConfig = {
  pageId: "leaderboards",
  title: "Leaderboards",
  steps: [
    {
      title: "LEADERBOARDS",
      content: "See how you rank against other members of the community!",
      icon: Trophy,
      position: "center",
    },
    {
      target: "[data-tour='leaderboard-tabs']",
      title: "DIFFERENT RANKINGS",
      content: "Switch between XP, battles won, decks created, and more.",
      icon: Layers,
      position: "bottom",
    },
    {
      target: "[data-tour='leaderboard-list']",
      title: "TOP PLAYERS",
      content: "See the top contributors and their achievements.",
      icon: Star,
      position: "top",
    },
  ],
};

export const forumTourConfig: PageTourConfig = {
  pageId: "forum",
  title: "Community Forum",
  steps: [
    {
      title: "COMMUNITY FORUM",
      content: "Discuss tools, share experiences, and get help from the community.",
      icon: MessageSquare,
      position: "center",
    },
    {
      target: "[data-tour='forum-categories']",
      title: "FORUM CATEGORIES",
      content: "Browse discussions organized by topic - from general chat to specific tool discussions.",
      icon: Layers,
      position: "bottom",
    },
    {
      target: "[data-tour='forum-new']",
      title: "START A DISCUSSION",
      content: "Create a new thread to ask questions or share your insights.",
      icon: Plus,
      position: "bottom",
    },
  ],
};

export const groupsTourConfig: PageTourConfig = {
  pageId: "groups",
  title: "Groups",
  steps: [
    {
      title: "COMMUNITY GROUPS",
      content: "Join groups of like-minded developers to share stacks and collaborate.",
      icon: Users,
      position: "center",
    },
    {
      target: "[data-tour='groups-list']",
      title: "BROWSE GROUPS",
      content: "Find groups based on interests, technologies, or project types.",
      icon: Search,
      position: "bottom",
    },
    {
      target: "[data-tour='groups-create']",
      title: "CREATE A GROUP",
      content: "Start your own group and invite others to join.",
      icon: Plus,
      position: "bottom",
    },
  ],
};

export const questsTourConfig: PageTourConfig = {
  pageId: "quests",
  title: "Quests",
  steps: [
    {
      title: "DAILY QUESTS",
      content: "Complete quests to earn XP and unlock special rewards!",
      icon: Target,
      position: "center",
    },
    {
      target: "[data-tour='quest-list']",
      title: "AVAILABLE QUESTS",
      content: "See your daily and weekly quests. Each has different rewards!",
      icon: BookOpen,
      position: "bottom",
    },
    {
      target: "[data-tour='quest-progress']",
      title: "TRACK PROGRESS",
      content: "Monitor your progress on each quest and claim rewards when complete.",
      icon: TrendingUp,
      position: "bottom",
    },
  ],
};

export const notificationsTourConfig: PageTourConfig = {
  pageId: "notifications",
  title: "Notifications",
  steps: [
    {
      title: "NOTIFICATIONS",
      content: "Stay updated on activity related to your account and interests.",
      icon: Bell,
      position: "center",
    },
    {
      target: "[data-tour='notification-list']",
      title: "YOUR NOTIFICATIONS",
      content: "See replies, mentions, achievements, and other updates.",
      icon: MessageSquare,
      position: "bottom",
    },
    {
      target: "[data-tour='notification-settings']",
      title: "MANAGE SETTINGS",
      content: "Customize which notifications you receive.",
      icon: Settings,
      position: "bottom",
    },
  ],
};

export const favoritesTourConfig: PageTourConfig = {
  pageId: "favorites",
  title: "Your Favorites",
  steps: [
    {
      title: "YOUR FAVORITES",
      content: "Quick access to all the tools you've favorited.",
      icon: Heart,
      position: "center",
    },
    {
      target: "[data-tour='favorites-list']",
      title: "FAVORITED TOOLS",
      content: "Browse and manage your collection of favorite tools.",
      icon: Star,
      position: "bottom",
    },
  ],
};

export const stackBuilderTourConfig: PageTourConfig = {
  pageId: "stack-builder",
  title: "Stack Builder",
  steps: [
    {
      title: "VISUAL STACK BUILDER",
      content: "Build and visualize your tech stack with our interactive builder.",
      icon: Layers,
      position: "center",
    },
    {
      target: "[data-tour='stack-canvas']",
      title: "DRAG & DROP",
      content: "Drag tools onto the canvas and connect them to show relationships.",
      icon: Wrench,
      position: "bottom",
    },
    {
      target: "[data-tour='stack-tools']",
      title: "TOOL PALETTE",
      content: "Browse and search for tools to add to your stack.",
      icon: Search,
      position: "left",
    },
    {
      target: "[data-tour='stack-save']",
      title: "SAVE & SHARE",
      content: "Save your stack and share it with the community.",
      icon: Globe,
      position: "bottom",
    },
  ],
};

export const communityTourConfig: PageTourConfig = {
  pageId: "community",
  title: "Community",
  steps: [
    {
      title: "COMMUNITY HUB",
      content: "Connect with other developers and share your tech stack journey.",
      icon: Users,
      position: "center",
    },
    {
      target: "[data-tour='community-feed']",
      title: "ACTIVITY FEED",
      content: "See what others are building, sharing, and discussing.",
      icon: TrendingUp,
      position: "bottom",
    },
    {
      target: "[data-tour='community-members']",
      title: "TOP MEMBERS",
      content: "Discover active community members and their contributions.",
      icon: Star,
      position: "bottom",
    },
  ],
};

export const getAllTourConfigs = (): Record<string, PageTourConfig> => ({
  home: homeTourConfig,
  tools: toolsTourConfig,
  compare: compareTourConfig,
  "decks-new": decksTourConfig,
  battles: battlesTourConfig,
  profile: profileTourConfig,
  leaderboards: leaderboardsTourConfig,
  forum: forumTourConfig,
  groups: groupsTourConfig,
  quests: questsTourConfig,
  notifications: notificationsTourConfig,
  favorites: favoritesTourConfig,
  "stack-builder": stackBuilderTourConfig,
  community: communityTourConfig,
});
