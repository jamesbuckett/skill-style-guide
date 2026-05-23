# Long-Form Components

Copy-paste-ready snippets for content shapes the marketing-style starter doesn't ship: explainer pages, technical primers, dense reference docs.

All snippets reuse the existing tokens from `assets/index.html` (`--bg`, `--surface`, `--text`, `--text-muted`, `--border`, `--border-strong`, `--accent`, `--accent-soft`, `--space-1`..`--space-9`, `--radius`, `--radius-lg`, `--shadow-sm`, `--transition`). **Do not introduce new colour values.** If a component needs more visual weight, change the border thickness or background tint, not the palette.

## How to use this file

1. Open `assets/index.html` and find the `<style>` block.
2. Paste the CSS for the components you need just **before** the final `@media (prefers-reduced-motion: reduce)` block.
3. Paste the HTML where it belongs in the page.
4. Don't paste components you aren't using — every extra rule is more surface area to maintain.

## Section variants

```css
/* Narrower column for prose-heavy sections */
.section-narrow .container { max-width: 820px; }

/* Prose wrapper — caps line length, restores paragraph spacing */
.prose { max-width: 68ch; }
.prose p + p { margin-top: var(--space-4); }
.prose .muted { color: var(--text-muted); }
.prose code {
  background: var(--surface);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid var(--border);
}
```

```html
<section class="section-narrow">
  <div class="container">
    <div class="prose stack">
      <p>First paragraph.</p>
      <p>Second paragraph, with a <code>token</code> reference.</p>
    </div>
  </div>
</section>
```

## TL;DR card

A one-paragraph summary block, always visible regardless of audience, sitting near the top of the page.

```css
.tldr {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}
.tldr-label {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: var(--space-3);
}
.tldr .lead {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  line-height: 1.35;
  margin-bottom: var(--space-5);
  max-width: 60ch;
}
.tldr ul { margin: 0; padding-left: var(--space-5); color: var(--text-muted); }
.tldr li + li { margin-top: var(--space-2); }
```

```html
<div class="tldr">
  <span class="tldr-label">TL;DR</span>
  <h2 class="lead">One bold sentence the reader gets even if they read nothing else.</h2>
  <ul>
    <li>Takeaway one.</li>
    <li>Takeaway two.</li>
    <li>Takeaway three.</li>
  </ul>
</div>
```

## Callout

Left-bordered tinted box for emphasis paragraphs — clarifications, common-misconception corrections, "the popular framing is wrong" asides.

```css
.callout {
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
  background: var(--accent-soft);
  padding: var(--space-5);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
}
.callout h3 { margin-bottom: var(--space-2); }
.callout p + p { margin-top: var(--space-3); }
```

```html
<aside class="callout">
  <h3>Heading for the callout</h3>
  <p>The point the reader should take away.</p>
</aside>
```

For more than two callout types (e.g. one for "the catch" and one for "the corollary"), vary the **border thickness** (4px vs. 2px) or the **icon** in the heading — not the colour. The one-accent rule still applies.

## Comparison table

A single side-by-side table is almost always better than two prose sections explaining variant A and variant B separately. Use this when the topic involves named variants the reader needs to compare row-by-row.

```css
.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--surface);
}
table.compare {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}
table.compare th,
table.compare td {
  text-align: left;
  padding: var(--space-4) var(--space-5);
  vertical-align: top;
  border-bottom: 1px solid var(--border);
}
table.compare thead th {
  font-size: var(--fs-small);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  background: var(--bg);
}
table.compare tbody tr:last-child th,
table.compare tbody tr:last-child td { border-bottom: 0; }
table.compare th[scope="row"] {
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}
table.compare td { color: var(--text-muted); }

/* Optional pill for risk / status / verdict columns */
.risk-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid var(--border-strong);
  color: var(--text);
  background: var(--surface);
}
.risk-pill.high { color: var(--accent); border-color: var(--accent); background: var(--accent-soft); }
```

