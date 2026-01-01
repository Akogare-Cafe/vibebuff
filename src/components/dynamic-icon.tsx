"use client";

import {
  Monitor,
  Bot,
  Layout,
  Layers,
  Wrench,
  Database,
  Lock,
  Cloud,
  Zap,
  Brain,
  Palette,
  FlaskConical,
  BarChart3,
  Sparkles,
  Terminal,
  Trophy,
  Search,
  Map,
  Crown,
  Swords,
  Flame,
  Shield,
  Medal,
  PartyPopper,
  Users,
  Vote,
  Coins,
  Star,
  Sprout,
  Target,
  Package,
  Frame,
  Gem,
  HelpCircle,
  Server,
  Container,
  Activity,
  TestTube,
  GitBranch,
  type LucideProps,
} from "lucide-react";

const iconComponents: Record<string, React.ComponentType<LucideProps>> = {
  Monitor,
  Bot,
  Layout,
  Layers,
  Wrench,
  Database,
  Lock,
  Cloud,
  Zap,
  Brain,
  Palette,
  FlaskConical,
  BarChart3,
  Sparkles,
  Terminal,
  Trophy,
  Search,
  Map,
  Crown,
  Swords,
  Flame,
  Shield,
  Medal,
  PartyPopper,
  Users,
  Vote,
  Coins,
  Star,
  Sprout,
  Target,
  Package,
  Frame,
  Gem,
  HelpCircle,
  Server,
  Container,
  Activity,
  TestTube,
  GitBranch,
};

interface DynamicIconProps extends Omit<LucideProps, "ref"> {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = iconComponents[name];
  
  if (!IconComponent) {
    return <HelpCircle {...props} />;
  }
  
  return <IconComponent {...props} />;
}
