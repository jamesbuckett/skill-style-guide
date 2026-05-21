---
name: skill-style-guide
description: Build single-file HTML pages that follow James Buckett's personal style guide — light theme with dark-mode toggle, Noto Sans / Noto Sans Mono typography, Lucide icons inlined as SVG, a disciplined 4/8/12/16/24/32/48/64 spacing scale, exactly one accent color, personal branding links, and Playwright screenshot validation across mobile/tablet/desktop. Use this skill whenever the user asks for a landing page, marketing page, prototype, mockup, single-file HTML page, or to edit an existing index.html in this project, even when they don't explicitly mention the style guide. Skip only if the user explicitly wants a multi-file build (React, Vue, Next, etc.).
---

# Single-File HTML Style Guide

This skill produces premium, minimalist single-file HTML pages and verifies them visually with screenshots.

The constraints — one file, no build step, light theme, restrained palette, mandatory screenshot validation — are deliberate. They keep the output portable (double-click to render), fast to share, and resistant to drifting into generic AI aesthetics (purple gradients, drop-shadow soup, rounded-card spam, emoji bullets).

## When to use this skill

Use whenever the user wants:
- A landing page, marketing page, docs page, or visual prototype
- A modification to an existing `index.html` in this project
- Any output described as "a single HTML file" or "self-contained webpage"

Skip when the user explicitly asks for a multi-file framework build (React, Vue, Next, Svelte, etc.) — different problem.

## Composition with other skills

This skill is the **visual chassis** — palette, typography, spacing, components, the screenshot harness. When another skill applies to the same task (most commonly `skill-build-educational-site` for long-form explainer pages), use this composition rule:

- This skill wins on **palette, typography, spacing, components, icons, and validation**. The other skill's design system is overridden when it conflicts.
- The other skill wins on **content architecture** — section sequence, audience switching, glossary discipline, comparison-table rule, regulatory-callout shape.
- When the user explicitly names this skill ("using the style guide"), the precedence above is locked. When the user names the other skill instead and this one only ambiently applies, defer to the other skill's chassis unless asked otherwise.

If the user wants long-form explainer content rendered with this skill's chassis, the reusable component CSS for callouts, comparison tables, glossary, reading lists, audience switchers, and inline-SVG diagram frames lives in `references/long-form-components.md` — copy what you need rather than re-authoring it.

## Workflow

1. **Copy the starter template.** Begin every page by copying `assets/index.html` from this skill to the working directory as `index.html`. It already encodes the palette, font loading, dark-mode toggle behavior, personal branding row, and a typographic baseline. Customise from there — don't rebuild the chassis.

2. **Edit `index.html` to satisfy the request.** Keep everything in one file. Reach for the spacing tokens (`--space-*`), color variables (`--bg`, `--surface`, `--text`, `--text-muted`, `--border`, `--accent`), and component patterns already in the template. Adding ad-hoc colors or one-off margin values is the fast path to incoherence.

3. **Verify visually.** Run the screenshot harness — see "Screenshot iteration loop" below. CSS bugs hide in plain sight when you only read the code; the screenshots catch overflow, font fallback, contrast failures, and AI-generic drift.

4. **Iterate up to 3 cycles** or until the design satisfies the rules below — whichever comes first. Diminishing returns set in fast; don't polish past the point of improvement.

## Design rules

Read these before writing CSS. They override default 2025 design instincts.

### Theme
- **Light by default.** The page renders in the light palette on first load. Dark mode is opt-in via a toggle in the header that flips a `data-theme` attribute on `<html>`. On first visit, honour `prefers-color-scheme: dark` only if no explicit user preference is stored in `localStorage`. The pattern is wired in the template — don't reinvent it.
- **No gradient hero backgrounds.** No drop-shadow halos. No purple. Crisp 1px borders and a single soft elevation shadow are enough.

### Palette (light, defined as CSS variables in the template)

