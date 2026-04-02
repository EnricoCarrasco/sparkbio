"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView, type Variants } from "framer-motion";

// ─── Animation ───────────────────────────────────────────────────────────────

const EASE = [0.25, 0.1, 0.25, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

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
              className="group relative bg-[#f9f5f2] rounded-[2.5rem] overflow-hidden aspect-[4/3] transition-all duration-500 hover:scale-[1.02] md:ml-12 border-[8px] border-white"
              style={{ boxShadow: "0 20px 40px rgba(26,28,27,0.08)" }}
            >
              <div className="h-full w-full p-8 flex flex-col items-center pt-8">
                <div className="w-16 h-16 rounded-full bg-[#ab3500] mb-4 overflow-hidden border-2 border-[#ffdbd0]">
                  <img
                    alt="Atelier theme — warm artistic link-in-bio template for artists"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6WOUTdvHaZnjEPOeNTDv28Z4liXzu9uiPy_sR8ldR4PmUgV45TW7tEpUo7pNuA9RP2mNR_bL5jnNdgO_7SThDjrJ_Xe3wSEhjZ2ZKiXbtUGiFLgRn1ZGVZqy3cXrhsiRkaRZrU0BJL_CNIsGWVPUVbCOYjMXCzPP_Cc83XUx2qKSXHQDtzz-HR3T3Fm5TMXZKZnA0gAACrizZ5BVWEJIjDyi7h1Rd6NmHxhcOuRCex3ABxLi3UnAAMAUBQuN9JYHhEL5Ek5mqFRq2"
                  />
                </div>
                <h3
                  className="text-[#ab3500] text-xl italic mb-6 leading-none"
                  style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}
                >
                  Clarice Lis
                </h3>
                <div className="w-full grid grid-cols-2 gap-3">
                  <div className="h-24 rounded-2xl bg-[#ab3500] flex flex-col items-center justify-center text-white gap-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Obras</span>
                  </div>
                  <div className="h-24 rounded-2xl border-2 border-[#ab3500] flex flex-col items-center justify-center text-[#ab3500] gap-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Bio</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-6">
                <span className="text-[10px] text-[#ab3500]/50 font-bold tracking-[0.2em] uppercase">Atelier</span>
              </div>
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
              className="group relative bg-[#f0f4f0] rounded-[2rem] overflow-hidden aspect-[3/4] transition-all duration-500 hover:scale-[1.02] sm:mt-12 border-[6px] border-white"
              style={{ boxShadow: "0 20px 40px rgba(26,28,27,0.08)" }}
            >
              <div className="h-full w-full p-6 flex flex-col items-center pt-8">
                <div className="w-14 h-14 rounded-full bg-[#2d4a2d] mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                </div>
                <h3 className="text-[#2d4a2d] text-xl italic mb-2" style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}>Naturaliste</h3>
                <p className="text-[#2d4a2d]/60 text-[10px] mb-8 text-center italic">Curadoria de produtos orgânicos e sustentáveis</p>
                <div className="w-full space-y-3">
                  <div className="w-full h-12 rounded-xl bg-[#2d4a2d]/10 flex items-center px-4 gap-3 text-[#2d4a2d]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                    <span className="font-bold text-xs">Loja Online</span>
                  </div>
                  <div className="w-full h-12 rounded-xl bg-[#2d4a2d]/10 flex items-center px-4 gap-3 text-[#2d4a2d]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
                    <span className="font-bold text-xs">Dicas de Plantio</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <span className="text-[9px] text-[#2d4a2d]/30 font-bold tracking-[0.2em] uppercase">Organic</span>
              </div>
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
