# Accessibility — how narwhalthaihb.com stays WCAG 2.1 AA (and why)

**Why this matters (owner, 6 Nov 2026):** restaurant websites in California are a
favourite target of ADA Title III / Unruh Act lawsuits (US$4,000 per violation +
fees; *Thurston v. Midvale*, 2019, ordered a restaurant site to meet WCAG AA). The
owner's brief: "เอาให้มีครบแบบฟ้องไม่ได้ ทุก ๆ คดี … แต่อย่าให้รบกวนคนใช้ปกติ" — every
protection in place, none of it in an ordinary guest's way. This page is the map.

## What is in place

| Area | Where | Notes |
|---|---|---|
| Keyboard focus ring | `app/globals.css` → "ACCESSIBILITY" block | Two-tone ring on every focusable element via `:where(...)` (zero specificity, so a component's own `focus-visible:ring-*` wins). Light surfaces (`.nara-panel`, `.promo-card`, `.on-light`) flip to a navy ring. |
| Skip link | `components/Nav.tsx` → `.skip-link` | "Skip to content" → `#main`. |
| Guest switches | `lib/a11y.ts`, `lib/a11yBoot.ts`, `components/A11yPanel.tsx`, `/accessibility` | Reduce motion · Higher contrast · Larger text (zoom 1.2 on `main`+`footer`, never on fixed bars) · Underline links · Reading spacing. Stored in `localStorage` (`nt-a11y`), applied as `html.a11y-*` classes **before first paint** by the inline boot script in `app/layout.tsx`. `prefers-reduced-motion` / `prefers-contrast` / `forced-colors` switch the same classes on. Entry points: icon button next to the language switcher (desktop), a row in the phone drawer, the footer link, the statement page. |
| Reduce motion | CSS under `html.a11y-motion`; `useReducedMotion()` | Kills animations/transitions, shows `.fade-up` and the word-reveal in full, freezes marquees + ticker (ticker becomes scrollable), hides decorative canvases (`data-decor` / `.fx-decor`), disables Lenis (SmoothScroll returns null), stops the Narwhal TV slideshow, keeps background videos on their poster, mutes confetti. |
| Pause controls (WCAG 2.2.2) | `.cs-ticker-toggle`, `.fx-pause` | Hours ticker, every `Marquee`, `LazyVideo`, the Hero video (when one is configured), the Narwhal TV spotlight. Each is a real `<button aria-pressed>` with a localised label (`chrome(locale).a11y.*`). |
| Dialogs | `A11yPanel`, `Nav` drawer, `ChatWidget`, `PromoCard`, `RewardsSheet`, `LanguageSwitch` | Focus moves in on open, Tab is trapped (drawer, panel, promo), Escape closes, focus returns to the opener. Closed panels are `inert` + `aria-hidden`. The language menu follows the menu-button pattern (arrows, Home/End, Escape). |
| Live regions | `ChatWidget` | Messages list is `role="log" aria-live="polite"`; the typing indicator is `role="status"`; form status lines are `role="status"`. |
| Language of parts | `lang="th"` on every Thai dish name, `lang` per ticker phrase, `hrefLang`/`lang` on language-menu entries | Screen readers switch voice correctly. |
| New-tab links | Nav, drawer, footer social, mobile bar | Visually-hidden "(opens in a new tab)" / aria-label suffix, localised. |
| Contrast | audit via the sweep | No text below 4.5:1 on its real background; the word-reveal's dim state is 55 % (5.7:1). High-contrast switch forces translucent text solid. |
| Reflow / zoom | audit via the sweep | No horizontal scroll at 320 px or at 200 % zoom; text-spacing stress (1.4.12) clips nothing. |
| Statement | `/accessibility` (+ 7 locale twins), `lib/i18n/accessibility.ts` | Standard, what's built in, third-party caveats (Toast, Google Maps, YouTube/IG/TikTok), phone + email for help, "last reviewed" date. |

## The sweep — run it before every deploy

```powershell
# dev server on :3077 (or --base https://narwhalthaihb.com)
node scripts/a11y-sweep.mjs --out a11y-report            # all 31 routes, ~45 min
node scripts/a11y-sweep.mjs --quick --out a11y-report    # 6 key routes, ~8 min
node scripts/a11y-sweep.mjs --only /menu,/contact --out a11y-report
```

It drives the shop PC's own Chrome (puppeteer-core) and, per route, runs axe-core
(WCAG 2.0/2.1/2.2 A+AA + best-practice) at desktop and 390 px, tabs through the
page (visible focus ring, no focus on hidden/inert/invisible elements, no traps,
24 px targets), checks 320 px reflow and the 200 %-zoom-equivalent width, and the
WCAG 1.4.12 text-spacing stress. Output: `report.md` (human) + `report.json`.
Exit code 1 while any serious/critical axe violation remains. Known noise: the
dev-only `<nextjs-portal>`, native date inputs (3 tab stops), cross-origin iframes.

## Rules for new work

1. **Anything that moves for more than 5 s needs a pause button** (`.fx-pause`
   pattern) *and* must respect `html.a11y-motion` (CSS or `useReducedMotion()`).
   Decorative canvases get `data-decor=""`.
2. **No text under 4.5:1.** `text-cream/45`-style tints are only for ≥ 24 px type;
   small text uses `/70` or more. Run the sweep; it measures the real background.
3. **Every control has a name** (`aria-label` that *contains* any visible text),
   every image an `alt` (empty for decoration), every form field a `<label>`.
4. **Dialogs**: focus in, trap, Escape, focus back, `inert` when closed.
5. **Headings** step down by one; one `h1` per page (`SectionHead as="h1"`).
6. **Thai / other-language words** inside an English page get `lang="…"`.
7. **Links that open a new tab** say so (`chrome(locale).a11y.newTab`).
8. Touch targets ≥ 24 × 24 CSS px (WCAG 2.2 2.5.8) — pad small icons.
9. Keep the statement honest: if a new third-party embed arrives, add it to
   `lib/i18n/accessibility.ts` (8 locales) and bump the "last reviewed" date.