**Source of truth.** Both palettes (light + dark), the spacing scale, and the curated accent alternatives live in `palette.json` at the root of `skill-build-educational-site`. The standard install symlink resolves it at `~/.claude/skills/skill-build-educational-site/palette.json` — read it for current hex values rather than caching from this SKILL.md. A palette change happens in `palette.json` once and both skills pick it up. The variables below are the **contract** (names + intent); the values in `palette.json` → `palettes.personal-style.light` and `.dark` are the **values**.

- `--bg` near-white background
- `--surface` pure white for cards and elevated panels
- `--text` near-black primary text
- `--text-muted` mid-gray secondary text
- `--border` light gray hairlines
- `--border-strong` slightly darker dividers
- `--accent` exactly **one** restrained colour — pick from the alternatives in `palette.json` → `palettes.personal-style.accent_alternatives` (blue, emerald, or warm orange). Adding a second accent dilutes hierarchy; don't.
- `--accent-hover` / `--accent-soft` derived from `--accent` via `color-mix()`; do not hand-roll separate hexes.

**Brand accent vs. semantic state colours.** The one-accent rule applies to the *brand* — CTAs, links, highlights, anything that says "this is the page's voice." It does **not** apply to *semantic state* signals (success green, warning amber, danger red) when the content genuinely conveys state — e.g., a security scan with PASS / FAIL rows, a comparison contrasting a deprecated approach with a recommended one, a status badge. State colours should be restrained (one shade each, used only for the affected element + icon), kept separate from the accent variable (introduce `--state-ok`, `--state-warn`, `--state-bad` as needed), and absent from CTAs and headings. If a page has no genuine state to convey, don't reach for them.

The dark palette is the same variables re-assigned under `[data-theme="dark"]`, with values in `palette.json` → `palettes.personal-style.dark`. Use the variables — never hard-code hex in component CSS.

### Typography
- **Noto Sans** (400 regular, 700 bold) for body and headings, **Noto Sans Mono** for code. Loaded via the Google Fonts `<link>` already in the template head.
- Body 18px, monospace 14px. Headings use tight letter-spacing (`-0.02em`). Body line-height 1.5–1.7.
- Hero headings use `clamp()` so they scale with viewport rather than relying on breakpoints alone.
- System fonts remain in the stack as fallbacks for offline rendering — keep them.

### Spacing
Use the spacing tokens defined in the template: `--space-1` (4px) through `--space-9` (96px), mapped to the 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px scale. Values live in `palette.json` → `palettes.personal-style.spacing` (same single source as the palette). Don't introduce arbitrary values like `padding: 17px` or `margin-top: 30px`. Cramped layouts and wasteful white space are equally bad — the scale is the discipline that prevents both.

### Icons
**Lucide SVG inlined directly into HTML.** Don't load the Lucide CDN script or use icon fonts — paste the SVG markup. Common icons (sun, moon, github, twitter/x, linkedin, chevron, check, arrow, external-link) are in `references/lucide-icons.md` ready to copy. Replace any emoji with the equivalent Lucide glyph; never ship emojis in production output.

### Personal branding
The hero or header must include three links (already wired in the template, with Lucide icons):
- GitHub: `https://github.com/jamesbuckett`
- Twitter/X: `https://twitter.com/jamesbuckett`
- LinkedIn: `https://www.linkedin.com/in/jamesbuckett`

Render as a horizontal row of icon badges (icon + accessible label). Keep them present on every page — even an internal mockup.

### Interaction and motion
- Transitions 150–250ms, purposeful only — hover state, focus ring, theme toggle. No flashy entrance animations.
- Visible focus rings on every interactive element. The template's `:focus-visible` style is the reference; don't strip it.
- Respect `prefers-reduced-motion: reduce` — wrap any non-essential animation in that media query.

