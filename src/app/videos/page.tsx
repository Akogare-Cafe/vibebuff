import { VideoTutorialHub } from "@/components/video-tutorial-hub";

export const metadata = {
  title: "Video Tutorials | VibeBuff",
  description: "Learn vibe coding through curated YouTube tutorials. Setup guides, prompting tips, and build-along videos.",
};

export default function VideosPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <VideoTutorialHub />
    </main>
  );
}
