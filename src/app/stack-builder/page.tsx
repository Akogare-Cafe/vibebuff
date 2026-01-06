import { VisualStackBuilder } from "@/components/visual-stack-builder";

export const metadata = {
  title: "Visual Stack Builder | VibeBuff",
  description: "Design your tech stack visually with drag-and-drop. See how tools connect and work together.",
};

export default function StackBuilderPage() {
  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <VisualStackBuilder />
    </main>
  );
}
