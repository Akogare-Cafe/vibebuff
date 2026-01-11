import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "VIBEBUFF Privacy Policy - Learn how we collect, use, and protect your personal information when using our tech stack recommendation platform.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-primary text-xl mb-8 pixel-glow">PRIVACY POLICY</h1>
        
        <div className="space-y-8 text-muted-foreground text-sm leading-relaxed">
          <p>Last updated: January 2025</p>

          <section>
            <h2 className="text-primary text-sm mb-4">1. INFORMATION WE COLLECT</h2>
            <p className="mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account information (email, username) when you sign up</li>
              <li>Project descriptions when using our Quest feature</li>
              <li>Preferences and saved tools</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-primary text-sm mb-4">2. HOW WE USE YOUR INFORMATION</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and improve our services</li>
              <li>Personalize your experience and recommendations</li>
              <li>Send you updates and marketing communications (with your consent)</li>
              <li>Analyze usage patterns to improve our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-primary text-sm mb-4">3. DATA SHARING</h2>
            <p>
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Service providers who assist in operating our platform</li>
              <li>Analytics providers to understand usage patterns</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-primary text-sm mb-4">4. DATA SECURITY</h2>
            <p>
              We implement industry-standard security measures to protect your data,
              including encryption, secure servers, and regular security audits.
            </p>
          </section>

          <section>
            <h2 className="text-primary text-sm mb-4">5. COOKIES</h2>
            <p>
              We use cookies and similar technologies to enhance your experience,
              remember your preferences, and analyze site traffic. You can control
              cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-primary text-sm mb-4">6. YOUR RIGHTS</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-primary text-sm mb-4">7. CONTACT US</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@vibebuff.dev" className="text-primary hover:underline">
                privacy@vibebuff.dev
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
