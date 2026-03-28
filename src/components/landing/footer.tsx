"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";

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
    <footer className="bg-white border-t border-black/[0.06]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-10">
        {/* Top row: brand + columns */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center" aria-label="Viopage home">
              <Image
                src="/images/landing/logo-viopage.png"
                alt="viopage"
                width={160}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-[14px] text-[#999] leading-relaxed max-w-[200px]">
              One link for everything you create.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading} className="flex flex-col gap-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-[#bbb]">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-[#888] hover:text-[#111113] transition-colors duration-150"
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
        <div className="border-t border-black/[0.06] pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-[#bbb]">
            {t("copyright", { year: currentYear })}
          </p>
          <Link
            href="/register"
            className="text-[13px] font-semibold text-[#FF6B35] hover:text-[#e85a24] transition-colors duration-150"
          >
            Get started free &rarr;
          </Link>
        </div>
      </div>
    </footer>
  );
}
