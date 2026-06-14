---
id: D-061
title: init-agent deploys genericized delegation templates with conditional ketchup install
status: accepted
date: 2026-06-14
tags:
  - agents
  - distribution
driven_by:
  - R-050
enables:
  - D-059
  - D-060
depends_on: []
affects: []
---

## Context

R-050 asks arc to install the delegation stack into consumer projects. The three artifacts target three different harnesses (pi-subagents `.pi/agents/`, ketchup `.ketchup/validators`+`reminders/`, hermes `.hermes/skills/`), so they cannot collapse into skill content. The live arc-repo versions of these files reference arc's *own* internal graph (D-059, D-034, A-013, commit 4cdcbcb, the "2 known intentional anomalies") and the dev alias `bun run dev` — meaningless in a consumer project.

## Decision

1. **Extend `arc init-agent`** (not a new command) to deploy the stack alongside the existing AGENTS.md block. init-agent is the agent-setup command; completing it with delegation deployment is coherent, and the user framing pointed here.
2. **Genericized templates** live in `skill/agents/` (shipped via the existing `files: skill/**` in package.json), hand-written and decoupled from arc's internal graph. Hand-written beats derive-at-install: explicit, reviewable, no leakage of arc internals. Resolved at runtime with the same dev/binary path logic as `arc skill`.
3. **Conditional ketchup, report skips.** The RE agent (`.pi/agents/`) is always installed — it is the core of the delegation model and harmless if pi-subagents is unused. The validator + reminder are installed only when `.ketchup/` exists; otherwise init-agent prints what was skipped and why, exit 0. Honors "consumer projects may not use ketchup" without failing or polluting.
4. **Default behavior, no flag.** init-agent is run rarely (setup); delegation is the recommended model (D-058), so the default deploys the recommended stack. An opt-out flag is YAGNI until asked.
5. **Idempotent overwrite** for the deployed templates (matches `arc skill --install`), keeping consumer installs current with arc's template improvements. The AGENTS.md block remains idempotent via its existing sentinel marker.

## Consequences

- One command, `arc init-agent`, fully onboards a consumer project's agent integration.
- Templates must be maintained genericized — any arc-internal reference added to the live repo versions must NOT leak into `skill/agents/`. The install test asserts this (templates contain no `bun run dev`, no arc-internal IDs).
- ketchup remains optional; the RE agent works without it (the validator just won't enforce the contract).