```html
<div class="table-wrap">
  <table class="compare">
    <thead>
      <tr>
        <th scope="col">Variant</th>
        <th scope="col">Property A</th>
        <th scope="col">Property B</th>
        <th scope="col">Verdict</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">Variant 1</th>
        <td>Property value</td>
        <td>Property value</td>
        <td><span class="risk-pill">Standard</span></td>
      </tr>
      <tr>
        <th scope="row">Variant 2</th>
        <td>Property value</td>
        <td>Property value</td>
        <td><span class="risk-pill high">Recommended</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

Keep tables under ~8 rows. If you have more, split into multiple smaller tables.

## Audience switcher (radiogroup pattern)

A segmented control that reveals practitioner-depth content. Uses ARIA `radiogroup` semantics with arrow-key navigation between segments — preferable to plain buttons for keyboard users.

```css
.audience-switch {
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 2px;
  background: var(--surface);
}
.audience-switch [role="radio"] {
  appearance: none;
  background: transparent;
  border: 0;
  padding: var(--space-2) var(--space-3);
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--text-muted);
  border-radius: 6px;
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
}
.audience-switch [role="radio"]:hover { color: var(--text); }
.audience-switch [role="radio"][aria-checked="true"] {
  background: var(--accent);
  color: #fff;
}

/* Practitioner-only blocks default-hidden in exec view */
body:not(.show-practitioner) .practitioner-only { display: none; }
.practitioner-only {
  border-left: 3px solid var(--accent);
  padding: var(--space-4) var(--space-5);
  background: var(--accent-soft);
  border-radius: 0 8px 8px 0;
  margin-top: var(--space-4);
}
.practitioner-only .pract-label {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: var(--space-2);
}
.practitioner-only p + p { margin-top: var(--space-3); }
.practitioner-only code {
  background: var(--surface);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid var(--border);
}
```

```html
<div class="audience-switch" role="radiogroup" aria-label="Audience">
  <button type="button" role="radio" data-audience="exec" aria-checked="true" tabindex="0">Executive</button>
  <button type="button" role="radio" data-audience="practitioner" aria-checked="false" tabindex="-1">Practitioner</button>
</div>
```

Use inline anywhere you need practitioner-only depth:

```html
<div class="practitioner-only">
  <span class="pract-label">Practitioner</span>
  <p>Depth content visible only in practitioner view.</p>
</div>
```

JavaScript (add inside the existing IIFE in the template):

```js
const switchEl = document.querySelector('.audience-switch[role="radiogroup"]');
if (switchEl) {
  const radios = Array.from(switchEl.querySelectorAll('[role="radio"]'));
  const apply = (mode) => {
    document.body.classList.toggle('show-practitioner', mode === 'practitioner');
    radios.forEach((r) => {
      const isOn = r.dataset.audience === mode;
      r.setAttribute('aria-checked', isOn ? 'true' : 'false');
      r.setAttribute('tabindex', isOn ? '0' : '-1');
    });
    localStorage.setItem('audience', mode);
  };
  radios.forEach((r) => {
    r.addEventListener('click', () => apply(r.dataset.audience));
    r.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const idx = radios.indexOf(r);
      const next = radios[(idx + (e.key === 'ArrowRight' ? 1 : radios.length - 1)) % radios.length];
      next.focus();
      apply(next.dataset.audience);
    });
  });
  apply(localStorage.getItem('audience') || 'exec');
}
```

If the page genuinely has no practitioner-only blocks, **don't ship the switcher** — a control that does nothing is a failure mode.

## Inline-SVG diagram frame

Hand-authored SVG wrapped in a `<figure>` with a caption. Use `currentColor` and `var(--accent)` for fills/strokes so the diagram tracks both themes automatically.

```css
.diagram-frame {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}
.diagram-frame svg { display: block; width: 100%; height: auto; }
.diagram-frame figcaption {
  margin-top: var(--space-4);
  color: var(--text-muted);
  font-size: var(--fs-small);
  text-align: center;
}
```

```html
<figure class="diagram-frame" aria-labelledby="diagram-caption">
  <svg viewBox="0 0 720 360" role="img" xmlns="http://www.w3.org/2000/svg" aria-labelledby="diagram-caption">
    <!-- Use currentColor for neutral strokes, var(--accent) for emphasis. -->
    <rect x="40" y="40" width="200" height="60" rx="6" fill="var(--accent)" opacity="0.85"/>
    <text x="140" y="76" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="700">Emphasis</text>
    <rect x="280" y="40" width="200" height="60" rx="6" fill="currentColor" opacity="0.10"/>
    <text x="380" y="76" font-size="14" fill="currentColor" text-anchor="middle">Neutral</text>
  </svg>
  <figcaption id="diagram-caption">Caption naming the diagram type and what it shows.</figcaption>
