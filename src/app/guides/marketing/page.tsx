import { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Megaphone,
  Search,
  TrendingUp,
  Target,
  BarChart3,
  Globe,
  FileText,
  ExternalLink,
  Lightbulb,
  Users,
  DollarSign,
  Zap,
  CheckCircle,
  ArrowRight,
  Code,
  Layers,
  Share2,
  Mail,
  MessageSquare,
  LineChart,
  Tag,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Marketing Guide for Vibe Coded Apps - SEO, GTM, Organic Growth",
  description:
    "Complete guide to marketing your vibe coded apps. Learn SEO optimization, Google Tag Manager setup, organic lead generation, and growth strategies for indie developers and startups.",
  keywords: [
    "vibe coding marketing",
    "app marketing guide",
    "SEO for developers",
    "Google Tag Manager setup",
    "organic lead generation",
    "indie hacker marketing",
    "startup marketing",
    "developer marketing",
    "app store optimization",
    "content marketing developers",
    "growth hacking",
    "product hunt launch",
    "developer tools marketing",
    "SaaS marketing",
    "web app SEO",
  ],
  openGraph: {
    title: "Marketing Guide for Vibe Coded Apps | VIBEBUFF",
    description:
      "Complete guide to marketing your vibe coded apps. SEO, GTM, organic growth strategies for developers.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketing Guide for Vibe Coded Apps",
    description:
      "Complete guide to marketing your vibe coded apps. SEO, GTM, organic growth strategies.",
  },
  alternates: {
    canonical: "https://vibebuff.dev/guides/marketing",
  },
};

const seoChecklist = [
  {
    title: "Meta Tags",
    description: "Title, description, and Open Graph tags for every page",
  },
  {
    title: "Semantic HTML",
    description: "Use proper heading hierarchy (h1, h2, h3) and semantic elements",
  },
  {
    title: "Sitemap.xml",
    description: "Auto-generate and submit to Google Search Console",
  },
  {
    title: "Robots.txt",
    description: "Control crawler access and point to sitemap",
  },
  {
    title: "Structured Data",
    description: "Add JSON-LD schema for rich snippets in search results",
  },
  {
    title: "Core Web Vitals",
    description: "Optimize LCP, FID, and CLS for better rankings",
  },
  {
    title: "Mobile-First",
    description: "Ensure responsive design and mobile usability",
  },
  {
    title: "Page Speed",
    description: "Compress images, lazy load, and minimize JavaScript",
  },
];

const gtmSteps = [
  {
    step: 1,
    title: "Create GTM Account",
    description: "Sign up at tagmanager.google.com and create a container for your app",
  },
  {
    step: 2,
    title: "Install GTM Snippet",
    description: "Add the GTM code to your app's head and body sections",
  },
  {
    step: 3,
    title: "Set Up GA4",
    description: "Create a GA4 tag in GTM to track pageviews and events",
  },
  {
    step: 4,
    title: "Configure Conversions",
    description: "Track sign-ups, purchases, and key user actions as conversions",
  },
  {
    step: 5,
    title: "Add Custom Events",
    description: "Track button clicks, form submissions, and feature usage",
  },
  {
    step: 6,
    title: "Test & Publish",
    description: "Use Preview mode to verify tags, then publish your container",
  },
];

const organicStrategies = [
  {
    icon: FileText,
    title: "Content Marketing",
    description: "Write blog posts, tutorials, and guides that solve problems for your target audience",
    tips: [
      "Target long-tail keywords with low competition",
      "Create comparison posts (X vs Y)",
      "Write how-to guides for your niche",
      "Share case studies and success stories",
    ],
  },
  {
    icon: Users,
    title: "Community Building",
    description: "Engage with developer communities and build your own following",
    tips: [
      "Be active on Twitter/X, Reddit, and Hacker News",
      "Answer questions on Stack Overflow",
      "Create a Discord or Slack community",
      "Host webinars or live coding sessions",
    ],
  },
  {
    icon: Share2,
    title: "Social Proof",
    description: "Leverage testimonials, reviews, and user-generated content",
    tips: [
      "Collect and display user testimonials",
      "Encourage reviews on G2, Capterra, Product Hunt",
      "Share user success stories on social media",
      "Create a public roadmap with user votes",
    ],
  },
  {
    icon: Zap,
    title: "Product-Led Growth",
    description: "Let your product be your best marketing channel",
    tips: [
      "Offer a generous free tier",
      "Add viral loops (referrals, sharing)",
      "Build in public and share progress",
      "Create shareable outputs from your app",
    ],
  },
];

