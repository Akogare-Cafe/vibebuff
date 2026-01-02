import { VisualStackBuilder } from "@/components/visual-stack-builder";

export const metadata = {
  title: "Visual Stack Builder | VibeBuff",
  description: "Design your tech stack visually with drag-and-drop. See how tools connect and work together.",
};

export default function StackBuilderPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <VisualStackBuilder />
    </main>
  );
}
