---
id: K-005
title: npm install -g @kegesch/arc currently fails silently or with a confusing error when bun is not on PATH
status: identified
date: 2026-06-27
tags:
  - distribution
  - npm
mitigated_by:
  - D-062
---

The current `package.json` declares `bin: { "arc": "./src/index.ts" }` and `src/index.ts` line 1 is `#!/usr/bin/env bun`. On any system without `bun` on PATH (i.e. most npm users), `npm install -g @kegesch/arc` succeeds — the bin file is placed — but running `arc` either errors with `env: bun: No such file or directory` or, depending on the shell, returns a generic "command not found" with no hint about the missing runtime. There is no install-time check, no helpful error message, and the README does not warn about this.

This is the exact gap that R-014 alone fails to surface: R-014 states "standalone binary requiring no runtime" as the intent, but the npm channel does require one. The graph as it stood did not distinguish between the GitHub Releases channel (which meets R-014 via D-011) and the npm channel (which does not).

## Why it is identified, not mitigated

D-062 is the chosen fix but not yet implemented. Until the shim + per-arch packages ship, the npm install path remains broken for the most common case (a developer with Node but not bun).

## Mitigation

D-062 (per-platform precompiled binary via `optionalDependencies`) eliminates the runtime prerequisite on the npm channel. After D-062 lands, the npm install produces a binary that needs no `bun`, no `node`, no `deno` on PATH.

## Residual

- An unsupported platform (e.g. `linux-ppc64`) still falls through to a confusing error. The shim's error message must be helpful.
- `npm` itself is still required (hard prerequisite of the channel). The README and the shim's error message must state this clearly.
- Users on exotic platforms not in the matrix are redirected to the GitHub Releases download page.
