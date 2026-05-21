# Skill Style Guide

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/jamesbuckett/skill-style-guide?style=social)](https://github.com/jamesbuckett/skill-style-guide/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/jamesbuckett/skill-style-guide)](https://github.com/jamesbuckett/skill-style-guide/commits)
[![Open issues](https://img.shields.io/github/issues/jamesbuckett/skill-style-guide)](https://github.com/jamesbuckett/skill-style-guide/issues)

> Claude Code skill for single-file HTML pages with disciplined design and Playwright validation.

## About

Generates single-file HTML pages that follow a disciplined design system — Noto Sans typography, a 4/8/12/16/24/32/48/64 spacing scale, inlined Lucide icons, exactly one accent colour, and a light theme with a dark-mode toggle. Validates every page with a Playwright screenshot harness across mobile (375px), tablet (768px), and desktop (1440px) viewports, plus a static linter that encodes the rules as exit-coded checks. Composes with the [`skill-build-educational-site`](https://github.com/jamesbuckett/skill-build-educational-site) skill when long-form explainer content needs a visual chassis.

## Quick Start

```bash
# Direct install (recommended)
git clone https://github.com/jamesbuckett/skill-style-guide.git ~/.claude/skills/skill-style-guide

# Or: symlink from a working copy (for active development)
git clone https://github.com/jamesbuckett/skill-style-guide.git ~/projects/skill-style-guide
ln -s ~/projects/skill-style-guide ~/.claude/skills/skill-style-guide
```

Then, inside any GitHub-backed repo, ask Claude to invoke the skill by its trigger phrase.

## Usage

Inside any project, open Claude Code and prompt:

```text
> build me a landing page for a small Postgres consultancy
```

Claude scaffolds `index.html` from the bundled starter template, applies the design rules in `SKILL.md`, then runs the validators:

```bash
node ~/.claude/skills/skill-style-guide/scripts/validate.mjs ./index.html
node ~/.claude/skills/skill-style-guide/scripts/screenshot.mjs ./index.html
node ~/.claude/skills/skill-style-guide/scripts/a11y.mjs ./index.html
```

The first install also needs Playwright in the consumer project (`npm install --save-dev playwright @axe-core/playwright && npx playwright install chromium`). See [`SKILL.md`](SKILL.md) for the full workflow, the optional PostToolUse / Stop hooks that automate validation, and fallbacks when `npx playwright install` fails on your host.

## Hooks (optional)

Two Claude Code hooks turn the validators from "remember to run them" into automatic guardrails. They live in the consumer project's `.claude/settings.json`; the helper scripts they invoke live in the skill repo, so `git pull` keeps them current.

- **PostToolUse** — after every `Edit` / `Write` / `MultiEdit` against a `*.html` file, runs `validate.mjs` on it. If any rule fails, the violations are fed back to Claude as a tool result and Claude self-corrects before the next user message.
- **Stop** — when Claude tries to finish a response in a project that contains `./index.html`, blocks completion unless `validate.mjs` exits clean *and* the three screenshots (`mobile.png`, `tablet.png`, `desktop.png`) exist under `./screenshots/`. The block reason names the missing pieces so Claude knows what to do next. Skipped silently in projects without an `./index.html`.

Install:

```bash
cd <your-project>
mkdir -p .claude
cp ~/.claude/skills/skill-style-guide/assets/settings.json.example .claude/settings.json
```

If `.claude/settings.json` already exists, merge the `hooks` block from `assets/settings.json.example` into your existing file rather than overwriting. To disable temporarily, comment out the relevant block or move the file aside (`mv .claude/settings.json .claude/settings.json.off`).

## Project Structure

```text
.
├── SKILL.md       # Skill definition + design rules
├── assets/        # Starter template, shared palette + spacing tokens
├── scripts/       # validate.mjs, screenshot.mjs, a11y.mjs, hook helpers
├── references/    # Extended docs (long-form components, composition rules)
└── evals/         # Skill eval suite
```

## Contributing

Issues and pull requests welcome. Please open an issue first to discuss substantial changes.

## License

[MIT](LICENSE) © 2026 James Buckett
