---
id: A-019
title: npm optionalDependencies correctly select the right per-platform package at install time on all supported OS/arch combinations
status: unvalidated
date: 2026-06-27
tags:
  - distribution
  - npm
---

We assume that npm's `optionalDependencies` mechanism correctly selects and installs only the per-platform package matching the install target's OS, CPU, and libc, and that a shim package can `require.resolve` (or `import.meta.resolve`) the platform binary's entry point from `node_modules/@kegesch/arc-<platform>` at install or first run. This assumption is the foundation of D-062 (per-platform precompiled binary distribution via npm) and the only thing that design rests on that we have not yet observed.

## Why this matters

D-062 is the chosen mechanism for fixing the npm-distribution gap (R-051). If npm's platform selector does not behave as documented across the matrix, the design fails and we need a fallback (a single universal binary, a Node.js shim that wraps the bun-compiled binary, or a postinstall script that downloads from GitHub Releases).

## Validation path

1. Stand up a local npm registry (e.g. `verdaccio`) and publish the @kegesch/arc shim plus the five per-arch packages `@kegesch/arc-linux-x64`, `-linux-arm64`, `-darwin-x64`, `-darwin-arm64`, `-windows-x64`.
2. In a clean container per platform (no bun, no node, no deno on PATH) — or use Docker matrix images — run `npm install -g @kegesch/arc` against the local registry.
3. Verify the shim resolves to a working binary: `arc --version` returns the expected version, `arc check` on a tiny fixture exits 0.
4. Verify the install size: only the matching arch package is downloaded; the others are skipped or absent.
5. Mark A-019 validated once all five target platforms pass. Invalidate and pivot to a fallback if any platform fails to resolve or the shim cannot find its sibling package.
6. Repeat on a current Node LTS (≥ 20) and a current npm (≥ 10) to catch any version skew.

## Fallback

If the optionalDependencies mechanism does not behave reliably, alternative distributions are: (a) ship a single `bun build --compile` binary per arch and have the user run a one-liner download from GitHub Releases, (b) ship a Node.js shim that spawns the bun-compiled binary, (c) switch the bin shebang to `node` and accept Node as the npm-channel runtime (contradicts R-051, so last resort).
