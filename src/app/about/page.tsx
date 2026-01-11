import { Metadata } from "next";
import Link from "next/link";
import { Gamepad2, Target, Users, Zap, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About VIBEBUFF - AI-Powered Tech Stack Recommendations",
  description:
    "Learn about VIBEBUFF, the AI-powered platform helping developers discover the perfect tech stack for their projects. Our mission is to simplify technology decisions.",
  openGraph: {
    title: "About VIBEBUFF - AI-Powered Tech Stack Recommendations",
    description:
      "Learn about VIBEBUFF, the AI-powered platform helping developers discover the perfect tech stack.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gamepad2 className="w-8 h-8 text-muted-foreground" />
            <h1 className="text-primary text-xl pixel-glow">ABOUT VIBEBUFF</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
            Helping developers make better technology decisions with AI-powered recommendations
          </p>
        </div>

        {/* Mission */}
        <section className="border-4 border-border bg-card p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-muted-foreground" />
            <h2 className="text-primary text-sm">OUR MISSION</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Technology decisions are hard. With thousands of frameworks, libraries, and tools available,
            choosing the right stack for your project can be overwhelming. VIBEBUFF exists to simplify
            this process by providing AI-powered recommendations tailored to your specific needs.
          </p>
        </section>

        {/* What We Do */}
        <section className="mb-12">
          <h2 className="text-primary text-sm mb-6 text-center">WHAT WE OFFER</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-4 border-border bg-card p-6 text-center">
              <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-primary text-sm mb-2">AI RECOMMENDATIONS</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Describe your project and get personalized tech stack suggestions powered by AI.
              </p>
            </div>
            <div className="border-4 border-border bg-card p-6 text-center">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-primary text-sm mb-2">TOOL COMPARISONS</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Compare frameworks and tools side-by-side to make informed decisions.
              </p>
            </div>
            <div className="border-4 border-border bg-card p-6 text-center">
              <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-primary text-sm mb-2">COMMUNITY DRIVEN</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Built by developers, for developers. We continuously update our database.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-4 border-primary bg-card p-8 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-primary text-2xl mb-1">500+</p>
              <p className="text-muted-foreground text-xs">DEVELOPER TOOLS</p>
            </div>
            <div>
              <p className="text-primary text-2xl mb-1">15+</p>
              <p className="text-muted-foreground text-xs">CATEGORIES</p>
            </div>
            <div>
              <p className="text-primary text-2xl mb-1">AI</p>
              <p className="text-muted-foreground text-xs">POWERED</p>
            </div>
            <div>
              <p className="text-primary text-2xl mb-1">FREE</p>
              <p className="text-muted-foreground text-xs">TO USE</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-primary text-sm mb-4">READY TO FIND YOUR STACK?</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/"
              className="bg-primary text-background px-6 py-3 text-sm hover:bg-primary transition-colors"
            >
              AI STACK BUILDER
            </Link>
            <Link
              href="/tools"
              className="border-4 border-primary text-muted-foreground px-6 py-3 text-sm hover:bg-primary hover:text-background transition-colors"
            >
              BROWSE TOOLS
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
