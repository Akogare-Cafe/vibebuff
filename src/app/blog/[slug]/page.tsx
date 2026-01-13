import { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock, Twitter, Linkedin } from "lucide-react";
import { notFound } from "next/navigation";
import { BlogContent } from "@/components/blog-content";
import { getBlogPost, getBlogSlugs } from "@/lib/blog";
import { BlogPromoSection } from "@/components/blog-promo-section";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export async function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          BACK TO BLOG
        </Link>

        <article>
          <header className="mb-8">
            <h1 className="text-primary text-lg mb-4 leading-relaxed pixel-glow">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.readTime}
              </span>
              <span>By {post.author}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[6px] px-2 py-1 border border-primary text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed border-l-4 border-primary pl-4">
              {post.description}
            </p>
          </header>

          <div className="prose prose-invert prose-sm max-w-none">
            <BlogContent
              content={post.content}
              className="text-[#a0aec0] text-sm leading-relaxed space-y-4 blog-content"
            />
          </div>

          <div className="border-t-4 border-border mt-12 pt-8">
            <div className="flex items-center justify-between">
              <span className="text-primary text-sm">SHARE THIS ARTICLE</span>
              <div className="flex gap-4">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://vibebuff.dev/blog/${slug}?utm_source=twitter&utm_medium=social&utm_campaign=blog_share`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://vibebuff.dev/blog/${slug}?utm_source=linkedin&utm_medium=social&utm_campaign=blog_share`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </article>

        <div className="mt-12">
          <BlogPromoSection />
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            author: {
              "@type": "Organization",
              name: post.author,
            },
            datePublished: post.date,
            publisher: {
              "@type": "Organization",
              name: "VIBEBUFF",
              logo: {
                "@type": "ImageObject",
                url: "https://vibebuff.dev/logo.png",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://vibebuff.dev/blog/${slug}`,
            },
          }),
        }}
      />
    </div>
  );
}
