# CLAUDE.md — Single-File HTML Website Rules

## Always Do First
* **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.
* **Output exactly ONE self-contained `.html` file.** All HTML, CSS, and JavaScript must live in that single file. No external stylesheets, no build step, no framework bundles.

# Frontend Design Standards & Best Practices

You are an expert Frontend Designer/Developer. When creating UI, follow these rules:

## 1. Core Philosophy
* **Sleek & Minimalist:** Aim for a premium, clean, modern feel.
* **Light Theme by Default:** The design must load in a light color scheme — soft off-white or near-white backgrounds, dark neutral text, and restrained use of color.
* **Dark Mode Toggle:** Always ship a dark-mode toggle in the header/nav. The light palette is the default state; dark mode is opt-in (and should respect `prefers-color-scheme` on first load).
* **No AI Defaulting:** Avoid standard purple gradients, heavy drop shadows, and generic rounded-card layouts. Prefer crisp borders, hairline dividers, and subtle elevation over bloom effects.
* **Precision Spacing:** Use a disciplined spacing scale (e.g., 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px). No cramped layouts, no wasted white space.
* **Visual Heavy:** Add diagrams, color-coded visuals, flow charts, and interactive elements.

## 2. Styling & Layout
* **CSS:** Use a single `<style>` block in the `<head>`. Leverage modern CSS — custom properties (CSS variables) for the color palette and spacing scale, `clamp()` for fluid typography, logical properties where appropriate.
* **No CSS frameworks or CDNs** (no Tailwind, Bootstrap, etc.). Write clean, semantic CSS by hand. The only permitted external stylesheet is the Google Fonts `<link>` for Noto Sans / Noto Sans Mono (see §3).
* **Components:** Structure markup with reusable, semantic HTML patterns (e.g., a consistent `.card`, `.button`, `.nav-item` class system). Keep class naming predictable.
* **Layout:** Use CSS Grid and Flexbox for responsive, intentional layouts rather than absolute positioning or margin hacks.
* **Responsiveness:** Mobile-first. Use fluid units and a small number of well-chosen breakpoints.

## 3. Visuals & Icons
* **Fonts:** Use Noto Sans (regular for body, bold for headings) and Noto Sans Mono for code. Load via Google Fonts in `<head>`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Sans+Mono&display=swap" rel="stylesheet">
  ```
  The Typography stacks below still list system fonts as fallbacks for offline rendering and FOUT mitigation.
* **Icons:** Use [Lucide](https://lucide.dev/) icons, loaded inline as SVG (copy the SVG markup directly into the HTML — do not rely on a CDN script unless necessary, and if a CDN is used, use the official Lucide CDN via a single `<script>` tag). Replace all emojis with appropriate Lucide icons.
* **Colors (light palette):**
  * Background: near-white (e.g., `#FAFAFA` or `#F7F7F5`)
  * Surface: pure white (`#FFFFFF`) for cards and elevated elements
  * Text primary: near-black (e.g., `#0A0A0A` or `#111111`)
  * Text secondary: mid-gray (e.g., `#6B7280`)
  * Borders/dividers: light gray (e.g., `#E5E7EB`)
  * **Exactly ONE accent color** (e.g., a restrained blue, emerald, or warm orange) used sparingly for CTAs and highlights
* **Typography:** Sans stack — `"Noto Sans", -apple-system, BlinkMacSystemFont, "Inter", "Geist", "Segoe UI", Roboto, sans-serif`. Mono stack — `"Noto Sans Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`. Default body font size **18px**, monospace (code) **14px**. Use tight letter-spacing on headings, generous line-height (1.5–1.7) on body copy.

## 4. Interaction & Motion
* **Subtle:** Transitions should be short (150–250ms) and purposeful — smooth hover states, gentle focus rings, fade-ins for revealed content.
* **Feedback:** Provide instant visual feedback for user actions (hover, active, focus states on every interactive element).
* **Accessibility:** Visible focus outlines, sufficient contrast against the light background, and `prefers-reduced-motion` respected for any animation.

## 5. Coding Standards
* **Valid HTML5:** Include `<!DOCTYPE html>`, `<meta charset>`, `<meta viewport>`, and a meaningful `<title>`.
* **Vanilla JavaScript:** If scripting is needed, use modern vanilla JS inside a single `<script>` tag at the end of `<body>`. No jQuery, no frameworks.
* **Semantic Markup:** Use `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` appropriately.
* **Self-contained:** The file must open and render correctly by double-clicking it — no server, no build, no external dependencies beyond (optionally) the Lucide CDN, the Google Fonts `<link>` for Noto Sans / Noto Sans Mono, and system fonts.


## 6. Personal Branding
* Include the following personal branding links with icons in the hero mast:
  * **GitHub:** [jamesbuckett](https://github.com/jamesbuckett)
  * **Twitter/X:** [@jamesbuckett](https://twitter.com/jamesbuckett)
  * **LinkedIn:** [jamesbuckett](https://www.linkedin.com/in/jamesbuckett)
* Render them as a horizontal row of badges or as a clean bulleted list, depending on the output format.

## 7. Visual Validation with Screenshots
* **Always verify visually.** Do not reason about CSS in isolation — render the page and look at it. Use the included `screenshot.mjs` harness (Playwright + headless Chrome) to capture the live output.
* **Capture command:** `node screenshot.mjs ./index.html` writes three PNGs to `./screenshots/`:
  * `mobile.png` — 375 × 812
  * `tablet.png` — 768 × 1024
  * `desktop.png` — 1440 × 900
* **Iteration loop (one cycle):**
  1. Run the capture command.
  2. View all three screenshots and write a written critique covering: typography hierarchy, color cohesion, spacing rhythm, responsive breakpoints, drift toward generic AI aesthetics, and rendering bugs (overflow, broken layout, contrast failures, font fallback).
  3. Propose a change list ranked by visual impact; apply the top items by editing `index.html` only.
  4. Re-capture and compare against the previous set. State explicitly what improved and what regressed.
* **Stopping rule:** Iterate up to 3 cycles, or until the design meets the standards in sections 1–6 — whichever comes first.
* **Non-negotiables:**
  * Mobile is a first-class deliverable — never skip the mobile viewport.
  * Do not skip the screenshot step "for efficiency"; visual validation is the entire point.
  * If `screenshot.mjs` errors, fix the harness before continuing — do not bypass it.
  * Edit only `index.html` during the loop; do not touch the harness or unrelated files unless explicitly asked.

**Before finalizing any code, verify that:**
1. The output is a single `.html` file.
2. The theme is light (no dark backgrounds).
3. All constraints above are met.
4. At least one screenshot cycle has been run and the latest `mobile.png`, `tablet.png`, and `desktop.png` reflect the standards in sections 1–6.