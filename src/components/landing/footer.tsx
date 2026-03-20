"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ZapIcon } from "lucide-react";

interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

export function Footer() {
  const t = useTranslations("landing.footer");
  const currentYear = new Date().getFullYear();

  const columns: FooterColumn[] = [
    {
      heading: t("product"),
      links: [
        { label: t("features"), href: "/#features" },
        { label: t("pricing"), href: "/#pricing" },
      ],
    },
    {
      heading: t("company"),
      links: [
        { label: t("about"), href: "/about" },
        { label: t("blog"), href: "/blog" },
      ],
    },
    {
      heading: t("legal"),
      links: [
        { label: t("privacy"), href: "/privacy" },
        { label: t("terms"), href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B35]">
                <ZapIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1E1E2E] tracking-tight">
                sparkbio
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              The simplest way to share everything you are — one link for all
              your content.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading} className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-[#FF6B35] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            {t("copyright", { year: currentYear })}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Built with</span>
            <span className="text-xs font-semibold text-[#FF6B35]">
              Sparkbio
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
