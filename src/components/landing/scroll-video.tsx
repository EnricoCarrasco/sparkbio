"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const stats = [
  { value: 50000, suffix: "+", labelKey: "creators" },
  { value: 1000000, suffix: "+", labelKey: "links" },
  { value: 99.9, suffix: "%", labelKey: "uptime" },
] as const;

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  if (n % 1 !== 0) return n.toFixed(1);
  return n.toString();
}

function AnimatedNumber({
  target,
  suffix,
  inView,
}: {
  target: number;
  suffix: string;
  inView: boolean;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 2000;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span>
      {formatNumber(current)}
      {suffix}
    </span>
  );
}

export function StatsBar() {
  const t = useTranslations("landing.stats");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section
      ref={ref}
      className="relative bg-white border-b border-black/[0.06]"
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          className="grid grid-cols-3 gap-8 md:gap-16"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                ease: EASE,
                delay: i * 0.12,
              }}
              className="text-center"
            >
              <div className="text-[32px] sm:text-[40px] md:text-[52px] font-bold text-[#111113] tracking-[-0.03em] leading-none">
                <AnimatedNumber
                  target={stat.value}
                  suffix={stat.suffix}
                  inView={inView}
                />
              </div>
              <div className="mt-2 text-[13px] sm:text-[14px] md:text-[15px] text-[#888] font-medium">
                {t(stat.labelKey)}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
