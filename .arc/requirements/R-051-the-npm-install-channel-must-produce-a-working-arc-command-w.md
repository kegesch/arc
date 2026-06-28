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

The `npm install -g @kegesch/arc` path must produce a working `arc` command without any **additional** runtime install beyond what `npm` itself requires. Today the npm package ships `bin: { "arc": "./src/index.ts" }` with a `#!/usr/bin/env bun` shebang, so the install succeeds but the command fails on any host without bun. The GitHub Releases channel already meets this intent via precompiled binaries (R-014 / D-011 / D-012), but the npm channel does not.

This requirement specializes R-014 to the npm distribution channel. R-014 is the parent — it states the intent — and R-051 is the channel-specific testable form.

## Acceptance Criteria

- A user with a clean machine (no `bun`, no `deno` on PATH; `node` is implicit because `npm` is a node package) can run `npm install -g @kegesch/arc` and then `arc --version` succeeds.
- `arc check` works on a freshly installed global without installing bun, deno, or any runtime beyond what npm provides.
- The install is the only step — no separate "now run `npm i -g bun`" instruction.
- The install on the user's platform is acceptable in size (each per-arch sub-package is ~10–20 MB; the matching arch is the only one downloaded).
