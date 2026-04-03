import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { getPostsByLocale } from "@/lib/blog/posts";
import type { BlogPost } from "@/lib/blog/types";
import { BlogCardImage } from "@/components/blog/blog-card-image";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

export const metadata: Metadata = {
  title: "Blog — Tips & Guides for Creators",
  description:
    "Tips, guides, and strategies for creators building their online presence with a professional link-in-bio page.",
  alternates: {
    canonical: `${siteUrl}/blog`,
    languages: {
      en: `${siteUrl}/blog`,
      "pt-BR": `${siteUrl}/pt-BR/blog`,
      "x-default": `${siteUrl}/blog`,
    },
  },
};

const BLOG_TEXT = {
  en: {
    heading: "The Viopage Blog",
    subtitle: "Tips, guides, and strategies for creators building their online presence.",
    readMore: "Read more",
    comingSoon: "Coming soon.",
  },
  "pt-BR": {
    heading: "Blog Viopage",
    subtitle: "Dicas, guias e estratégias para criadores construindo sua presença online.",
    readMore: "Ler mais",
    comingSoon: "Em breve.",
  },
} as const;

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl bg-white border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <BlogCardImage title={post.title} category={post.category} image={post.image} />
      <div className="p-6 flex flex-col flex-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#FF6B35] mb-3">
          {post.category}
        </span>
        <h3 className="text-lg font-semibold text-stone-900 group-hover:text-[#FF6B35] transition-colors line-clamp-2 mb-2">
          {post.title}
        </h3>
        <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-1">
          {post.description}
        </p>
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>{post.date}</span>
          <span>{post.readTime}</span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedPost({ post, locale }: { post: BlogPost; locale: "en" | "pt-BR" }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid md:grid-cols-2 gap-8 rounded-2xl bg-white border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="md:min-h-[280px]">
        <BlogCardImage title={post.title} category={post.category} image={post.image} variant="hero" />
      </div>
      <div className="p-8 flex flex-col justify-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#FF6B35] mb-3">
          {post.category}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 group-hover:text-[#FF6B35] transition-colors mb-4">
          {post.title}
        </h2>
        <p className="text-stone-500 mb-6 line-clamp-3">
          {post.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-stone-400">
          <span>{post.author}</span>
          <span>-</span>
          <span>{post.date}</span>
          <span>-</span>
          <span>{post.readTime}</span>
        </div>
        <span className="mt-4 text-[#FF6B35] font-medium text-sm">
          {BLOG_TEXT[locale].readMore} &rarr;
        </span>
      </div>
    </Link>
  );
}

export default async function BlogIndexPage() {
  // Detect locale from proxy header (set by /pt-BR/* rewrite)
  const allHeaders = await headers();
  const locale = allHeaders.get("x-locale-override") === "pt-BR" ? "pt-BR" : "en";
  const posts = getPostsByLocale(locale);
  const [featured, ...rest] = posts;

  const t = BLOG_TEXT[locale];

  if (!featured) {
    return (
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h1
            className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4"
            style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}
          >
            <em>{t.heading}</em>
          </h1>
          <p className="text-lg text-stone-500">{t.comingSoon}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 mb-4"
            style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}
          >
            <em>{t.heading}</em>
          </h1>
          <p className="text-lg text-stone-500 max-w-xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Featured post */}
        <FeaturedPost post={featured} locale={locale} />

        {/* Post grid */}
        {rest.length > 0 && (
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
