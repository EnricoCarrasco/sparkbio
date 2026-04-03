import type { BlogPost } from "./types";

// Import individual post files
import { viopageVsLinktree } from "./posts/viopage-vs-linktree";
import { alternativasLinktree } from "./posts/alternativas-linktree";

export const allPosts: BlogPost[] = [
  viopageVsLinktree,
  alternativasLinktree,
];

export function getPostBySlug(slug: string, locale?: "en" | "pt-BR"): BlogPost | undefined {
  return allPosts.find(
    (p) => p.slug === slug && (!locale || p.locale === locale)
  );
}

export function getPostsByLocale(locale: "en" | "pt-BR"): BlogPost[] {
  return allPosts.filter((p) => p.locale === locale);
}

export function getRelatedPosts(post: BlogPost): BlogPost[] {
  return post.relatedSlugs
    .map((slug) => allPosts.find((p) => p.slug === slug))
    .filter(Boolean) as BlogPost[];
}
