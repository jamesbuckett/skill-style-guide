# Style Guide

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/jamesbuckett/style-guide?style=social)](https://github.com/jamesbuckett/style-guide/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/jamesbuckett/style-guide)](https://github.com/jamesbuckett/style-guide/commits)
[![Open issues](https://img.shields.io/github/issues/jamesbuckett/style-guide)](https://github.com/jamesbuckett/style-guide/issues)

> Claude Code skill for single-file HTML pages with disciplined design and Playwright validation.

## About

Turns a one-line request like *"build me a landing page"* into a single, self-contained `index.html` — Noto Sans typography, a 4/8/12/16/24/32 spacing scale, inlined Lucide icons, exactly one accent colour, light theme with dark-mode toggle. Validates every page visually with a Playwright screenshot harness across mobile (375px), tablet (768px), and desktop (1440px) before reporting done. Composes with the `build-educational-site` skill for long-form explainer pages.

## Quick Start

```bash
git clone https://github.com/jamesbuckett/style-guide.git ~/.claude/skills/style-guide
# Then, inside any GitHub-backed repo, ask Claude to invoke the skill by its trigger phrase.
```

## Usage

Once installed, prompt Claude inside any project:

```text
> build me a landing page for a small Postgres consultancy
```

Claude scaffolds `index.html` from the bundled starter template, applies the design rules from `SKILL.md`, then runs the Playwright harness to capture screenshots for review:

```bash
node screenshot.mjs                 # captures mobile / tablet / desktop into screenshots/
node screenshot.mjs --mode=dark     # capture the dark-mode variant
```

## Project Structure

```
.claude/skills/style-guide/   # the skill itself — SKILL.md, assets, references, scripts, evals
docs/                         # rendered hero screenshots used in this README
screenshot.mjs                # Playwright capture harness, also bundled inside the skill
package.json                  # Playwright dev dependency
```

## Contributing

Issues and pull requests welcome. Please open an issue first to discuss substantial changes.

## License

[MIT](LICENSE) © 2026 James Buckett
