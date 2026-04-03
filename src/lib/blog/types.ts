export interface BlogPost {
  slug: string;
  locale: "en" | "pt-BR";
  title: string;
  description: string;
  category: string;
  keyword: string;
  author: string;
  date: string;
  readTime: string;
  image?: string;
  content: ContentSection[];
  faq: { question: string; answer: string }[];
  relatedSlugs: string[];
}

export type ContentSection =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "cta"; text: string; buttonText: string; href: string }
  | {
      type: "comparison-table";
      headers: string[];
      rows: { cells: string[] }[];
    };
