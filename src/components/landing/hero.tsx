"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, type Variants } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

const MARQUEE_KEYS = [
  "creators",
  "influencers",
  "smallBusinesses",
  "musicians",
  "podcasters",
  "athletes",
  "coaches",
  "photographers",
  "writers",
  "artists",
  "brands",
  "freelancers",
] as const;

/* ── Phone mockup data ── */
const PHONE_MOCKUPS = [
  {
    id: "left",
    rotate: -8,
    translateY: 24,
    bg: "#FAFAFA",
    accent: "#FF6B35",
    avatarBg: "#FFE0D0",
    shadow: "0 16px 40px rgba(0,0,0,0.12)",
    buttons: ["#FF6B35", "#FF8C5A", "#FFB088"],
    textColor: "#333",
  },
  {
    id: "center",
    rotate: 0,
    translateY: -16,
    bg: "#FFFFFF",
    accent: "#111111",
    avatarBg: "#E5E5E5",
    shadow: "0 20px 60px rgba(0,0,0,0.15)",
    buttons: ["#111111", "#111111", "#111111", "#111111"],
    textColor: "#111",
  },
  {
    id: "right",
    rotate: 8,
    translateY: 24,
    bg: "#1A1A2E",
    accent: "#E94560",
    avatarBg: "#2A2A4E",
    shadow: "0 16px 40px rgba(0,0,0,0.12)",
    buttons: ["#E94560", "#E94560", "#E94560"],
    textColor: "#EAEAEA",
  },
] as const;

