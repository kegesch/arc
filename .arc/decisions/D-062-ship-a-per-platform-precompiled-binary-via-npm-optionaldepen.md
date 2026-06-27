---
id: D-062
title: Ship a per-platform precompiled binary via npm optionalDependencies with a tiny shim package
status: proposed
date: 2026-06-27
tags:
  - distribution
  - npm
driven_by:
  - R-051
  - R-014
  - A-019
enables: []
depends_on: []
affects: []
---

Ship the CLI as a per-platform precompiled binary delivered through npm via the `optionalDependencies` pattern: a tiny shim package (`@kegesch/arc`) plus one per-arch package (`@kegesch/arc-linux-x64`, `-linux-arm64`, `-darwin-x64`, `-darwin-arm64`, `-windows-x64`) that each contain only the `bun build --compile` output. npm selects the matching platform package at install time, and the shim's `bin` entry resolves the per-arch sibling from `node_modules` and execs it.

## Context

R-014 ("standalone binary requiring no runtime") is met today by the GitHub Releases channel (D-011 + D-012) but NOT by the npm channel. The npm package ships `bin: { "arc": "./src/index.ts" }` with a `#!/usr/bin/env bun` shebang, so `npm install -g @kegesch/arc` produces a non-functional command on any host without bun on PATH. R-051 captures the gap as a testable, channel-specific requirement.

## Decision

The @kegesch/arc npm package becomes a shim. Its `bin` entry is a small Node.js-compatible script (~50 lines) that:

1. Detects the current `process.platform` + `process.arch` (+ `process.report.getReport().header.glibcVersionRFC3339` on Linux for the `-musl` variant if needed).
2. Maps to the expected per-arch sibling, e.g. `@kegesch/arc-linux-x64`.
3. Resolves the binary path: `require.resolve(`@kegesch/arc-${platform}-${arch}/package.json`)` then read its `bin` field, or directly `require.resolve(`@kegesch/arc-${platform}-${arch}`)`.
4. Execs the resolved binary with the user's argv via `child_process.spawnSync`, passing through stdio.
5. If the sibling is not present (unsupported platform), prints a clear error pointing the user to the GitHub Releases download page and exits 1.

The per-arch packages each contain:
- A `package.json` with no `bin` (the shim does the resolution) and one `optionalDependency` on the matching runtime if needed (none — the binary is standalone).
- The single `bun build --compile` output from D-011, named `arc` (or `arc.exe` on Windows).

The release workflow (existing CI in D-012, plus D-051's manual dispatch) fans out to build the binary per platform, then publishes the shim package + each per-arch package via trusted publishing (A-017) in a single release.

## Rationale

- The shim is < 50 KB, so install of the metadata layer is fast.
- Only the matching arch sub-package is downloaded per user (each ~10–20 MB), keeping global install small in practice.
- The mechanism relies on the long-standing, documented npm `optionalDependencies` platform selector — no custom install hooks, no postinstall download from GitHub, no Node version assumptions on the user side beyond what npm itself needs.
- Each per-arch binary is the same D-011 standalone binary that already powers the GitHub Releases channel, so we reuse the build artifact across channels.
- Trusted publishing (A-017) means per-arch publish is OIDC-authenticated from the release workflow — no token rotation.

## Trade-offs

- Five per-arch packages per release. Mitigated by the release workflow fanning out the build + publish in parallel.
- The shim requires `npm install` to have run successfully (i.e. the matching optionalDependency was installed). On a missing arch the shim must print a helpful error, not a stack trace.
- One extra layer of indirection (shim → spawn) adds a few milliseconds of process startup. Acceptable for a CLI that already parses the entire `.arc/` directory on every invocation (R-004).
- `npm` itself is still required on the user's machine. That is a hard prerequisite of any npm channel and out of scope for this decision — but the shim's error message must say so if `npm` is missing.

## Validation

Depends on A-019 (npm `optionalDependencies` correctly resolves per-platform). The release workflow integration is out of scope for this decision; the packaging decision is testable on its own by publishing to a local registry (verdaccio) and installing on each target platform — see A-019's validation path.