</figure>
```

## Glossary (definition list)

Two-column grid on wide viewports, single-column stacked on mobile. Covers both acronyms **and** multi-word terms of art used in the page — failing to define multi-word jargon ("address reuse", "trust domain", "exposure window") is a common gap.

```css
dl.glossary {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5) var(--space-6);
  margin: 0;
}
@media (min-width: 720px) {
  dl.glossary { grid-template-columns: 220px 1fr; }
}
dl.glossary dt { font-weight: 700; color: var(--text); }
dl.glossary dd { margin: 0; color: var(--text-muted); }
@media (min-width: 720px) {
  dl.glossary dt { padding-top: 2px; }
}
```

```html
<dl class="glossary">
  <dt>Term</dt>
  <dd>Definition. Keep to one or two sentences; link to a primary source in "Further reading" if the reader needs depth.</dd>

  <dt>Another term</dt>
  <dd>Definition.</dd>
</dl>
```

## Reading-list

A list of primary-source links with one-line annotations. Cards rather than bullets so the annotation has room to breathe.

```css
ul.reading {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--space-4);
}
ul.reading li {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-4) var(--space-5);
  background: var(--surface);
  transition: border-color var(--transition);
}
ul.reading li:hover { border-color: var(--border-strong); }
ul.reading a {
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
ul.reading a svg { width: 14px; height: 14px; }
ul.reading .note {
  display: block;
  margin-top: var(--space-1);
  color: var(--text-muted);
  font-size: var(--fs-small);
}
```

```html
<ul class="reading">
  <li>
    <a href="https://example.org/spec" rel="noopener noreferrer" target="_blank">
      Title of the primary source
      <!-- Lucide: external-link -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
    </a>
    <span class="note">One sentence saying why the reader would click this.</span>
  </li>
</ul>
```

Primary sources only — specs, regulator publications, original papers. Skip blog posts, vendor marketing, and Wikipedia summaries.

## Sticky left-side TOC (scroll-revealed)

For long-form pages (six or more sections, or scrolls past three viewport heights on desktop) running a centered container, a left-side TOC orients the reader and supports in-page jumps. It anchors into the left whitespace that exists when the container is narrower than the viewport, and hides on smaller viewports so it doesn't crowd the text column.

**The TOC stays hidden while the reader is on the hero**, then fades in from the left once the hero scrolls out of view. Scroll back to the top and it fades out again. This keeps the reading frame quiet during the initial hook and only surfaces navigation once the reader is committed to the body — a sticky nav stack at the top of the page would compete with the H1 for attention.

**Prerequisite — every top-level `<section>` on the page must use the narrow container.** The TOC's `left` math reserves a fixed-width gutter on the assumption that the visible content column matches the narrow width. Any section that falls back to the default `--max-width` (now `1280px`) will slide leftward into that gutter and underlap the TOC at `>=1280px` viewports. Apply `.section-narrow` (the Section variants block earlier in this file) to *every* `<section>`, including the hero — it is easy to miss because the hero is usually authored last and visually distinct. Safer alternative for pages where no section needs the wider default: drop `.section-narrow` and apply the narrow width to `.container` directly, so it can't be skipped by forgetting a class.

Two `IntersectionObserver`s carry the behaviour: one watches the `.hero` element to toggle the reveal class, the other watches the linked sections to highlight the one currently in view. If your intro uses a different class than `.hero`, change the selector in the JS — or omit a hero entirely and the `scrollY` fallback will reveal the TOC after a short scroll. The `scroll-margin-top` rule on `section` is load-bearing — without it, clicking a TOC link scrolls the section heading directly under the sticky header.

```css
.toc {
  display: none;
  position: fixed;
  top: 96px;
  left: max(var(--space-5), calc((100vw - var(--max-width)) / 2 - 220px));
  width: 220px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding: var(--space-4) var(--space-2);
  z-index: 5;
  /* Scroll-revealed: hidden until the hero scrolls out of view. */
  opacity: 0;
  transform: translateX(-8px);
  pointer-events: none;
  transition: opacity 240ms ease, transform 240ms ease;
}
@media (min-width: 1280px) { .toc { display: block; } }
.toc.is-revealed {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}
.toc-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0 var(--space-3);
  margin-bottom: var(--space-3);
}
.toc ol {
  list-style: none;
  padding: 0;
  margin: 0;
  border-left: 1px solid var(--border);
}
.toc li { margin: 0; }
.toc a {
  display: block;
  padding: var(--space-2) var(--space-3);
  margin-left: -1px;
  border-left: 2px solid transparent;
  color: var(--text-muted);
  font-size: 13.5px;
  line-height: 1.4;
  transition: color var(--transition), border-color var(--transition), background-color var(--transition);
}
.toc a:hover {
  color: var(--text);
  border-left-color: var(--border-strong);
}
.toc a.is-active {
  color: var(--accent);
  border-left-color: var(--accent);
  font-weight: 700;
}

