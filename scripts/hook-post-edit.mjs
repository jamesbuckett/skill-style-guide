#!/usr/bin/env node
// PostToolUse hook helper for skill-style-guide.
//
// Reads a Claude Code hook event from stdin. When the just-completed tool was
// an Edit/Write/MultiEdit against a *.html file, runs validate.mjs against
// that file and prints any violations to stderr. Exit 2 surfaces the
// violations back to Claude as a tool result, prompting a follow-up fix.
//
// Wire into a consumer project's `.claude/settings.json`:
//
//   "hooks": {
//     "PostToolUse": [{
//       "matcher": "Edit|Write|MultiEdit",
//       "hooks": [{
//         "type": "command",
//         "command": "node $HOME/.claude/skills/skill-style-guide/scripts/hook-post-edit.mjs"
//       }]
//     }]
//   }
//
// Hook protocol: https://docs.claude.com/en/docs/claude-code/hooks
//   - Exit 0 → silent success, no message to Claude
//   - Exit 2 → tool result fed back to Claude (used here when validate fails)
//   - Other  → treated as hook error, surfaced to user

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VALIDATOR = path.join(__dirname, 'validate.mjs');

// Read event from stdin.
let raw = '';
process.stdin.setEncoding('utf8');
for await (const chunk of process.stdin) raw += chunk;

let event;
try { event = JSON.parse(raw); } catch { process.exit(0); }

// Scope: only Edit/Write/MultiEdit; only when the file path ends in .html.
const tool = event.tool_name ?? '';
if (!/^(Edit|Write|MultiEdit)$/.test(tool)) process.exit(0);

const filePath = event.tool_input?.file_path ?? '';
if (!filePath.endsWith('.html')) process.exit(0);
if (!fs.existsSync(filePath)) process.exit(0); // edit deleted the file; nothing to validate

// Run validator. Pass through human output to stderr so it surfaces to Claude
// if we exit 2.
const result = spawnSync('node', [VALIDATOR, filePath], {
  stdio: ['ignore', 'pipe', 'pipe'],
  encoding: 'utf8',
});

if (result.status === 0) {
  // Clean — silent exit.
  process.exit(0);
}

// Feed the validator's report back to Claude.
process.stderr.write(`validate.mjs reported errors on ${filePath}:\n\n`);
if (result.stdout) process.stderr.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
process.exit(2);
