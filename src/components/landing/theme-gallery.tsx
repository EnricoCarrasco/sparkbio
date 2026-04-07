"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { stagger as _stagger, fadeUp as _fadeUp } from "@/lib/motion-variants";

// ─── Animation ───────────────────────────────────────────────────────────────

const fadeUp = _fadeUp();
const stagger = _stagger();

// ─── Main export ─────────────────────────────────────────────────────────────

export function ThemeGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });
  const t = useTranslations("landing.themes");

  const line1 = t("headingLine1");
  const line1Highlight = t("headingLine1Highlight");
  const line1Before = line1.replace(line1Highlight, "").trim();

  return (
    <section
      id="themes"
      ref={sectionRef}
      className="bg-[#FAF9F7] py-20 md:py-28 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* ── Editorial header ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col md:flex-row md:items-end gap-8 md:gap-12 mb-16 md:mb-24"
        >
          <div className="max-w-3xl">
            <motion.span
              variants={fadeUp}
              className="text-[#FF6B35] font-semibold tracking-widest uppercase text-xs mb-4 block"
            >
              {t("eyebrow")}
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="text-[42px] sm:text-[56px] md:text-[72px] lg:text-[80px] leading-[0.9] tracking-[-0.03em] text-[#1a1c1b]"
              style={{
                fontFamily:
                  "var(--font-display), 'Instrument Serif', Georgia, serif",
              }}
            >
              {line1Before}{" "}
              <em className="italic font-normal">{line1Highlight}</em>
              <br />
              {t("headingLine2")}
            </motion.h2>
          </div>
          <motion.div variants={fadeUp} className="max-w-xs pb-4">
            <p className="text-[#5b5f60] text-lg leading-relaxed border-l border-[#e1bfb5] pl-6">
              {t("subtitle")}
            </p>
          </motion.div>
        </motion.div>

        {/* ── Asymmetric theme grid ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start"
        >
          {/* Left column: 2 featured cards stacked */}
          <div className="md:col-span-5 space-y-8 md:space-y-12">
            {/* Executive (dark) */}
            <motion.div
              variants={fadeUp}
              className="group relative bg-[#0f172a] rounded-[2.5rem] overflow-hidden aspect-[4/5] transition-all duration-500 hover:scale-[1.02] border-[8px] border-stone-900"
              style={{ boxShadow: "0 20px 40px rgba(26,28,27,0.08)" }}
            >
              <div className="h-full w-full p-8 flex flex-col items-center pt-12">
                <div className="w-20 h-20 rounded-full bg-stone-800 mb-6 border-2 border-stone-700 overflow-hidden">
                  <img
                    alt="Executive theme — dark premium link-in-bio design for professional creators"
                    className="w-full h-full object-cover grayscale"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcv1xkKkw7FGTchaaeFTlIa-elp5sA-UjXSbCJkrMXTL-r5licYJCS2RDz2zz_b39zLTDqEsE5XVdFlPguHYQBJSSLJ6q7BK9VgD7g79yv0IsRi2rYwIoIfzjLd9Hw6_QjtYF6Alml8ZMs30o8NdikZVejr7Uy-2tPg-AE0NFIOk3O5wt57N05ZQ-mvJiag9LtuMYdOmv0cXxzCsZlNAHPKWwnmF5iDFICbCPLw-f-Weknuh2k1hKgbu_9JXTp1LltlGRfnzaLeGti"
                  />
                </div>
                <h3 className="text-white text-2xl mb-1" style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}>
                  Lucas Andrade
                </h3>
                <p className="text-stone-400 text-xs font-medium tracking-wide mb-10">
                  Arquiteto &amp; Designer
                </p>
                <div className="w-full space-y-4">
                  <div className="w-full h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-medium text-sm">
                    Portfólio 2024
                  </div>
                  <div className="w-full h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-medium text-sm">
                    Últimos Projetos
                  </div>
                  <div className="w-full h-14 rounded-xl bg-white text-stone-900 flex items-center justify-center font-bold text-sm">
                    Agendar Consultoria
                  </div>
                </div>
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <span className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] text-white/70 font-bold tracking-[0.2em] uppercase">
                  Executive
                </span>
              </div>
            </motion.div>

            {/* Atelier (warm) */}
            <motion.div
              variants={fadeUp}
              className="group relative rounded-[2.5rem] overflow-hidden aspect-[3/4] transition-all duration-500 hover:scale-[1.02] md:ml-12 border-[8px] border-white"
              style={{ boxShadow: "0 20px 40px rgba(26,28,27,0.08)" }}
            >
              <Image
                src="/images/landing/theme-atelier.jpeg"
                alt="Atelier theme — warm artistic link-in-bio template for artists"
                width={800}
                height={1067}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Right column: 4 cards in 2x2 grid */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 md:pt-24">
            {/* Modernist */}
            <motion.div
              variants={fadeUp}
              className="group relative bg-white rounded-[2rem] overflow-hidden aspect-[3/4] transition-all duration-500 hover:scale-[1.02] border-[6px] border-stone-50"
              style={{ boxShadow: "0 20px 40px rgba(26,28,27,0.08)" }}
            >
              <div className="h-full w-full p-6 flex flex-col items-center pt-10">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 rotate-3 mb-6 overflow-hidden border border-stone-200">
                  <img alt="Modernist theme — clean minimal link-in-bio design for agencies" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvZpCD5MQHgQNuG9ZodkMNoZPBH36VrTXtOJArQzXtgQExIL08OSXpGjkSNQtLi3HFiykud_ZsAnp-Jb-vHlXGXBd7cAUSW-ujke43i16S95ia4SSRe16Hsext5EIsPnqCbmZNILQ4VNeso_iDPiPtRKcE7rjBUl6fIXHwdXjs8CF5heBx3vxjYMyE2O-_t08iq_SGDFkGrfTUERveWH5y_L30U3ttZCbAX6GFuXHWzr9F0GQNGti97c74RPdzsQUIPVkCn4lnmV1l" />
                </div>
                <h3 className="text-stone-900 font-bold text-lg mb-1">Studio K.</h3>
                <p className="text-stone-500 text-[10px] mb-8 text-center px-4">Creating digital experiences for the next generation.</p>
                <div className="w-full space-y-3">
                  <div className="w-full h-11 rounded-full border-2 border-stone-900 flex items-center justify-center text-stone-900 font-bold text-xs uppercase tracking-widest">Services</div>
                  <div className="w-full h-11 rounded-full border-2 border-stone-900 flex items-center justify-center text-stone-900 font-bold text-xs uppercase tracking-widest">Case Studies</div>
                </div>
              </div>
              <div className="absolute top-4 right-6">
                <span className="text-[9px] text-stone-300 font-bold tracking-[0.2em] uppercase">Modernist</span>
              </div>
            </motion.div>

            {/* Organic */}
            <motion.div
              variants={fadeUp}
              className="group relative rounded-[2rem] overflow-hidden aspect-[3/4] transition-all duration-500 hover:scale-[1.02] sm:mt-12 border-[6px] border-white"
              style={{ boxShadow: "0 20px 40px rgba(26,28,27,0.08)" }}
            >
              <Image
                src="/images/landing/theme-organic.jpeg"
                alt="Organic theme — natural green link-in-bio template for sustainable brands"
                width={800}
                height={1067}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Electric */}
            <motion.div
              variants={fadeUp}
              className="group relative bg-black rounded-[2rem] overflow-hidden aspect-[3/4] transition-all duration-500 hover:scale-[1.02] border-[6px] border-[#1a1a1a]"
              style={{ boxShadow: "0 20px 40px rgba(26,28,27,0.08)" }}
            >
              <div className="h-full w-full p-6 flex flex-col items-center pt-10">
                <div className="w-20 h-20 rounded-full border-2 border-cyan-400 p-1 mb-6">
                  <img alt="Electric theme — bold neon link-in-bio template for musicians" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfW7zwcLvoCPfDAAv-VnbGudx4JcyUkMZ2SIiTbAmBNHrDwmHYFVnZ2i4EbICCbu4t0DL5IrozK1dxL6WzLFSC7TMrD0aaezM-M36ptwlXscafOZqScZXQfz-Pw2DyCL-kuW6QZ7sBwnSeZ1ZNbkmUR8zEikKOVelRviF_zuKlYTVbZgM2Aq_8MvRMtA4SUnspudzQpNkqxhnsEQE4ya3cZmMMK8lYSUD671jlIYm0hDTQ39SInUFmLCIw_e0SJ7_THgVEPGsKF-Wr" />
                </div>
                <h3 className="text-white font-black italic text-2xl mb-8 tracking-tighter">BEATZ BOX</h3>
                <div className="w-full space-y-3">
                  <div className="w-full h-11 rounded-lg bg-cyan-400 flex items-center justify-center text-black font-black text-xs uppercase italic">New Single</div>
                  <div className="w-full h-11 rounded-lg border border-cyan-400 flex items-center justify-center text-cyan-400 font-black text-xs uppercase italic">Tour Dates</div>
                </div>
              </div>
              <div className="absolute bottom-4 left-6">
                <span className="text-[9px] text-cyan-400 font-bold tracking-[0.2em] uppercase">Electric</span>
              </div>
            </motion.div>

            {/* Silk */}
            <motion.div
              variants={fadeUp}
              className="group relative bg-[#fdf2f8] rounded-[2rem] overflow-hidden aspect-[3/4] transition-all duration-500 hover:scale-[1.02] sm:mt-12 border-[6px] border-white"
              style={{ boxShadow: "0 20px 40px rgba(26,28,27,0.08)" }}
            >
              <div className="h-full w-full p-6 flex flex-col items-center pt-10">
                <div className="w-16 h-16 rounded-full bg-white shadow-sm mb-6 flex items-center justify-center">
                  <img alt="Silk theme — elegant pink link-in-bio template for musicians and creators" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKIAYoHB-KqbX2GZO0VYnqGbHW3Wx3UzVki9eXQTgzALyhoaidV_53T6Ge9sMKqH-J3Mlx8CEy47ltMiwFO8rZJu_AWMf59wxDYw3scabRlYUMLU4MeKeVyz6KjoEK74BSJRUtj03VtZxsWCY3YhAralRvGZTPcktOC9i7Ppwxh6Dy94IARiSTNYwWs7URaYaFSI4J1MIzGxolSReXrvwsny71jU2PMY2-Gcy041YILyRAc4d4ICC7fLesS4biTbYoGl0soMV9ca_c" />
                </div>
                <h3 className="text-pink-900 italic text-xl mb-1" style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}>Mia Song</h3>
                <p className="text-pink-400 text-[10px] font-medium tracking-widest uppercase mb-8">Musician</p>
                <div className="w-full space-y-4">
                  <div className="w-full border-b border-pink-100 pb-2 flex justify-between items-center">
                    <span className="text-pink-900 text-sm italic" style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}>Listen Now</span>
                    <svg className="w-4 h-4 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </div>
                  <div className="w-full border-b border-pink-100 pb-2 flex justify-between items-center">
                    <span className="text-pink-900 text-sm italic" style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}>Gallery</span>
                    <svg className="w-4 h-4 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-6">
                <span className="text-[9px] text-pink-200 font-bold tracking-[0.2em] uppercase">Silk</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