### Code structure
- One `<style>` block in `<head>` using CSS variables, CSS Grid, and Flexbox. No CSS frameworks (no Tailwind, Bootstrap, Bulma). The only permitted external stylesheet is the Google Fonts `<link>`.
- One `<script>` at the end of `<body>` — modern vanilla JS, no jQuery, no framework bundles, no CDN scripts (Lucide CDN script is also out — inline the SVG).
- Semantic HTML5 elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`. Use them where they make sense; don't wrap every div in `<section>`.
- Valid HTML5: `<!DOCTYPE html>`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, a meaningful `<title>`, and a `<meta name="description">`.

## Screenshot iteration loop

The harness at `scripts/screenshot.mjs` uses Playwright to capture three viewports. It is the load-bearing verification step of this skill — do not skip it for efficiency. Visual validation is the entire point.

### Setup (once per project)

```bash
# Copy the harness to the project root
cp <skill-path>/scripts/screenshot.mjs ./

# Install Playwright if it's not already installed
npm init -y 2>/dev/null
npm install --save-dev playwright
npx playwright install chromium
```

### When `npx playwright install chromium` fails

Playwright does not ship Chromium binaries for every host. The known-broken combination is **Ubuntu 26.04 ARM64** (and other ARM64 Linux distros that Playwright hasn't tagged yet) — `npx playwright install chromium` exits with `Playwright does not support chromium on <platform>`. Snap install of `chromium` requires sudo. Spawning Windows-side `chrome.exe` via WSL interop fails the CDP bridge.

Try, in order:

1. **System chromium via apt (needs sudo, hand off to the user):**
   ```bash
   sudo apt install chromium-browser
   # or, on snap-only distros:
   sudo snap install chromium
   ```
   Then point Playwright at it explicitly:
   ```bash
   PLAYWRIGHT_BROWSERS_PATH=0 node screenshot.mjs ./index.html
   ```
   (and add `executablePath: '/usr/bin/chromium'` in the launch call inside `screenshot.mjs` if Playwright still can't find it).

2. **CDP connect to a manually-launched Chrome:** start any Chromium-based browser with `--remote-debugging-port=9222 --headless=new`, then have the harness call `chromium.connectOverCDP('http://localhost:9222')` instead of `chromium.launch()`.

3. **If no install is possible in this session**, hand off to the user with the exact install command and a note that the screenshot validation step is blocked until they run it. Run the static checks the harness would otherwise have caught (tag balance, no emoji, exactly one uncommented `--accent`, one HTML file) and report which validation steps were skipped.

Do **not** silently skip the screenshot step. The whole point of this skill is visual validation; a blocked screenshot is a known limitation, not a passed check.

### Capture command

```bash
node screenshot.mjs ./index.html
```

This writes three PNGs to `./screenshots/`:
- `mobile.png` — 375 × 812 (iPhone-ish)
- `tablet.png` — 768 × 1024 (iPad portrait)
- `desktop.png` — 1440 × 900 (standard laptop)

For tall pages the harness automatically slices the capture to stay under Chrome's canvas limit. You don't need to flag this manually.

### One iteration cycle

1. **Capture.** Run the command above.
2. **Look.** View all three screenshots with the Read tool. Write a short critique covering: typography hierarchy, color cohesion, spacing rhythm, responsive breakpoints, drift toward generic AI aesthetics (purple, gradients, rounded-card spam), and rendering bugs (overflow, broken layout, contrast failures, font fallback to system sans).
3. **Pick the top 2–3 changes** by visual impact. Apply them by editing `index.html` only.
4. **Re-capture and compare.** State explicitly what improved and what regressed compared to the previous set.

### Stopping rule

Up to 3 cycles, or earlier when the design meets the rules above. After 3 cycles, stop and report what's left — don't grind into low-value polish.

### Non-negotiables

- **Mobile is a first-class deliverable.** Never skip the mobile viewport. A page that looks great at 1440px and breaks at 375px is a failed deliverable.
- **Don't bypass the harness.** If `screenshot.mjs` errors, fix the harness or the page — don't skip the step.
- **Edit only `index.html`** during the loop. Don't touch the harness or unrelated files unless explicitly asked.

## Verify before reporting done

Confirm all of these before telling the user the page is complete:

1. `node ~/.claude/skills/skill-style-guide/scripts/validate.mjs ./index.html` exits clean (no errors). This subsumes "single-file" and the static rules — palette variables, spacing scale, one accent, branding links, no emoji, no Tailwind.
2. The default load is light — open the file fresh in a private window and the first paint is the light palette.
3. The dark-mode toggle in the header works — clicking it flips `data-theme="dark"` on `<html>` and persists to `localStorage`.
4. Latest `mobile.png`, `tablet.png`, and `desktop.png` exist in `./screenshots/` and reflect the design rules above.
5. *(Optional, when `@axe-core/playwright` is installed)* `node ~/.claude/skills/skill-style-guide/scripts/a11y.mjs ./index.html` exits clean — catches contrast failures, missing focus rings, and broken dark-mode parity (a hex hardcoded in component CSS where a variable should be).

## Failure modes to avoid

Patterns this skill is specifically trying to prevent — most are the AI-generic instincts the disciplined palette and spacing tokens exist to suppress.

- **Generic AI aesthetic drift** — purple gradients, drop-shadow halos, rainbow toolbars, animated-on-load hero blocks. Crisp 1px borders and the curated accent are the entire visual language.
- **Two accents instead of one** — switching `--accent` mid-build for variety. The one-accent rule is load-bearing for hierarchy. Add a `--state-*` variable for genuine state (PASS/FAIL, deprecated/recommended); never a second brand accent.
- **Ad-hoc spacing values** — `padding: 17px`, `margin-top: 30px`, `gap: 14px`. Use the `--space-*` scale or extend it; don't bypass it. Cramped layouts and wasteful whitespace are both spacing failures.
- **Hex codes in component CSS** — colours hard-coded outside the `:root` / `[data-theme="dark"]` blocks. Dark-mode parity breaks silently because the override never fires. Use the variables.
- **Marketing-page bloat on a long-form page** — copying the starter's three-card feature grid into a page whose actual job is dense text. The starter is shaped for marketing; reach for `references/long-form-components.md` when the content is explanatory.
- **Emoji in the rendered output** — easy to slip in via headings or bullet markers. Replace with the matching Lucide SVG. The page should look the same on a corporate machine with a stripped emoji font as on macOS.
- **Skipping the mobile viewport** — a page that looks great at 1440px and breaks at 375px is a failed deliverable. Capture all three viewports every time.
- **Silently bypassing the screenshot harness** — if `npx playwright install chromium` fails on this host, follow the fallback section above; do not declare the page complete with no visual validation and no note about it.
- **More than three iteration cycles** — diminishing returns set in fast; if cycle 3 hasn't cleared the issue, stop and report the residual rather than grinding.

## Bundled resources

- `assets/index.html` — starter compliant template. **Start here every time** rather than writing from scratch.
- `scripts/screenshot.mjs` — Playwright capture harness for the three viewports.
- `scripts/validate.mjs` — static linter. Encodes the design rules as exit-coded checks; run after every edit and before reporting done. Zero dependencies.
- `scripts/a11y.mjs` — axe-core WCAG AA scan + dark-mode parity probe. Requires `@axe-core/playwright`.
- `scripts/run-evals.mjs` — skill maintainer tool. Runs the prompts in `evals/evals.json` through `claude -p` end-to-end, then validates and LLM-judges each output. Use to measure skill drift between SKILL.md changes.
- `scripts/_launch.mjs` — internal helper; the Chromium launch fallback chain shared between `screenshot.mjs` and `a11y.mjs`.
- `references/lucide-icons.md` — pre-fetched SVG snippets for common icons (sun, moon, github, twitter/x, linkedin, plus utility icons). Copy-paste ready.
- `references/long-form-components.md` — copy-paste-ready CSS + HTML for components the starter doesn't ship: callout, comparison table, definition-list glossary, reading-list, audience switcher (radiogroup a11y), practitioner-only reveal, inline-SVG diagram frame, TL;DR card. All keyed to the existing CSS variables and spacing tokens — no new tokens introduced.
