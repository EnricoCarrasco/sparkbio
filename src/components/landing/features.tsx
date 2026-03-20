"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView, type Variants } from "framer-motion";
import { PaletteIcon, BarChart3Icon, ZapIcon, RocketIcon } from "lucide-react";

interface FeatureCard {
  icon: React.ReactNode;
  titleKey: "customization" | "analytics" | "simple" | "fast";
  accentColor: string;
  bgColor: string;
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: <PaletteIcon className="h-6 w-6" />,
    titleKey: "customization",
    accentColor: "#FF6B35",
    bgColor: "#FFF4EF",
  },
  {
    icon: <BarChart3Icon className="h-6 w-6" />,
    titleKey: "analytics",
    accentColor: "#6366f1",
    bgColor: "#F0F0FF",
  },
  {
    icon: <ZapIcon className="h-6 w-6" />,
    titleKey: "simple",
    accentColor: "#10b981",
    bgColor: "#EFFFF8",
  },
  {
    icon: <RocketIcon className="h-6 w-6" />,
    titleKey: "fast",
    accentColor: "#f59e0b",
    bgColor: "#FFFBEF",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function Features() {
  const t = useTranslations("landing.features");
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="bg-white py-24 md:py-32"
      id="features"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          variants={titleVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E1E2E] leading-tight tracking-tight">
            {t("title")}
          </h2>
        </motion.div>

        {/* Feature cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {FEATURE_CARDS.map((card) => (
            <motion.div
              key={card.titleKey}
              variants={cardVariants}
              whileHover={{
                y: -4,
                boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)",
                transition: { duration: 0.2 },
              }}
              className="group relative flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow"
            >
              {/* Icon container */}
              <div
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: card.bgColor,
                  color: card.accentColor,
                }}
              >
                {card.icon}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-[#1E1E2E]">
                  {t(`${card.titleKey}.title`)}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t(`${card.titleKey}.description`)}
                </p>
              </div>

              {/* Subtle accent border on hover */}
              <div
                className="absolute bottom-0 left-8 right-8 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: card.accentColor }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
