# Skill Style Guide

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/jamesbuckett/skill-style-guide?style=social)](https://github.com/jamesbuckett/skill-style-guide/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/jamesbuckett/skill-style-guide)](https://github.com/jamesbuckett/skill-style-guide/commits)
[![Open issues](https://img.shields.io/github/issues/jamesbuckett/skill-style-guide)](https://github.com/jamesbuckett/skill-style-guide/issues)

> Claude Code skill for single-file HTML pages with disciplined design and Playwright validation.

## About

Turns a one-line request like *"build me a landing page"* into a single, self-contained `index.html` — Noto Sans typography, a 4/8/12/16/24/32 spacing scale, inlined Lucide icons, exactly one accent colour, light theme with dark-mode toggle. Validates every page visually with a Playwright screenshot harness across mobile (375px), tablet (768px), and desktop (1440px) before reporting done. Composes with the [`skill-build-educational-site`](https://github.com/jamesbuckett/skill-build-educational-site) skill for long-form explainer pages.

## Prerequisites

- **[Claude Code](https://docs.claude.com/en/docs/claude-code)** — the CLI that loads and runs skills.
- **[Node.js 18+](https://nodejs.org/)** and **npm** — needed once per project for the Playwright screenshot harness.
- **git** — to clone the repository.

## Installation

The skill installs as a directory under `~/.claude/skills/`. Claude Code auto-discovers any skill placed there.

```bash
# 1. Clone the repo directly into your Claude Code skills directory.
git clone https://github.com/jamesbuckett/skill-style-guide.git \
  ~/.claude/skills/skill-style-guide

# 2. Restart Claude Code (or start a new session) so the skill is registered.
```

That's it — no build step, no install script. The skill is now available in any project.

### Verify the install

Inside Claude Code, ask:

```text
> what skills do you have available?
```

You should see `skill-style-guide` listed with its trigger description.

### Per-project setup (one-time)

The first time you use the skill in a project, install Playwright so the screenshot harness can run:

```bash
cd <your-project>
npm init -y
npm install --save-dev playwright
npx playwright install chromium
```

If `npx playwright install chromium` fails on your host (known broken on Ubuntu ARM64), see the **When `npx playwright install chromium` fails** section in [`SKILL.md`](SKILL.md) for fallbacks — the harness works with system chromium or an external CDP endpoint.

## Quick Start

Once installed, open Claude Code inside any project and prompt:

```text
> build me a landing page for a small Postgres consultancy
```

Claude scaffolds `index.html` from the bundled starter template, applies the design rules in `SKILL.md`, then runs the Playwright harness to capture screenshots for review:

```bash
node screenshot.mjs                 # captures mobile / tablet / desktop into screenshots/
node screenshot.mjs --mode=dark     # capture the dark-mode variant
```

### Trigger phrases

The skill activates on any of these phrasings, even without naming it:

- "build me a landing page"
- "make a single-file HTML page for X"
- "edit the index.html in this project"
- "design a marketing page / prototype / mockup"

Skip only when you explicitly want a multi-file build (React, Vue, Next, etc.).

## Project Structure

```
skill-style-guide/
├── SKILL.md                          # the skill definition Claude Code loads
├── assets/
│   └── index.html                    # starter template — palette, fonts, dark toggle, branding row
├── references/
│   ├── lucide-icons.md               # copy-paste Lucide SVG snippets
│   └── long-form-components.md       # callouts, comparison tables, glossary, TOC, diagram frames
├── scripts/
│   └── screenshot.mjs                # Playwright harness for mobile / tablet / desktop capture
└── evals/
    └── evals.json                    # skill evaluation prompts and expected outputs
```

## Updating

```bash
cd ~/.claude/skills/skill-style-guide
git pull
```

## Uninstalling

```bash
rm -rf ~/.claude/skills/skill-style-guide
```

## Contributing

Issues and pull requests welcome. Please open an issue first to discuss substantial changes.

## License

[MIT](LICENSE) © 2026 James Buckett
