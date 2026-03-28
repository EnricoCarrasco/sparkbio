# Sparkbio Homepage Redesign — Design Spec

## Context

The current Sparkbio landing page has 4 basic sections (Hero, Features, Pricing, CTA) with a clean but underwhelming design. It lacks product showcasing, social proof, scroll-linked interactions, and the visual energy expected from a creator-focused platform. This redesign transforms it into a bold, colorful, Linktree-caliber homepage that builds trust and converts visitors.

## Design Direction

**Bold & Colorful** — Vibrant gradients, floating phone mockups, social proof, high-energy animations. The page feels alive, creative, and unmistakably for creators.

## Page Flow (8 Sections)

### 1. Navbar (Updated)
- Transparent over the gradient hero, becomes frosted-glass on scroll
- Same structure: Logo left, Login + "Sign up free" right
- White text on gradient, transitions to dark text when scrolled past hero
- Existing component at `src/components/landing/navbar.tsx` — update, don't replace

### 2. Hero — Immersive Gradient
- **Full-bleed gradient background**: `linear-gradient(160deg, #FF6B35 0%, #ff8c5a 25%, #FFD700 50%, #00D4AA 75%, #6366F1 100%)`
- Subtle noise texture overlay (CSS, not image)
- **Eyebrow badge**: Glassmorphism pill — "Free forever · No credit card"
- **Headline**: "Everything you are. In one simple _link._" (Instrument Serif, italic on "link")
- **Subtitle**: "Join thousands of creators sharing their world"
- **Username claim form**: Glassmorphism bar — `sparkbio.com/` prefix, input, white "Claim →" button
- **3 floating phone mockups**: Tilted left (-8deg), center (elevated), tilted right (+8deg). Each shows a different theme (Sparkbio Default, Ocean, Neon). CSS box-shadows, entrance animation with stagger.
- **Trust line**: "✓ Free forever · ✓ No credit card · ✓ 60 sec setup"
- Staggered Framer Motion entrance: eyebrow → headline → subtitle → claim bar → phones → trust
- File: `src/components/landing/hero.tsx` (rewrite)

### 3. Scroll-Linked Video
- **Video file**: `kling_20260326_作品_Smooth_cin_4775_0.mp4` (2208x936, 24fps, 3s, 73 frames)
- Move video to `public/videos/hero-transition.mp4` (strip audio, optimize)
- Full-width, no controls, `playsinline muted preload="auto"`
- Scroll position mapped to `video.currentTime` via `IntersectionObserver` + scroll listener
- Plays forward on scroll down, reverses on scroll up
- Smooth interpolation with `requestAnimationFrame`
- The video transitions from the gradient world into a product reveal
- New component: `src/components/landing/scroll-video.tsx`

### 4. Logo/Platform Marquee
- "Join creators on" label above
- Infinite scrolling marquee of platform names/icons: Instagram, TikTok, YouTube, Twitter/X, LinkedIn, Spotify, Pinterest, etc.
- Light background, subtle border top/bottom
- CSS animation (not Framer Motion) for performance — matches current marquee pattern
- File: Integrate into `src/components/landing/hero.tsx` or new `src/components/landing/marquee.tsx`

### 5. Theme Gallery — Dual Auto-Scrolling Marquee
- **Heading**: Eyebrow "Customization" + "Make it _unmistakably_ yours." (Instrument Serif)
- **Row 1**: 8-12 phone mockups scrolling left → right, infinite loop
- **Row 2**: 8-12 phone mockups scrolling right → left, infinite loop
- Each phone shows a different preset theme from `DEFAULT_THEMES` in `src/lib/constants.ts`
- Phone mockups: Rounded corners, subtle shadows, each with avatar placeholder, name, and 3-4 colored link buttons matching theme colors
- Slightly different scroll speeds for visual richness
- Background: `#F8F7F5`
- CSS `@keyframes` animation for both rows (28-35s duration per row)
- Scroll-triggered: starts animating when section enters viewport
- New component: `src/components/landing/theme-gallery.tsx`

### 6. How It Works — Numbered Cards + Arrows
- **Heading**: Eyebrow "How it works" + "Live in _three_ steps." (Instrument Serif)
- 3 cards side by side, connected by → arrows between them
- Each card: Orange numbered circle (1, 2, 3), title, short description
  - **Step 1**: "Claim your link" — "Pick your username and sign up in seconds"
  - **Step 2**: "Add your content" — "Links, social icons, choose your theme"
  - **Step 3**: "Share everywhere" — "Put your link in every bio and profile"
- Background: white
- Cards: `#FAFAFA` background, rounded corners, subtle border
- Staggered scroll-triggered animation (Framer Motion `useInView`)
- Mobile: stacks vertically, arrows become ↓
- New component: `src/components/landing/how-it-works.tsx`