function PhoneMockup({
  phone,
  isCenter,
}: {
  phone: (typeof PHONE_MOCKUPS)[number];
  isCenter: boolean;
}) {
  const width = isCenter ? 180 : 150;
  const height = isCenter ? 340 : 290;

  return (
    <div
      className="shrink-0 relative"
      style={{
        transform: `rotate(${phone.rotate}deg) translateY(${phone.translateY}px)`,
        width,
        height,
      }}
    >
      {/* Phone frame */}
      <div
        className="absolute inset-0 rounded-[24px] overflow-hidden flex flex-col items-center"
        style={{
          backgroundColor: phone.bg,
          boxShadow: phone.shadow,
          border:
            phone.id === "right"
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {/* Status bar */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div
            className="w-16 h-1 rounded-full"
            style={{
              backgroundColor:
                phone.id === "right"
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(0,0,0,0.1)",
            }}
          />
        </div>

        {/* Avatar */}
        <div
          className="rounded-full mt-4"
          style={{
            width: isCenter ? 44 : 36,
            height: isCenter ? 44 : 36,
            backgroundColor: phone.avatarBg,
          }}
        />

        {/* Name bar */}
        <div
          className="rounded-full mt-3"
          style={{
            width: isCenter ? 72 : 56,
            height: 8,
            backgroundColor:
              phone.id === "right"
                ? "rgba(255,255,255,0.2)"
                : "rgba(0,0,0,0.12)",
          }}
        />

        {/* Bio line */}
        <div
          className="rounded-full mt-1.5"
          style={{
            width: isCenter ? 96 : 80,
            height: 5,
            backgroundColor:
              phone.id === "right"
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.06)",
          }}
        />

        {/* Link buttons */}
        <div
          className="flex flex-col gap-2 w-full px-4 mt-5"
          style={{ gap: isCenter ? 8 : 6 }}
        >
          {phone.buttons.map((color, i) => (
            <div
              key={i}
              className="w-full rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: color,
                height: isCenter ? 32 : 26,
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: isCenter ? 48 : 36,
                  height: 5,
                  backgroundColor: "rgba(255,255,255,0.5)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const t = useTranslations("landing.hero");
  const tMarquee = useTranslations("landing.marquee");
  const router = useRouter();
  const [username, setUsername] = useState("");

  function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim().replace(/\s+/g, "").toLowerCase();
    if (trimmed) {
      router.push(`/register?username=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/register");
    }
  }

  return (
    <section className="relative overflow-hidden">
      {/* ── Gradient background ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #d4450a 0%, #c74b15 20%, #b8610f 40%, #0a7a6a 65%, #3b3fc0 100%)",
        }}
      />

      {/* ── Dark overlay for text contrast ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.20) 100%)",
        }}
      />

      {/* ── Noise texture overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage:
            "repeating-conic-gradient(rgba(0,0,0,0.8) 0% 25%, transparent 0% 50%)",
          backgroundSize: "4px 4px",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8 pt-40 pb-20 md:pt-52 md:pb-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Eyebrow badge */}
          <motion.div variants={itemVariants}>
            <span
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium text-white/90 mb-10 tracking-[0.01em]"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {t("eyebrow")}
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={itemVariants}
            className="text-[56px] sm:text-[72px] md:text-[88px] lg:text-[96px] leading-[1.0] tracking-[-0.04em] text-white font-bold max-w-4xl"
            style={{
              fontFamily:
                "var(--font-display), 'Instrument Serif', Georgia, serif",
            }}
          >
            <span style={{ fontStyle: "italic" }}>{t("titleLine1")}</span>{" "}
            {t("titleLine1b")}
            <br />
            {t("titleLine2a")}{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("titleLine2b")}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-8 text-[18px] sm:text-[20px] leading-[1.6] max-w-xl font-normal"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            {t("subtitle")}
          </motion.p>

          {/* Username claim form — glassmorphism bar */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleClaim}
            className="mt-12 w-full max-w-lg"
          >
            <div
              className="flex flex-col sm:flex-row items-stretch sm:items-center rounded-full overflow-hidden"
              style={{
                backgroundColor: "rgba(255,255,255,0.20)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {/* Input area */}
              <div className="flex flex-1 items-center px-5 py-0 min-w-0">
                <span className="text-[14px] font-medium shrink-0 select-none pr-1 text-white/60">
                  sparkbio.com/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  aria-label="Choose your username"
                  className="flex-1 bg-transparent py-4 text-[15px] text-white placeholder-white/40 outline-none min-w-0"
                  maxLength={30}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-[#FF6B35] hover:bg-white/90 active:scale-[0.97] transition-all duration-150 whitespace-nowrap m-1.5 shrink-0"
              >
                {t("claim")}
                <ArrowRightIcon className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </motion.form>

          {/* Trust line */}
          <motion.p
            variants={itemVariants}
            className="mt-5 text-[13px] font-medium tracking-[0.01em]"
            style={{ color: "rgba(255,255,255,0.80)" }}
          >
            <span aria-hidden="true">&#10003;</span> {t("trustLine1")}{" "}
            <span className="mx-1.5" aria-hidden="true">
              &middot;
            </span>{" "}
            <span aria-hidden="true">&#10003;</span> {t("trustLine2")}{" "}
            <span className="mx-1.5" aria-hidden="true">
              &middot;
            </span>{" "}
            <span aria-hidden="true">&#10003;</span> {t("trustLine3")}
          </motion.p>

          {/* ── Floating phone mockups ── */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex items-end justify-center gap-4 sm:gap-6 md:gap-8"
          >
            {PHONE_MOCKUPS.map((phone) => (
              <PhoneMockup
                key={phone.id}
                phone={phone}
                isCenter={phone.id === "center"}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Platform marquee ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6, ease: EASE }}
        className="relative z-10 py-5 overflow-hidden"
        style={{
          backgroundColor: "rgba(255,255,255,0.08)",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
        aria-label="Trusted by creators worldwide"
      >
        <p
          className="text-center text-[11px] font-medium uppercase tracking-[0.12em] mb-3"
          style={{ color: "rgba(255,255,255,0.50)" }}
        >
          {tMarquee("label")}
        </p>
        <div className="flex items-center gap-8 whitespace-nowrap hero-marquee">
          {[...MARQUEE_KEYS, ...MARQUEE_KEYS].map((key, i) => (
            <span
              key={i}
              className="text-[13px] font-medium uppercase tracking-[0.08em] shrink-0"
              style={{ color: "rgba(255,255,255,0.60)" }}
            >
              {t(`marquee.${key}`)}
              <span
                className="ml-8"
                style={{ color: "rgba(255,255,255,0.25)" }}
                aria-hidden="true"
              >
                &middot;
              </span>
            </span>
          ))}
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes heroMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .hero-marquee {
          animation: heroMarquee 28s linear infinite;
        }
      `}</style>
    </section>
  );
}
