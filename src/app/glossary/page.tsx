import { GlossaryExplorer } from "@/components/glossary-explorer";

export const metadata = {
  title: "Glossary & Concepts | VibeBuff",
  description: "Learn vibe coding terminology in plain English. Understand AI, IDEs, and development concepts.",
};

export default function GlossaryPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <GlossaryExplorer />
    </main>
  );
}
