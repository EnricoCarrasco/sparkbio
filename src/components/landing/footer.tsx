"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ContactDialog } from "@/components/dashboard/contact-dialog";
import { LANDING, SANS_FONT, SERIF_FONT } from "./_primitives";

type FooterLink =
  | { label: string; href: string }
  | { label: string; action: "openContact" };

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export function Footer() {
  const t = useTranslations("landing.footer");
  const currentYear = new Date().getFullYear();
  const [contactOpen, setContactOpen] = useState(false);

  const columns: FooterColumn[] = [
    {
      heading: t("product"),
      links: [
        { label: t("themes"), href: "/#themes" },
        { label: t("pricing"), href: "/#pricing" },
        { label: t("analytics"), href: "/#how" },
      ],
    },
    {
      heading: t("company"),
      links: [
        { label: t("about"), href: "/about" },
        { label: t("blog"), href: "/blog" },
        { label: t("contact"), action: "openContact" },
      ],
    },
    {
      heading: t("resources"),
      links: [
        { label: t("help"), action: "openContact" },
        { label: t("status"), href: "/status" },
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
    <footer
      style={{
        background: LANDING.ink,
        color: "#fff",
        padding: "80px 0 40px",
        fontFamily: SANS_FONT,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 clamp(24px, 5vw, 48px)",
        }}
      >
        <div
          className="footer-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[2fr_repeat(4,1fr)] gap-x-8 gap-y-10 mb-16"
        >
          <div>
            <div
              style={{
                fontFamily: SERIF_FONT,
                fontStyle: "italic",
                fontSize: 36,
                color: "#fff",
                lineHeight: 1,
                maxWidth: 320,
                letterSpacing: "-0.01em",
              }}
            >
              {t("brandLine")}
            </div>
            <p
              style={{
                marginTop: 16,
                fontSize: 14,
                lineHeight: 1.6,
                color: "rgba(255,255,255,.55)",
                maxWidth: 320,
              }}
            >
              {t("tagline")}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.heading}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.5)",
                  marginBottom: 16,
                }}
              >
                {col.heading}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {col.links.map((link) => {
                  const common = {
                    color: "rgba(255,255,255,.8)",
                    fontSize: 14,
                    textDecoration: "none",
                    background: "transparent",
                    border: 0,
                    padding: 0,
                    textAlign: "left" as const,
                    cursor: "pointer",
                  };
                  return (
                    <li key={"href" in link ? link.href : link.action}>
                      {"action" in link ? (
                        <button
                          type="button"
                          onClick={() => setContactOpen(true)}
                          style={common}
                        >
                          {link.label}
                        </button>
                      ) : (
                        <Link href={link.href} style={common}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,.1)",
            fontSize: 12,
            color: "rgba(255,255,255,.5)",
          }}
        >
          <div>{t("copyright", { year: currentYear })}</div>
          <div style={{ display: "flex", gap: 16 }}>
            <span>English</span>
            <span>·</span>
            <span>Português</span>
          </div>
        </div>
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </footer>
  );
}
