import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog/posts";
import type { BlogPost, ContentSection } from "@/lib/blog/types";
import { BlogFAQ } from "@/components/blog/blog-faq";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const url = `${siteUrl}/blog/${slug}`;
  const ptBrUrl = `${siteUrl}/pt-BR/blog/${slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: url,
      languages: {
        en: url,
        "pt-BR": ptBrUrl,
        "x-default": url,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url,
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

function renderSection(section: ContentSection, index: number) {
  switch (section.type) {
    case "heading":
      return (
        <h2
          key={index}
          id={section.text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
          className="text-2xl sm:text-3xl font-bold text-stone-900 mt-12 mb-4 scroll-mt-24"
        >
          {section.text}
        </h2>
      );
    case "subheading":
      return (
        <h3 key={index} className="text-xl font-semibold text-stone-800 mt-8 mb-3">
          {section.text}
        </h3>
      );
    case "paragraph":
      return (
        <p key={index} className="text-stone-600 leading-relaxed mb-4">
          {section.text}
        </p>
      );
    case "list":
      return (
        <ul key={index} className="list-disc pl-6 mb-4 space-y-2">
          {section.items.map((item, i) => (
            <li key={i} className="text-stone-600 leading-relaxed">{item}</li>
          ))}
        </ul>
      );
    case "ordered-list":
      return (
        <ol key={index} className="list-decimal pl-6 mb-4 space-y-2">
          {section.items.map((item, i) => (
            <li key={i} className="text-stone-600 leading-relaxed">{item}</li>
          ))}
        </ol>
      );
    case "blockquote":
      return (
        <blockquote
          key={index}
          className="border-l-4 border-[#FF6B35] pl-6 py-2 my-6 text-stone-700 italic bg-orange-50/50 rounded-r-lg"
        >
          {section.text}
        </blockquote>
      );
    case "cta":
      return (
        <div
          key={index}
          className="my-8 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#e55a28] p-8 text-center text-white"
        >
          <p className="text-lg font-semibold mb-4">{section.text}</p>
          <Link
            href={section.href}
            className="inline-block rounded-full bg-white text-[#FF6B35] px-8 py-3 font-semibold hover:bg-orange-50 transition-colors"
          >
            {section.buttonText}
          </Link>
        </div>
      );
    case "comparison-table":
      return (
        <div key={index} className="my-8 overflow-x-auto">
          <table className="w-full border-collapse rounded-xl overflow-hidden text-sm">
            <thead>
              <tr className="bg-stone-900 text-white">
                {section.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                  {row.cells.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-stone-700 border-t border-stone-100">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-16 pt-12 border-t border-stone-200">
      <h2 className="text-2xl font-bold text-stone-900 mb-8">Related Posts</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-xl border border-stone-100 p-6 hover:shadow-md transition-shadow"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#FF6B35]">
              {post.category}
            </span>
            <h3 className="mt-2 text-base font-semibold text-stone-900 group-hover:text-[#FF6B35] transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="mt-2 text-sm text-stone-500 line-clamp-2">{post.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TableOfContents({ sections }: { sections: ContentSection[] }) {
  const headings = sections.filter((s) => s.type === "heading") as { type: "heading"; text: string }[];
  if (headings.length < 2) return null;

  return (
    <nav className="hidden xl:block sticky top-28 w-56 shrink-0 self-start">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-400 mb-3">
        On this page
      </p>
      <ul className="space-y-2 border-l border-stone-200 pl-4">
        {headings.map((h, i) => (
          <li key={i}>
            <a
              href={`#${h.text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="text-sm text-stone-500 hover:text-[#FF6B35] transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);

  return (
    <article className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-400 mb-8">
          <Link href="/blog" className="hover:text-[#FF6B35] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-stone-600">{post.category}</span>
        </nav>

        {/* Header */}
        <header className="max-w-3xl mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#FF6B35] mb-4 block">
            {post.category}
          </span>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight mb-6"
            style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}
          >
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-400">
            <span>By {post.author}</span>
            <span>-</span>
            <span>{post.date}</span>
            <span>-</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        {/* Hero image placeholder */}
        <div className="w-full aspect-[21/9] rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 mb-12 flex items-center justify-center">
          <span className="text-6xl text-stone-200">V</span>
        </div>

        {/* Content with ToC sidebar */}
        <div className="flex gap-12">
          <TableOfContents sections={post.content} />
          <div className="max-w-3xl min-w-0 flex-1">
            {post.content.map((section, i) => renderSection(section, i))}

            {/* FAQ */}
            {post.faq.length > 0 && (
              <BlogFAQ faqs={post.faq} />
            )}
          </div>
        </div>

        {/* Related Posts */}
        <RelatedPosts posts={related} />

        {/* Final CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#e55a28] p-12 text-center text-white">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}
          >
            <em>Start building your link in bio today</em>
          </h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Join 60,000+ creators who trust Viopage. 7-day free trial, no commitment.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-full bg-white text-[#FF6B35] px-8 py-3 font-semibold hover:bg-orange-50 transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </div>

      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            author: { "@type": "Organization", name: post.author },
            datePublished: post.date,
            publisher: {
              "@type": "Organization",
              name: "Viopage",
              url: siteUrl,
            },
          }),
        }}
      />
    </article>
  );
}
