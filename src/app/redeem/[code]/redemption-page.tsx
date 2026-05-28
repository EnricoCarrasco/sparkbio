"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { claimForExistingUser } from "./actions";
import styles from "./redeem.module.css";

type Locale = "en" | "pt-BR";
type Status = "active" | "redeemed" | "revoked";

interface Props {
  code: string;
  handle: string | null;
  locale: Locale;
  status: Status | null; // null = not found
  signedInEmail: string | null;
}

// All visible strings in the two supported locales. Kept inline so this page
// doesn't depend on next-intl plumbing — the influencer's locale comes from
// the lifetime_codes row, not from cookies/headers.
const STRINGS: Record<Locale, Record<string, string>> = {
  en: {
    invite_chip: "Ambassador invite",
    eyebrow: "Viopage Ambassadors · By invitation",
    greet_prefix: "Hey",
    greet_fallback: "there",
    headline_pre: "You're on the",
    headline_accent: "inside",
    headline_post: "now.",
    sub:
      "You were personally hand-picked to join our circle. From this moment on, it's lifetime Pro. No expiry. No subscription. No paywall. Yours, forever. Welcome in.",
    perk1_title: "Lifetime Pro",
    perk1_meta: "Every theme, feature, and domain. Yours forever. No subscription, ever.",
    perk2_title: "30% recurring",
    perk2_meta: "Boosted commission on every Pro signup you refer. Paid monthly.",
    perk3_title: "Ambassador status",
    perk3_meta: "Profile badge, direct line to the team, early access to everything.",
    signup_title: "Claim your seat",
    signup_meta: "~30 SECONDS",
    google_button: "Continue with Google",
    or_email: "or with email",
    email_placeholder: "you@studio.com",
    password_placeholder: "Create a password",
    claim_button: "Claim my lifetime access",
    claim_existing_button: "Claim lifetime Pro on this account",
    terms_prefix: "By claiming your seat you agree to the",
    terms_link: "Ambassador terms",
    terms_and: "&",
    privacy_link: "Privacy policy",
    proof: "Joined by 1,200+ creators across Brazil & Europe — and counting.",
    preview_meta: "Your page · live in 60 seconds",
    phone_caption_a: "This is yours. Your handle, your links, your colors.",
    phone_caption_b: "Live the second you sign up.",
    signed_in_as: "Signed in as",
    error_redeemed_title: "This invitation has already been claimed.",
    error_redeemed_body:
      "If you think this is a mistake, DM us on Instagram and we'll sort it out.",
    error_revoked_title: "This invitation link is no longer active.",
    error_revoked_body:
      "If you should still have access, message us on Instagram and we'll send you a fresh link.",
    error_notfound_title: "We can't find that invitation.",
    error_notfound_body:
      "Double-check the link from your DM, or message us on Instagram if it keeps not working.",
    welcome_in: "Welcome in",
    submitting: "Claiming…",
    error_signup_generic: "We couldn't create your account. Try again or use Google.",
    error_redeem_generic: "Sign-up worked but redemption failed. Refresh this page to retry.",
    sticker_label: "Ambassador",
    sticker_value: "Lifetime",
    footer_a: "Viopage Ambassadors / 2026",
    footer_b: "Hand-delivered",
  },
  "pt-BR": {
    invite_chip: "Convite Ambassador",
    eyebrow: "Viopage Ambassadors · Apenas por convite",
    greet_prefix: "Oi",
    greet_fallback: "você",
    headline_pre: "Você está",
    headline_accent: "por dentro",
    headline_post: "agora.",
    sub:
      "Você foi pessoalmente escolhido(a) pra entrar nesse círculo. Daqui pra frente é Pro vitalício. Sem prazo. Sem mensalidade. Sem pegadinha. Seu, pra sempre. Bem-vindo(a).",
    perk1_title: "Pro vitalício",
    perk1_meta: "Todos os temas, recursos e domínios. Seus pra sempre. Sem mensalidade, nunca.",
    perk2_title: "30% recorrente",
    perk2_meta: "Comissão maior em cada Pro indicado. Pago mensalmente.",
    perk3_title: "Status Ambassador",
    perk3_meta: "Badge no perfil, linha direta com o time, acesso antecipado a tudo.",
    signup_title: "Reivindicar sua vaga",
    signup_meta: "~30 SEGUNDOS",
    google_button: "Continuar com Google",
    or_email: "ou com email",
    email_placeholder: "voce@studio.com",
    password_placeholder: "Crie uma senha",
    claim_button: "Quero meu acesso vitalício",
    claim_existing_button: "Ativar Pro vitalício nesta conta",
    terms_prefix: "Ao reivindicar sua vaga você concorda com os",
    terms_link: "Termos Ambassador",
    terms_and: "e a",
    privacy_link: "Política de privacidade",
    proof: "Já são 1.200+ criadores no Brasil e Europa — e crescendo.",
    preview_meta: "Sua página · no ar em 60 segundos",
    phone_caption_a: "Isto é seu. Seu @, seus links, suas cores.",
    phone_caption_b: "No ar assim que você se cadastrar.",
    signed_in_as: "Conectado como",
    error_redeemed_title: "Este convite já foi resgatado.",
    error_redeemed_body:
      "Se você acha que isso é um engano, manda DM no Instagram que a gente resolve.",
    error_revoked_title: "Este link de convite não está mais ativo.",
    error_revoked_body:
      "Se você deveria ter acesso, manda mensagem no Instagram que enviamos um link novo.",
    error_notfound_title: "Não encontramos esse convite.",
    error_notfound_body:
      "Confira o link do seu DM, ou nos manda mensagem no Instagram se continuar não funcionando.",
    welcome_in: "Bem-vindo(a)",
    submitting: "Ativando…",
    error_signup_generic: "Não conseguimos criar sua conta. Tente de novo ou use Google.",
    error_redeem_generic: "Cadastro foi mas o resgate falhou. Recarregue esta página para tentar de novo.",
    sticker_label: "Ambassador",
    sticker_value: "Vitalício",
    footer_a: "Viopage Ambassadors / 2026",
    footer_b: "Entregue à mão",
  },
};

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function firstName(handle: string | null): string {
  if (!handle) return "";
  // "maria_fitness" → "Maria"
  const piece = handle.split(/[_.-]/)[0];
  return capitalize(piece);
}