/* Required for anchor-link clicks not to get covered by the sticky header */
section { scroll-margin-top: 80px; }
```

```html
<nav class="toc" aria-label="On this page">
  <span class="toc-label">On this page</span>
  <ol>
    <li><a href="#first-section-id">First section</a></li>
    <li><a href="#second-section-id">Second section</a></li>
    <!-- one li per major section heading -->
  </ol>
</nav>
```

JavaScript (add inside the existing IIFE in the template):

```js
const tocEl = document.querySelector('.toc');
const heroEl = document.querySelector('.hero');

if (tocEl) {
  const reveal = (on) => tocEl.classList.toggle('is-revealed', on);

  if (heroEl && 'IntersectionObserver' in window) {
    // Hide the TOC while the hero is in view; reveal once it scrolls out.
    // rootMargin's top offset matches the sticky header height so the TOC
    // doesn't flicker as the hero crosses underneath it.
    const revealObserver = new IntersectionObserver(
      ([entry]) => reveal(!entry.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 }
    );
    revealObserver.observe(heroEl);
  } else {
    // Fallback for pages without a .hero: reveal after a small scroll.
    const onScroll = () => reveal(window.scrollY > 200);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}

const tocLinks = Array.from(document.querySelectorAll('.toc a'));
if (tocLinks.length && 'IntersectionObserver' in window) {
  const linkMap = new Map();
  tocLinks.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) linkMap.set(target, link);
  });
  const setActive = (link) => {
    tocLinks.forEach((l) => l.classList.toggle('is-active', l === link));
  };
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible[0]) {
      const link = linkMap.get(visible[0].target);
      if (link) setActive(link);
    }
  }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });
  linkMap.forEach((_, target) => observer.observe(target));
}
```

Don't ship the TOC on short pages (under six sections, or scrolling under three viewport heights on desktop) — it adds chrome without adding value.

## Compact diagram-frame variant

When a comparison page covers named variants whose *architectural shape* differs in load-bearing ways, embed a small inline-SVG diagram inside each variant's card — between the description prose and the bullet list. The page-level architecture diagram still leads with the *generic* shape; per-variant diagrams show how each one departs from it.

This variant trims padding from the default `.diagram-frame` so the diagram sits comfortably inside a card without competing for visual weight, and switches the background to `--bg` so it reads as inset rather than elevated.

```css
.diagram-frame.compact {
  padding: var(--space-5);
  background: var(--bg);
  margin-top: var(--space-5);
}
.diagram-frame.compact figcaption {
  margin-top: var(--space-3);
  font-size: 13px;
}
```

```html
<figure class="diagram-frame compact" aria-labelledby="diag-variant-cap">
  <svg viewBox="0 0 720 230" role="img" xmlns="http://www.w3.org/2000/svg" aria-labelledby="diag-variant-cap">
    <!-- Emphasis boxes use var(--accent); neutral boxes/arrows use currentColor. -->
    <rect x="130" y="80" width="240" height="100" rx="6" fill="var(--accent)" opacity="0.10" stroke="var(--accent)"/>
    <rect x="430" y="60" width="120" height="40" rx="5" fill="currentColor" opacity="0.08" stroke="currentColor"/>
    <!-- ... -->
  </svg>
  <figcaption id="diag-variant-cap">One-sentence statement of the architectural point this diagram makes — not a generic "Architecture of X" caption.</figcaption>
</figure>
```

Sizing guidance: a `viewBox` around 720×230 fits comfortably inside vendor/variant cards in a `.container-narrow` (max-width 860px). Push up to 720×260 only if the diagram genuinely needs the vertical room.

Theme tracking: use `fill="currentColor"` and `stroke="currentColor"` with low opacity (0.06–0.10) for neutral elements; `fill="var(--accent)"` with stronger opacity (0.55–0.92) for emphasis. Dark mode then re-paints automatically — no separate dark-theme variant needed.

Captions earn their place: name the architectural point in one sentence (e.g., "vendor-hosted SaaS control plane handles policy; customer-deployed gateways hold credentials"), not a generic title. The caption is the diagram's headline — it carries the meaning on mobile when the SVG text shrinks to the limit of readability.
