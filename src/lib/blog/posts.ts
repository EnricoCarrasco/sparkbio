import type { BlogPost } from "./types";

// Import individual post files
import { viopageVsLinktree } from "./posts/viopage-vs-linktree";
import { alternativasLinktree } from "./posts/alternativas-linktree";
import { customDomainLinkInBio } from "./posts/custom-domain-link-in-bio";
import { creatorProfilePageTips } from "./posts/creator-profile-page-tips";
import { linkInBioQrCode } from "./posts/link-in-bio-qr-code";
import { microLandingPageCreators } from "./posts/micro-landing-page-creators";
import { monetizeLinkInBio } from "./posts/monetize-link-in-bio";
import { whatIsLinkInBio } from "./posts/what-is-link-in-bio";
import { bestLinkInBioTools } from "./posts/best-link-in-bio-tools";
import { howToBuildBioLinkPage } from "./posts/how-to-build-bio-link-page";
import { optimizeInstagramTiktokBioLink } from "./posts/optimize-instagram-tiktok-bio-link";
import { linkInBioAnalyticsGuide } from "./posts/link-in-bio-analytics-guide";
import { agregadorDeLinksGuia } from "./posts/agregador-de-links-guia";
import { gerenciarLinksInstagram } from "./posts/gerenciar-links-instagram";
import { bioSiteCriador } from "./posts/bio-site-criador";
import { paginaDestinoCursos } from "./posts/pagina-destino-cursos";
import { comoVenderPeloInstagram } from "./posts/como-vender-pelo-instagram";
import { oQueELinkNaBio } from "./posts/o-que-e-link-na-bio";
import { comoCriarPaginaDeLinks } from "./posts/como-criar-pagina-de-links";
import { monetizarConteudoLinkNaBio } from "./posts/monetizar-conteudo-link-na-bio";
import { ferramentasParaCriadores2026 } from "./posts/ferramentas-para-criadores-2026";
import { linksParaVenderInstagram } from "./posts/links-para-vender-instagram";

export const allPosts: BlogPost[] = [
  // EN posts (pillar first, then by keyword priority)
  whatIsLinkInBio,
  viopageVsLinktree,
  bestLinkInBioTools,
  howToBuildBioLinkPage,
  optimizeInstagramTiktokBioLink,
  linkInBioAnalyticsGuide,
  customDomainLinkInBio,
  creatorProfilePageTips,
  linkInBioQrCode,
  microLandingPageCreators,
  monetizeLinkInBio,
  // PT-BR posts (pillar first, then by keyword priority)
  oQueELinkNaBio,
  alternativasLinktree,
  comoCriarPaginaDeLinks,
  monetizarConteudoLinkNaBio,
  ferramentasParaCriadores2026,
  linksParaVenderInstagram,
  agregadorDeLinksGuia,
  gerenciarLinksInstagram,
  bioSiteCriador,
  paginaDestinoCursos,
  comoVenderPeloInstagram,
];

export function getPostBySlug(slug: string, locale?: "en" | "pt-BR"): BlogPost | undefined {
  return allPosts.find(
    (p) => p.slug === slug && (!locale || p.locale === locale)
  );
}

export function getPostsByLocale(locale: "en" | "pt-BR"): BlogPost[] {
  return allPosts.filter((p) => p.locale === locale);
}

export function getRelatedPosts(post: BlogPost): BlogPost[] {
  return post.relatedSlugs
    .map((slug) => allPosts.find((p) => p.slug === slug))
    .filter(Boolean) as BlogPost[];
}