### 7. Features — Bento Grid Cards
- **Heading**: Eyebrow "Features" + "Everything you _need._" (Instrument Serif)
- **Large card (Customization)**: Soft peach gradient (`#FFF5F0` → `#FFF0E6`), full-width. Title "Make it _yours._", description, feature pills ("12 Themes", "Custom Colors", "10 Fonts", "Gradients"), embedded mini phone mockups on the right.
- **Two smaller cards side-by-side below**:
  - **Sharing**: Soft purple gradient (`#F0F0FF` → `#E8E8FF`). Title "One link. _Every_ platform." Platform icon squares (Instagram, TikTok, YouTube, X).
  - **Analytics**: Soft mint gradient (`#F0FFF8` → `#E0FFF0`). Title "Know your _audience._" Embedded mini bar chart.
- Background: `#F8F7F5`
- Scroll-triggered stagger animation
- New component: `src/components/landing/features-bento.tsx`

### 8. Pricing — Toggle Cards
- **Heading**: Eyebrow "Pricing" + "Simple, transparent _pricing._" (Instrument Serif)
- **Monthly/Yearly toggle**: Pill toggle, "Yearly" shows "-22%" in orange
- **Free card**: White, subtle border. $0, feature list (Unlimited Links, Custom Themes, Basic Analytics, Social Icons). Gray "Get started" button.
- **Pro card**: Orange border (2px), `#FFFAF5` background. "Most Popular" badge centered on top. $9/mo (monthly) or $7/mo (yearly). Feature list (Everything in Free + Hide Branding). Orange "Start 7-day free trial" button.
- Background: white
- Toggle state managed with `useState`
- Existing pricing constants from `src/lib/constants.ts`
- File: `src/components/landing/pricing-preview.tsx` (rewrite)

### 9. Final CTA — Gradient
- **Background**: `linear-gradient(135deg, #FF6B35, #ff8c5a, #FFD700)` — mirrors hero gradient, creates visual bookend
- **Headline**: "Your audience is _waiting._" (white, Instrument Serif)
- **Subtitle**: "Create your Sparkbio page in 60 seconds."
- **Button**: White background, orange text, "Get started free →"
- **Trust line**: "Free forever · No credit card needed" (white, 70% opacity)
- Scroll-triggered fade-up animation
- File: `src/components/landing/cta.tsx` (rewrite)

### 10. Footer (Keep existing)
- Existing footer at `src/components/landing/footer.tsx` — keep as-is, minor style tweaks only

## Animation Strategy

All animations use **Framer Motion** (already installed):
- **Hero**: Staggered entrance (`staggerChildren: 0.12`), items fade up from `y: 28`
- **Scroll Video**: Raw JS — `IntersectionObserver` + `scroll` + `requestAnimationFrame` for frame-accurate scrubbing
- **Marquee/Theme Gallery**: CSS `@keyframes` for performance (no JS animation on infinite loops)
- **All other sections**: `useInView` with `margin: "-80px"` trigger, staggered fade-up
- **Navbar**: Scroll-based transparency transition (existing pattern, update for gradient compatibility)
- Standard ease: `[0.25, 0.1, 0.25, 1]` (matches current codebase)

## Files to Create/Modify

### New Components
- `src/components/landing/scroll-video.tsx`
- `src/components/landing/theme-gallery.tsx`
- `src/components/landing/how-it-works.tsx`
- `src/components/landing/features-bento.tsx`

### Rewrite Components
- `src/components/landing/hero.tsx`
- `src/components/landing/pricing-preview.tsx`
- `src/components/landing/cta.tsx`

### Update Components
- `src/components/landing/navbar.tsx` — transparent mode over gradient
- `src/app/(marketing)/page.tsx` — new section composition

### Keep As-Is
- `src/components/landing/footer.tsx`
- `src/app/(marketing)/layout.tsx`

### Assets
- Move and optimize video: `public/videos/hero-transition.mp4`
- Placeholder images for phone mockups (user will provide real assets later)

### i18n
- Update `src/messages/en.json` — add keys for new sections (scroll-video, theme-gallery, how-it-works, features-bento)
- Update `src/messages/pt-BR.json` — corresponding translations

## Responsive Behavior

- **Desktop (lg+)**: Full layouts as described
- **Tablet (md)**: Theme gallery reduces to smaller phones, features bento stacks vertically, pricing cards side-by-side
- **Mobile (sm)**: Hero phones scale down, How It Works stacks vertically (arrows → ↓), Bento grid stacks all 3 cards, pricing cards stack

## Verification

1. `npm run dev` — visual inspection of all 8 sections on desktop and mobile viewports
2. Scroll video plays/reverses smoothly on scroll
3. All animations trigger correctly on scroll
4. Navbar transparency works over gradient and transitions on scroll
5. Theme gallery marquee runs smoothly in both directions
6. Monthly/Yearly pricing toggle works
7. Username claim form routes to `/register`
8. `npm run build` passes with no errors
9. `npm run lint` passes
