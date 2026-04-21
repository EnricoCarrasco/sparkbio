"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { safeJsonLdString } from "@/lib/json-ld";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const faqKeys = ["q1", "q2", "q3", "q4", "q5"] as const;

export function FAQ() {
  const t = useTranslations("landing.faq");
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = faqKeys.map((key, i) => ({
    question: t(key),
    answer: t(key.replace("q", "a") as `a${1 | 2 | 3 | 4 | 5}`),
    index: i,
  }));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".faq-header > *", {
          opacity: 0,
          y: 24,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });

        const items = sectionRef.current?.querySelectorAll(".faq-item");
        if (items) {
          gsap.from(items, {
            opacity: 0,
            y: 16,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: items[0],
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(sectionRef.current?.querySelectorAll(".faq-header > *, .faq-item") ?? [], {
          clearProps: "all",
          opacity: 1,
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-3xl px-6">
        <div className="faq-header text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6B35] mb-4">
            {t("eyebrow")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
            {t("heading").split(t("headingHighlight")).map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <em className="not-italic text-[#FF6B35]">{t("headingHighlight")}</em>
                </span>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
          </h2>
        </div>

        <div className="divide-y divide-stone-200">
          {faqs.map(({ question, answer, index }) => (
            <div key={index} className="faq-item">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between py-6 text-left"
              >
                <span className="text-base sm:text-lg font-medium text-stone-900 pr-4">
                  {question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-stone-500" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-stone-600 leading-relaxed">{answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdString({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map(({ question, answer }) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: {
                "@type": "Answer",
                text: answer,
              },
            })),
          }),
        }}
      />
    </section>
  );
}
