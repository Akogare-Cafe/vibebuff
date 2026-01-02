import { PromptPlayground } from "@/components/prompt-playground";

export const metadata = {
  title: "Prompt Playground | VibeBuff",
  description: "Learn to write effective prompts for AI coding assistants. Templates and challenges for all skill levels.",
};

export default function PromptsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <PromptPlayground />
    </main>
  );
}