const launchPlatforms = [
  {
    name: "Product Hunt",
    url: "https://www.producthunt.com",
    description: "The go-to platform for launching new products. Plan your launch day carefully.",
    tips: "Launch on Tuesday-Thursday, engage with comments, prepare assets in advance",
  },
  {
    name: "Hacker News",
    url: "https://news.ycombinator.com",
    description: "Share your Show HN post for developer-focused products.",
    tips: "Be authentic, respond to feedback, avoid self-promotion in comments",
  },
  {
    name: "Reddit",
    url: "https://www.reddit.com",
    description: "Find relevant subreddits like r/SideProject, r/webdev, r/startups.",
    tips: "Follow subreddit rules, provide value first, be transparent about being the creator",
  },
  {
    name: "Indie Hackers",
    url: "https://www.indiehackers.com",
    description: "Community of indie makers. Share your journey and milestones.",
    tips: "Document your journey, share revenue numbers, help others in the community",
  },
  {
    name: "Twitter/X",
    url: "https://twitter.com",
    description: "Build in public and grow your developer audience.",
    tips: "Share daily updates, engage with other builders, use relevant hashtags",
  },
  {
    name: "Dev.to",
    url: "https://dev.to",
    description: "Write technical articles and tutorials about your stack.",
    tips: "Focus on educational content, include code examples, engage with comments",
  },
];

const recommendedTools = [
  {
    category: "Analytics & Tracking",
    tools: [
      { name: "Google Analytics 4", slug: "google-analytics", description: "Free, comprehensive web analytics" },
      { name: "Plausible", slug: "plausible", description: "Privacy-friendly, lightweight analytics" },
      { name: "PostHog", slug: "posthog", description: "Product analytics with session recordings" },
      { name: "Mixpanel", slug: "mixpanel", description: "Advanced product and user analytics" },
    ],
  },
  {
    category: "SEO Tools",
    tools: [
      { name: "Google Search Console", slug: null, description: "Free SEO monitoring from Google", url: "https://search.google.com/search-console" },
      { name: "Ahrefs", slug: null, description: "Comprehensive SEO and backlink analysis", url: "https://ahrefs.com" },
      { name: "Semrush", slug: null, description: "All-in-one SEO and marketing toolkit", url: "https://www.semrush.com" },
      { name: "Screaming Frog", slug: null, description: "Technical SEO auditing tool", url: "https://www.screamingfrog.co.uk" },
    ],
  },
  {
    category: "Email Marketing",
    tools: [
      { name: "Resend", slug: "resend", description: "Developer-first email API" },
      { name: "ConvertKit", slug: null, description: "Email marketing for creators", url: "https://convertkit.com" },
      { name: "Buttondown", slug: null, description: "Simple newsletter tool for developers", url: "https://buttondown.email" },
      { name: "Loops", slug: null, description: "Email for SaaS companies", url: "https://loops.so" },
    ],
  },
  {
    category: "Social & Community",
    tools: [
      { name: "Buffer", slug: null, description: "Social media scheduling", url: "https://buffer.com" },
      { name: "Typefully", slug: null, description: "Twitter/X thread composer", url: "https://typefully.com" },
      { name: "Discord", slug: null, description: "Community platform for developers", url: "https://discord.com" },
      { name: "Circle", slug: null, description: "Community platform for creators", url: "https://circle.so" },
    ],
  },
];

const resources = [
  {
    title: "Google Search Central",
    url: "https://developers.google.com/search",
    description: "Official SEO documentation from Google",
  },
  {
    title: "web.dev",
    url: "https://web.dev",
    description: "Performance and SEO best practices",
  },
  {
    title: "Ahrefs Blog",
    url: "https://ahrefs.com/blog",
    description: "In-depth SEO guides and case studies",
  },
  {
    title: "GTM Documentation",
    url: "https://developers.google.com/tag-platform/tag-manager",
    description: "Official Google Tag Manager docs",
  },
  {
    title: "Indie Hackers Handbook",
    url: "https://www.indiehackers.com/start",
    description: "Guide to building profitable side projects",
  },
  {
    title: "Marketing for Developers",
    url: "https://marketingfordevelopers.com",
    description: "Marketing strategies for technical founders",
  },
];

