import { LearningAcademy } from "@/components/learning-academy";

export const metadata = {
  title: "Vibe Coding Academy | VibeBuff",
  description: "Master vibe coding through guided learning paths. Learn AI-assisted coding from beginner to advanced.",
};

export default function LearnPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <LearningAcademy />
    </main>
  );
}
