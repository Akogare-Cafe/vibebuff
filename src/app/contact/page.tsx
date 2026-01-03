import { Metadata } from "next";
import { Mail, MessageSquare, Github, Twitter } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the VIBEBUFF team. We'd love to hear your feedback, suggestions, or questions about our tech stack recommendation platform.",
  openGraph: {
    title: "Contact VIBEBUFF",
    description: "Get in touch with the VIBEBUFF team for feedback, suggestions, or questions.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-primary text-xl mb-4 pixel-glow">CONTACT US</h1>
          <p className="text-muted-foreground text-[10px] max-w-xl mx-auto">
            Have questions, feedback, or suggestions? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="border-4 border-border bg-card p-8">
            <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              SEND A MESSAGE
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-muted-foreground text-[8px] mb-2">NAME</label>
                <input
                  type="text"
                  className="w-full bg-background border-4 border-border text-primary px-4 py-2 text-[10px] focus:border-primary outline-none"
                  placeholder="YOUR NAME..."
                />
              </div>
              <div>
                <label className="block text-muted-foreground text-[8px] mb-2">EMAIL</label>
                <input
                  type="email"
                  className="w-full bg-background border-4 border-border text-primary px-4 py-2 text-[10px] focus:border-primary outline-none"
                  placeholder="YOUR EMAIL..."
                />
              </div>
              <div>
                <label className="block text-muted-foreground text-[8px] mb-2">SUBJECT</label>
                <select className="w-full bg-background border-4 border-border text-primary px-4 py-2 text-[10px] focus:border-primary outline-none">
                  <option>GENERAL INQUIRY</option>
                  <option>FEEDBACK</option>
                  <option>BUG REPORT</option>
                  <option>FEATURE REQUEST</option>
                  <option>PARTNERSHIP</option>
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground text-[8px] mb-2">MESSAGE</label>
                <textarea
                  rows={5}
                  className="w-full bg-background border-4 border-border text-primary px-4 py-2 text-[10px] focus:border-primary outline-none resize-none"
                  placeholder="YOUR MESSAGE..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-background px-6 py-3 text-[10px] hover:bg-primary transition-colors"
              >
                SEND MESSAGE
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="border-4 border-border bg-card p-8">
              <h2 className="text-primary text-sm mb-6 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                EMAIL US
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground text-[8px] mb-1">GENERAL INQUIRIES</p>
                  <a
                    href="mailto:hello@vibebuff.com"
                    className="text-primary text-[10px] hover:underline"
                  >
                    hello@vibebuff.com
                  </a>
                </div>
                <div>
                  <p className="text-muted-foreground text-[8px] mb-1">SUPPORT</p>
                  <a
                    href="mailto:support@vibebuff.com"
                    className="text-primary text-[10px] hover:underline"
                  >
                    support@vibebuff.com
                  </a>
                </div>
                <div>
                  <p className="text-muted-foreground text-[8px] mb-1">PARTNERSHIPS</p>
                  <a
                    href="mailto:partners@vibebuff.com"
                    className="text-primary text-[10px] hover:underline"
                  >
                    partners@vibebuff.com
                  </a>
                </div>
              </div>
            </div>

            <div className="border-4 border-border bg-card p-8">
              <h2 className="text-primary text-sm mb-6">CONNECT WITH US</h2>
              <div className="flex gap-4">
                <a
                  href="https://github.com/vibebuff"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary text-[10px]"
                >
                  <Github className="w-5 h-5" />
                  GITHUB
                </a>
                <a
                  href="https://twitter.com/vibebuff"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary text-[10px]"
                >
                  <Twitter className="w-5 h-5" />
                  TWITTER
                </a>
              </div>
            </div>

            <div className="border-4 border-primary bg-card p-8 text-center">
              <p className="text-primary text-[10px] mb-2">RESPONSE TIME</p>
              <p className="text-muted-foreground text-[8px]">
                We typically respond within 24-48 hours during business days.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
