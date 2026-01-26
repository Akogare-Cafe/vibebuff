import { Metadata } from "next";
import { DocsPageContent } from "./docs-page-content";

export const metadata: Metadata = {
  title: "Documentation & Help | VIBEBUFF",
  description:
    "Learn how to use VIBEBUFF to discover the perfect tech stack for your project. Guides, FAQs, and tips for developers.",
  openGraph: {
    title: "Documentation & Help | VIBEBUFF",
    description:
      "Learn how to use VIBEBUFF to discover the perfect tech stack for your project.",
    type: "website",
  },
};

export default function DocsPage() {
  return <DocsPageContent />;
}