export default function MarketingGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Megaphone className="w-8 h-8 text-primary" />
            <h1 className="text-primary text-xl font-heading">MARKETING YOUR VIBE CODED APP</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            A complete guide to SEO, Google Tag Manager, organic lead generation, and growth strategies 
            for indie developers and startups launching their vibe coded applications.
          </p>
        </div>

        <nav className="mb-12 border-4 border-border bg-card p-6">
          <h2 className="text-primary text-sm mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> TABLE OF CONTENTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <a href="#seo" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <ChevronRight className="w-3 h-3" /> SEO Fundamentals
            </a>
            <a href="#gtm" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <ChevronRight className="w-3 h-3" /> Google Tag Manager Setup
            </a>
            <a href="#organic" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <ChevronRight className="w-3 h-3" /> Organic Lead Generation
            </a>
            <a href="#launch" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <ChevronRight className="w-3 h-3" /> Launch Platforms
            </a>
            <a href="#tools" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <ChevronRight className="w-3 h-3" /> Recommended Tools
            </a>
            <a href="#resources" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <ChevronRight className="w-3 h-3" /> Resources & Learning
            </a>
          </div>
        </nav>

        <section id="seo" className="mb-16 scroll-mt-20">
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <Search className="w-4 h-4" /> SEO FUNDAMENTALS
          </h2>
          <div className="border-4 border-border bg-card p-6 mb-6">
            <p className="text-muted-foreground text-sm mb-6">
              Search Engine Optimization is crucial for organic discovery. Here&apos;s your checklist 
              for making your vibe coded app SEO-friendly from day one.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {seoChecklist.map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-3 bg-background border border-border">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-primary text-xs font-medium">{item.title}</h3>
                    <p className="text-muted-foreground text-xs">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-4 border-primary/50 bg-card p-6">
            <h3 className="text-primary text-sm mb-4 flex items-center gap-2">
              <Code className="w-4 h-4" /> NEXT.JS SEO EXAMPLE
            </h3>
            <pre className="bg-background border border-border p-4 overflow-x-auto text-xs text-muted-foreground">
{`// app/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your App Name - Tagline",
  description: "A compelling description under 160 chars",
  keywords: ["keyword1", "keyword2", "keyword3"],
  openGraph: {
    title: "Your App Name",
    description: "Description for social sharing",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your App Name",
    description: "Description for Twitter",
  },
  alternates: {
    canonical: "https://yourapp.com",
  },
};`}
            </pre>
          </div>
        </section>

        <section id="gtm" className="mb-16 scroll-mt-20">
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <Tag className="w-4 h-4" /> GOOGLE TAG MANAGER SETUP
          </h2>
          <div className="border-4 border-border bg-card p-6 mb-6">
            <p className="text-muted-foreground text-sm mb-6">
              Google Tag Manager lets you manage analytics, conversion tracking, and marketing tags 
              without modifying your code. Follow these steps to set it up.
            </p>
            <div className="space-y-4">
              {gtmSteps.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-primary text-sm mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-xs">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-4 border-primary/50 bg-card p-6">
            <h3 className="text-primary text-sm mb-4 flex items-center gap-2">
              <Code className="w-4 h-4" /> GTM INSTALLATION CODE
            </h3>
            <pre className="bg-background border border-border p-4 overflow-x-auto text-xs text-muted-foreground">
{`// Add to <head>
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-XXXXXX');
</script>

// Add after opening <body>
<noscript>
  <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
  height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>`}
            </pre>
          </div>
        </section>

        <section id="organic" className="mb-16 scroll-mt-20">
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> ORGANIC LEAD GENERATION
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Paid ads can be expensive. Focus on these organic strategies to build sustainable growth.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {organicStrategies.map((strategy) => (
              <div key={strategy.title} className="border-4 border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <strategy.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-primary text-sm">{strategy.title}</h3>
                </div>
                <p className="text-muted-foreground text-xs mb-4">{strategy.description}</p>
                <ul className="space-y-2">
                  {strategy.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="launch" className="mb-16 scroll-mt-20">
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <Target className="w-4 h-4" /> LAUNCH PLATFORMS
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Where to launch and promote your vibe coded app for maximum visibility.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {launchPlatforms.map((platform) => (
              <a
                key={platform.name}
                href={`${platform.url}${platform.url.includes('?') ? '&' : '?'}utm_source=vibebuff&utm_medium=marketing_guide&utm_campaign=launch_platforms`}
                target="_blank"
                rel="noopener noreferrer"
                className="border-4 border-border bg-card p-5 hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-primary text-sm">{platform.name}</h3>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-xs mb-3">{platform.description}</p>
                <div className="flex items-start gap-2 p-2 bg-background border border-border">
                  <Lightbulb className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{platform.tips}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section id="tools" className="mb-16 scroll-mt-20">
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <Layers className="w-4 h-4" /> RECOMMENDED TOOLS FROM VIBEBUFF
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            These tools from our database can help you with marketing, analytics, and growth.
          </p>
          <div className="space-y-6">
            {recommendedTools.map((category) => (
              <div key={category.category} className="border-4 border-border bg-card p-6">
                <h3 className="text-primary text-sm mb-4">{category.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.tools.map((tool) => (
                    tool.slug ? (
                      <Link
                        key={tool.name}
                        href={`/tools/${tool.slug}`}
                        className="flex items-center justify-between p-3 bg-background border border-border hover:border-primary transition-colors"
                      >
                        <div>
                          <h4 className="text-primary text-xs font-medium">{tool.name}</h4>
                          <p className="text-muted-foreground text-xs">{tool.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    ) : tool.url ? (
                      <a
                        key={tool.name}
                        href={`${tool.url}${tool.url.includes('?') ? '&' : '?'}utm_source=vibebuff&utm_medium=marketing_guide&utm_campaign=recommended_tools`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-background border border-border hover:border-primary transition-colors"
                      >
                        <div>
                          <h4 className="text-primary text-xs font-medium">{tool.name}</h4>
                          <p className="text-muted-foreground text-xs">{tool.description}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </a>
                    ) : null
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="resources" className="mb-16 scroll-mt-20">
          <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> RESOURCES & LEARNING
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <a
                key={resource.title}
                href={`${resource.url}${resource.url.includes('?') ? '&' : '?'}utm_source=vibebuff&utm_medium=marketing_guide&utm_campaign=learning_resources`}
                target="_blank"
                rel="noopener noreferrer"
                className="border-4 border-border bg-card p-5 hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-primary text-xs font-medium">{resource.title}</h3>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-xs">{resource.description}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="border-4 border-primary bg-card p-8">
            <div className="text-center">
              <h2 className="text-primary text-sm mb-4 flex items-center justify-center gap-2">
                <LineChart className="w-4 h-4" /> QUICK WINS CHECKLIST
              </h2>
              <p className="text-muted-foreground text-xs mb-6 max-w-xl mx-auto">
                Start with these high-impact, low-effort marketing tasks today.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[
                "Set up Google Search Console and submit sitemap",
                "Add meta tags and Open Graph images to all pages",
                "Create a Product Hunt upcoming page",
                "Write your first blog post about your tech stack",
                "Set up Google Analytics 4 via GTM",
                "Join 3 relevant communities and introduce yourself",
                "Add a newsletter signup to capture leads",
                "Create a Twitter/X account and post your first update",
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-background border border-border">
                  <div className="w-6 h-6 border-2 border-primary flex items-center justify-center text-xs text-primary">
                    {i + 1}
                  </div>
                  <span className="text-muted-foreground text-xs">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-4 border-primary bg-card p-8 text-center">
          <h2 className="text-primary text-sm mb-4">NEED HELP BUILDING YOUR STACK?</h2>
          <p className="text-muted-foreground text-xs mb-6 max-w-xl mx-auto">
            Use VIBEBUFF to discover the perfect tools for your project, including analytics, 
            email marketing, and growth tools.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/"
              className="bg-primary text-background px-6 py-3 text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              AI STACK BUILDER
            </Link>
            <Link
              href="/tools"
              className="border-4 border-primary text-muted-foreground px-6 py-3 text-sm hover:bg-primary hover:text-background transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              BROWSE TOOLS
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
