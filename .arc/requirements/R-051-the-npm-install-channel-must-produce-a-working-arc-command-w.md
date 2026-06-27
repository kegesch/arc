---
id: R-051
title: The npm install channel must produce a working arc command with no runtime prerequisite
status: accepted
date: 2026-06-27
tags:
  - distribution
  - npm
derived_from:
  - V-001
  - R-014
conflicts_with: []
requested_by: []
---

The `npm install -g @kegesch/arc` path must produce a working `arc` command on a target machine that has no `bun`, no `node`, and no `deno` on its PATH. Today the npm package ships `bin: { "arc": "./src/index.ts" }` with a `#!/usr/bin/env bun` shebang, so the install succeeds but the command fails on any host without bun. The GitHub Releases channel already meets this intent via precompiled binaries (R-014 / D-011 / D-012), but the npm channel does not.

This requirement specializes R-014 to the npm distribution channel. R-014 is the parent — it states the intent — and R-051 is the channel-specific testable form.

## Acceptance Criteria

- A user with a clean machine (no bun, no node, no deno on PATH) can run `npm install -g @kegesch/arc` and then `arc --version` succeeds.
- `arc check` works on a freshly installed global without any runtime install.
- The install is the only step — no separate "now run `npm i -g bun`" instruction.
- The install on the user's platform is acceptable in size (each per-arch sub-package is ~10–20 MB; the matching arch is the only one downloaded).