// ---------------------------------------------------------------------------
// Error views (code not found / already redeemed / revoked)
// ---------------------------------------------------------------------------

function ErrorView({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className={styles.errorWrap}>
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.errorCard}>
        <div className={styles.errorMark}>✦</div>
        <h1 className={styles.errorTitle}>{title}</h1>
        <p className={styles.errorBody}>{body}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function RedemptionPage({ code, handle, locale, status, signedInEmail }: Props) {
  const router = useRouter();
  const t = STRINGS[locale];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successCopy, setSuccessCopy] = useState<string | null>(null);

  if (status === null) {
    return <ErrorView title={t.error_notfound_title} body={t.error_notfound_body} />;
  }
  if (status === "redeemed") {
    return <ErrorView title={t.error_redeemed_title} body={t.error_redeemed_body} />;
  }
  if (status === "revoked") {
    return <ErrorView title={t.error_revoked_title} body={t.error_revoked_body} />;
  }

  // Set the redemption-code cookie so the OAuth callback can consume it.
  function setRedeemCookie() {
    document.cookie = `pending_redeem_code=${encodeURIComponent(code)}; Max-Age=600; Path=/; SameSite=Lax`;
  }

  async function handleGoogleClick() {
    setRedeemCookie();
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", "/dashboard?welcome=lifetime");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    startTransition(async () => {
      const supabase = createClient();

      // 1. Sign up with email + password. Supabase auth handles the user creation.
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        // If the email already exists, try signing in with the same password — useful
        // when the influencer set up an account moments ago and came back to redeem.
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setErrorMessage(t.error_signup_generic);
          return;
        }
      }

      // 2. Call the RPC to redeem.
      const { data, error: redeemError } = await supabase.rpc("redeem_lifetime_code", {
        p_code: code,
      });

      if (redeemError) {
        setErrorMessage(t.error_redeem_generic);
        return;
      }

      const rpcResult = data as { ok: boolean; error?: string } | null;
      if (rpcResult?.ok) {
        // Quick visual feedback before navigation.
        setSuccessCopy(`${t.welcome_in}, ${firstName(handle)} →`);
        router.push("/dashboard?welcome=lifetime");
      } else {
        setErrorMessage(t.error_redeem_generic);
      }
    });
  }

  async function handleClaimExisting() {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await claimForExistingUser(code);
      if (result.ok) {
        router.push("/dashboard?welcome=lifetime");
      } else {
        setErrorMessage(t.error_redeem_generic);
      }
    });
  }

  // Greeting handle — falls back gracefully if the code has no handle stored.
  const greetHandle = handle ?? t.greet_fallback;

  return (
    <div className={styles.shell}>
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <header className={styles.topbar}>
        <Link href="/" className={styles.logo} aria-label="Viopage">
          <span className={styles.logoVio}>vio</span>
          <span className={styles.logoPage}>page</span>
        </Link>
        <div className={styles.inviteChip} title="Your personal invitation code">
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.chipLabel}>{t.invite_chip}</span>
          <span className={`${styles.code} ${styles.mono}`}>{code}</span>
        </div>
      </header>

      <main className={styles.stage}>
        {/* LEFT */}
        <section className={styles.colLeft}>
          <div className={styles.welcomeBlock}>
            <div className={styles.eyebrow}>
              <span className={styles.pip}>✦</span>
              {t.eyebrow}
            </div>

            <p className={styles.greet}>
              {t.greet_prefix} <span className={styles.handle}>@{greetHandle},</span>
            </p>

            <h1 className={styles.headline}>
              <span className={styles.ink2}>{t.headline_pre}</span>
              <br />
              <span className={styles.accent}>{t.headline_accent}</span>{" "}
              <span className={styles.ink2}>{t.headline_post}</span>
            </h1>

            <p className={styles.sub}>{t.sub}</p>
          </div>

          {/* Perks */}
          <div className={styles.perks}>
            <article className={styles.perk}>
              <div className={styles.perkHead}>
                <span className={`${styles.perkNum} ${styles.mono}`}>01</span>
                <span className={styles.perkMark} aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6l2.5 5h7L14 6l-3 2.5L8 3 5 8.5 2 6z" />
                  </svg>
                </span>
              </div>
              <h3 className={styles.perkTitle}>{t.perk1_title}</h3>
              <p className={styles.perkMeta}>{t.perk1_meta}</p>
            </article>

            <article className={styles.perk}>
              <div className={styles.perkHead}>
                <span className={`${styles.perkNum} ${styles.mono}`}>02</span>
                <span className={styles.perkMark} aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 13L13 3" />
                    <path d="M5 4h-2v2" />
                    <path d="M11 12h2v-2" />
                  </svg>
                </span>
              </div>
              <h3 className={styles.perkTitle}>{t.perk2_title}</h3>
              <p className={styles.perkMeta}>{t.perk2_meta}</p>
            </article>

            <article className={styles.perk}>
              <div className={styles.perkHead}>
                <span className={`${styles.perkNum} ${styles.mono}`}>03</span>
                <span className={styles.perkMark} aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.2l-3.6 1.9.7-4L2.2 6.3l4-.6L8 2z" />
                  </svg>
                </span>
              </div>
              <h3 className={styles.perkTitle}>{t.perk3_title}</h3>
              <p className={styles.perkMeta}>{t.perk3_meta}</p>
            </article>
          </div>

          {/* Signup card */}
          <form className={styles.signup} onSubmit={handleEmailSubmit}>
            <div className={styles.signupHead}>
              <span className={styles.signupTitle}>{t.signup_title}</span>
              <span className={`${styles.signupMeta} ${styles.mono}`}>{t.signup_meta}</span>
            </div>

            {signedInEmail ? (
              <>
                <div className={styles.signedInBox}>
                  <span className={styles.signedInLabel}>{t.signed_in_as}</span>
                  <span className={styles.signedInEmail}>{signedInEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClaimExisting}
                  disabled={isPending}
                  className={styles.btnClaim}
                >
                  {isPending ? t.submitting : t.claim_existing_button}
                  <span className={styles.arrow}>→</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className={styles.btnGoogle}
                  disabled={isPending}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#fff" d="M21.35 11.1H12v3.2h5.35c-.23 1.5-1.69 4.4-5.35 4.4-3.21 0-5.83-2.66-5.83-5.95s2.62-5.95 5.83-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.74 4.34 14.6 3.4 12 3.4 6.92 3.4 2.8 7.52 2.8 12.6S6.92 21.8 12 21.8c5.86 0 9.74-4.12 9.74-9.92 0-.66-.07-1.17-.39-1.78z" />
                  </svg>
                  {t.google_button}
                </button>

                <div className={`${styles.divider} ${styles.mono}`}>{t.or_email}</div>

                <label className={styles.field}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3.5" width="12" height="9" rx="1.6" />
                    <path d="M2.5 4.5L8 9l5.5-4.5" />
                  </svg>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={t.email_placeholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </label>

                <label className={styles.field}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="7" width="10" height="7" rx="1.6" />
                    <path d="M5.2 7V5a2.8 2.8 0 015.6 0v2" />
                  </svg>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    placeholder={t.password_placeholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </label>

                <button type="submit" className={styles.btnClaim} disabled={isPending}>
                  {isPending ? t.submitting : successCopy ?? t.claim_button}
                  {!isPending && <span className={styles.arrow}>→</span>}
                </button>
              </>
            )}

            {errorMessage && <p className={styles.errorInline}>{errorMessage}</p>}

            <p className={styles.terms}>
              {t.terms_prefix}{" "}
              <Link href="/terms">{t.terms_link}</Link> {t.terms_and}{" "}
              <Link href="/privacy">{t.privacy_link}</Link>.
            </p>
          </form>

          {/* Social proof */}
          <div className={styles.socialProof}>
            <span className={styles.avatarStack} aria-hidden="true">
              <span style={{ background: "linear-gradient(135deg,#FF6B35,#C03E13)" }} />
              <span style={{ background: "linear-gradient(135deg,#7C3AED,#3B1B7A)" }} />
              <span style={{ background: "linear-gradient(135deg,#0EA5E9,#0B5B86)" }} />
              <span style={{ background: "linear-gradient(135deg,#16A34A,#0F6B33)" }} />
            </span>
            {t.proof}
          </div>
        </section>

        {/* RIGHT — phone mockup (decorative) */}
        <aside className={styles.colRight}>
          <div className={`${styles.previewMeta} ${styles.mono}`}>
            <span className={styles.liveDot} aria-hidden="true" />
            {t.preview_meta}
          </div>

          <div className={styles.phoneWrap}>
            <div className={styles.phone}>
              <div className={styles.phoneScreen}>
                <div className={styles.notch} aria-hidden="true" />
                <div className={styles.status}>
                  <span>9:41</span>
                  <span className={styles.statusIcons}>
                    <svg viewBox="0 0 16 12" fill="currentColor">
                      <path d="M1 8h1.5v3H1zm3-2h1.5v5H4zm3-2h1.5v7H7zm3-2h1.5v9H10zm3-2h1.5v11H13z" />
                    </svg>
                    <svg viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M1.5 5a8 8 0 0113 0M3.5 7.2a5 5 0 019 0M5.5 9.4a2 2 0 015 0" />
                    </svg>
                    <svg viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <rect x="1" y="2" width="19" height="8" rx="2" />
                      <rect x="3" y="4" width="14" height="4" rx=".6" fill="currentColor" />
                      <path d="M21 5v2" />
                    </svg>
                  </span>
                </div>

                <div className={styles.profile}>
                  <div className={styles.pfAvatar} aria-hidden="true" />
                  <h2 className={styles.pfName}>{capitalize(firstName(handle) || "Maria")} Castelli</h2>
                  <p className={`${styles.pfHandle} ${styles.mono}`}>viopage.com/{handle ?? "maria_fitness"}</p>
                  <p className={styles.pfBio}>
                    Coach &amp; movement creator. New programs every Monday.
                  </p>

                  <div className={styles.pfSocials} aria-hidden="true">
                    <span>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                        <rect x="2.5" y="2.5" width="11" height="11" rx="3" />
                        <circle cx="8" cy="8" r="2.5" />
                        <circle cx="11.2" cy="4.8" r=".7" fill="currentColor" />
                      </svg>
                    </span>
                    <span>
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13 4.2a4 4 0 01-1.1.3 1.9 1.9 0 00.8-1 4 4 0 01-1.2.5 1.9 1.9 0 00-3.3 1.7A5.4 5.4 0 013 4.5a1.9 1.9 0 00.6 2.5 1.9 1.9 0 01-.8-.2v0a1.9 1.9 0 001.5 1.8 1.9 1.9 0 01-.8 0 1.9 1.9 0 001.7 1.3A3.8 3.8 0 012.5 11a5.4 5.4 0 002.9.8c3.5 0 5.4-2.9 5.4-5.4v-.2A3.8 3.8 0 0013 4.2z" />
                      </svg>
                    </span>
                    <span>
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M14 4.5s-.1-1-.6-1.4c-.5-.5-1.2-.5-1.5-.6C9.7 2.3 8 2.3 8 2.3s-1.7 0-3.9.2c-.3 0-1 .1-1.5.6-.5.4-.6 1.4-.6 1.4S2 5.7 2 6.8v1c0 1.2.1 2.3.1 2.3s.1 1 .6 1.4c.5.5 1.2.5 1.5.6 1.1.1 4 .2 4 .2s1.7 0 3.9-.2c.3 0 1-.1 1.5-.6.5-.4.6-1.4.6-1.4s.1-1.2.1-2.3v-1c0-1.1-.1-2.3-.1-2.3zM6.8 9.5V5.7L10.4 7.6 6.8 9.5z" />
                      </svg>
                    </span>
                  </div>

                  <div className={styles.pfLinks}>
                    <div className={styles.pfLink}>
                      <span className={styles.pfLinkIcon}>★</span>
                      <span>{locale === "pt-BR" ? "Novo: Programa 8 semanas" : "New: 8-Week Reset Program"}</span>
                      <span className={styles.pfLinkArrow}>↗</span>
                    </div>
                    <div className={`${styles.pfLink} ${styles.pfLinkAlt}`}>
                      <span className={styles.pfLinkIcon}>▶</span>
                      <span>{locale === "pt-BR" ? "YouTube — Mobilidade 101" : "Latest YouTube — Mobility 101"}</span>
                      <span className={styles.pfLinkArrow}>↗</span>
                    </div>
                    <div className={`${styles.pfLink} ${styles.pfLinkAlt}`}>
                      <span className={styles.pfLinkIcon}>○</span>
                      <span>{locale === "pt-BR" ? "Agende um 1:1" : "Book a 1:1 coaching call"}</span>
                      <span className={styles.pfLinkArrow}>↗</span>
                    </div>
                    <div className={`${styles.pfLink} ${styles.pfLinkAlt}`}>
                      <span className={styles.pfLinkIcon}>$</span>
                      <span>Pix · Tip jar</span>
                      <span className={styles.pfLinkArrow}>↗</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.pfSticker} aria-hidden="true">
              <span className={styles.miniMark}>✦</span>
              <div>
                <div className={`${styles.miniLabel} ${styles.mono}`}>{t.sticker_label}</div>
                <div className={styles.miniVal}>{t.sticker_value}</div>
              </div>
            </div>
          </div>

          <p className={styles.phoneCaption}>
            {t.phone_caption_a} <strong>{t.phone_caption_b}</strong>
          </p>
        </aside>
      </main>

      <footer className={`${styles.footerLine} ${styles.mono}`}>
        <div>◈ {t.footer_a}</div>
        <div className={styles.geo}>
          <span>São Paulo</span>
          <span>·</span>
          <span>Lisboa</span>
          <span>·</span>
          <span>Berlin</span>
          <span>·</span>
          <span>Amsterdam</span>
        </div>
        <div>{t.footer_b} ✦</div>
      </footer>
    </div>
  );
}
