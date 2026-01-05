import { StackMarketplace } from "@/components/stack-marketplace";

export const metadata = {
  title: "Stack Marketplace | VibeBuff",
  description: "Discover, share, and import community tech stacks. Browse popular stacks, upvote your favorites, and import them into your own stack builder.",
};

export default function StackMarketplacePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <StackMarketplace />
    </main>
  );
}
