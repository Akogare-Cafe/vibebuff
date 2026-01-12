export type BlogCategory =
  | "Frameworks"
  | "Backend"
  | "Frontend"
  | "DevOps"
  | "AI & ML"
  | "Database"
  | "Testing"
  | "Performance"
  | "Security"
  | "Mobile"
  | "Architecture"
  | "Tooling";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
  category: BlogCategory;
  featured: boolean;
  author: string;
  content: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
  category: BlogCategory;
  featured: boolean;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Frameworks",
  "Backend",
  "Frontend",
  "DevOps",
  "AI & ML",
  "Database",
  "Testing",
  "Performance",
  "Security",
  "Mobile",
  "Architecture",
  "Tooling",
];
