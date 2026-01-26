"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PageLayout } from "@/components/page-layout";
import {
  ChevronRight,
  HelpCircle,
  Sparkles,
  Package,
  Scale,
  Layers,
  Star,
  Bot,
  MessageSquare,
  FileText,
} from "lucide-react";

const gettingStartedGuides = [
  {
    title: "AI Stack Builder",
    description: "Get AI-powered tech stack recommendations in minutes",
    href: "/",
    icon: Sparkles,
  },
  {
    title: "Browse Tools",
    description: "Explore our database of 500+ developer tools",
    href: "/tools",
    icon: Package,
  },
  {
    title: "Compare Tools",
    description: "Side-by-side comparisons of popular frameworks",
    href: "/compare",
    icon: Scale,
  },
  {
    title: "Visual Stack Builder",
    description: "Design your tech stack with drag-and-drop",
    href: "/stack-builder",
    icon: Layers,
  },
];

const faqs = [
  {
    question: "What is VIBEBUFF?",
    answer:
      "VIBEBUFF is an AI-powered platform that helps developers discover and compare tech stacks. Whether you're building a SaaS, mobile app, or web application, we provide personalized recommendations based on your project requirements, team expertise, and scalability needs.",
  },
  {
    question: "How does the AI recommendation work?",
    answer:
      "Simply describe your project in plain English - what you're building, your team size, performance requirements, and budget. Our AI analyzes your input against our database of 500+ tools to suggest the optimal combination of frameworks, databases, and services.",
  },
  {
    question: "Is VIBEBUFF free to use?",
    answer:
      "Yes! VIBEBUFF is completely free to use. You can browse our tool database, compare technologies, and get AI recommendations without any cost. Create an account to save your favorite stacks and access personalized features.",
  },
  {
    question: "What categories of tools do you cover?",
    answer:
      "We cover 15+ categories including frontend frameworks (React, Vue, Svelte), backend technologies (Node.js, Python, Go), databases (PostgreSQL, MongoDB, Redis), DevOps tools, AI/ML libraries, authentication services, payment processors, and more.",
  },
  {
    question: "How do I save my tech stack recommendations?",
    answer:
      "After completing a Quest or using the Stack Builder, you can save your recommendations to your Deck. Sign in with your account to access your saved stacks from any device. You can also share your stacks with others using a unique link.",
  },
  {
    question: "Can I compare multiple tools at once?",
    answer:
      "Yes! Our Compare feature allows you to select up to 4 tools and compare them side-by-side. You'll see differences in pricing, features, pros/cons, and use cases to help you make informed decisions.",
  },
  {
    question: "How often is the tool database updated?",
    answer:
      "We continuously update our database with new tools, version updates, and community feedback. Our team monitors the developer ecosystem to ensure you always have access to the latest and most relevant tools.",
  },
  {
    question: "Can I suggest a tool to be added?",
    answer:
      "Absolutely! We welcome community contributions. Use the Contact page to suggest new tools or provide feedback on existing entries. Our team reviews all submissions and adds relevant tools to the database.",
  },
];

const features = [
  {
    title: "AI-Powered Recommendations",
    description: "Get personalized tech stack suggestions based on your project needs",
    icon: Bot,
  },
  {
    title: "500+ Developer Tools",
    description: "Comprehensive database covering all major categories",
    icon: Package,
  },
  {
    title: "Side-by-Side Comparisons",
    description: "Compare tools on pricing, features, and use cases",
    icon: Scale,
  },
  {
    title: "Visual Stack Builder",
    description: "Design and visualize your tech stack architecture",
    icon: Layers,
  },
  {
    title: "Save & Share Stacks",
    description: "Save your recommendations and share with your team",
    icon: Star,
  },
  {
    title: "Community Driven",
    description: "Continuously updated with community feedback",
    icon: MessageSquare,
  },
];

export function DocsPageContent() {
  return (
    <PageLayout maxWidth="lg">
      <PageHeader
        title="DOCUMENTATION & HELP"
        description="Everything you need to know about using VIBEBUFF to find the perfect tech stack for your projects."
        icon={FileText}
      />

      <section className="mb-12">
        <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
          <ChevronRight className="w-4 h-4" /> GETTING STARTED
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gettingStartedGuides.map((guide) => (
            <Link key={guide.href} href={guide.href}>
              <div className="border-4 border-border bg-card p-6 hover:border-primary transition-colors cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <guide.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-primary text-sm mb-1">{guide.title}</h3>
                    <p className="text-muted-foreground text-xs">{guide.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
          <ChevronRight className="w-4 h-4" /> KEY FEATURES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="border-4 border-border bg-card p-5">
              <feature.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="text-primary text-sm mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-xs">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" /> FREQUENTLY ASKED QUESTIONS
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="border-4 border-border bg-card p-5 group"
            >
              <summary className="text-primary text-sm cursor-pointer list-none flex justify-between items-center">
                {faq.question}
                <span className="text-primary text-lg group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-muted-foreground text-sm mt-4 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
          <ChevronRight className="w-4 h-4" /> HOW TO USE VIBEBUFF
        </h2>
        <div className="border-4 border-border bg-card p-6">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="text-primary text-sm mb-1">Start Your Quest</h3>
                <p className="text-muted-foreground text-xs">
                  Click &quot;Start Quest&quot; and answer a few questions about your project type, scale, budget, and required features.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="text-primary text-sm mb-1">Get AI Recommendations</h3>
                <p className="text-muted-foreground text-xs">
                  Our AI analyzes your requirements and suggests the optimal combination of tools for each category (frontend, backend, database, etc.).
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="text-primary text-sm mb-1">Explore & Compare</h3>
                <p className="text-muted-foreground text-xs">
                  Click on any recommended tool to learn more, or use the Compare feature to evaluate alternatives side-by-side.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background font-bold shrink-0">
                4
              </div>
              <div>
                <h3 className="text-primary text-sm mb-1">Save & Share</h3>
                <p className="text-muted-foreground text-xs">
                  Save your tech stack to your Deck and share it with your team using a unique link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-4 border-primary bg-card p-8 text-center">
        <h2 className="text-primary text-sm mb-4">NEED MORE HELP?</h2>
        <p className="text-muted-foreground text-xs mb-6 max-w-xl mx-auto">
          Can&apos;t find what you&apos;re looking for? Contact our team and we&apos;ll be happy to help.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/contact"
            className="bg-primary text-background px-6 py-3 text-sm hover:bg-primary/90 transition-colors"
          >
            CONTACT US
          </Link>
          <Link
            href="/"
            className="border-4 border-primary text-muted-foreground px-6 py-3 text-sm hover:bg-primary hover:text-background transition-colors"
          >
            AI STACK BUILDER
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
