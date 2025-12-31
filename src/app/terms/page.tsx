import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "VIBEBUFF Terms of Service - Read our terms and conditions for using our AI-powered tech stack recommendation platform.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#000000]">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-[#60a5fa] text-xl mb-8 pixel-glow">TERMS OF SERVICE</h1>
        
        <div className="space-y-8 text-[#3b82f6] text-[10px] leading-relaxed">
          <p>Last updated: January 2025</p>

          <section>
            <h2 className="text-[#60a5fa] text-sm mb-4">1. ACCEPTANCE OF TERMS</h2>
            <p>
              By accessing and using VIBEBUFF, you accept and agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-[#60a5fa] text-sm mb-4">2. DESCRIPTION OF SERVICE</h2>
            <p>
              VIBEBUFF provides AI-powered tech stack recommendations, tool comparisons,
              and developer resources. Our service is provided &quot;as is&quot; and we make no
              guarantees about the accuracy or suitability of recommendations for your specific use case.
            </p>
          </section>

          <section>
            <h2 className="text-[#60a5fa] text-sm mb-4">3. USER ACCOUNTS</h2>
            <p className="mb-4">When creating an account, you agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#60a5fa] text-sm mb-4">4. ACCEPTABLE USE</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Scrape or collect data without permission</li>
              <li>Impersonate others or misrepresent your affiliation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#60a5fa] text-sm mb-4">5. INTELLECTUAL PROPERTY</h2>
            <p>
              All content, features, and functionality of VIBEBUFF are owned by us and
              protected by copyright, trademark, and other intellectual property laws.
              You may not reproduce, distribute, or create derivative works without our permission.
            </p>
          </section>

          <section>
            <h2 className="text-[#60a5fa] text-sm mb-4">6. DISCLAIMER OF WARRANTIES</h2>
            <p>
              VIBEBUFF is provided &quot;as is&quot; without warranties of any kind. We do not
              guarantee that the service will be uninterrupted, secure, or error-free.
              Recommendations are for informational purposes only and should not be
              considered professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-[#60a5fa] text-sm mb-4">7. LIMITATION OF LIABILITY</h2>
            <p>
              To the maximum extent permitted by law, VIBEBUFF shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages
              arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-[#60a5fa] text-sm mb-4">8. CHANGES TO TERMS</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify
              users of significant changes via email or through the service. Continued
              use after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-[#60a5fa] text-sm mb-4">9. CONTACT</h2>
            <p>
              For questions about these Terms of Service, contact us at{" "}
              <a href="mailto:legal@vibebuff.com" className="text-[#60a5fa] hover:underline">
                legal@vibebuff.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
