---
id: R-050
title: arc init-agent must install a genericized agent-delegation stack into consumer projects
status: accepted
date: 2026-06-14
tags:
  - agents
  - distribution
derived_from:
  - R-010
conflicts_with: []
requested_by: []
---

## Description

`arc init-agent` today only appends an ARC usage block to `AGENTS.md`. Consumer projects that adopt the delegation model (D-058) also need the harness artifacts that realize it: the requirements-engineer agent (pi-subagents), and the dogfooding validator + reminder (ketchup). Arc must be able to install these into any arc-using project, not just arc itself.

## Acceptance

- `arc init-agent` deploys a genericized requirements-engineer agent to `.pi/agents/`.
- It deploys the ketchup validator + reminder when `.ketchup/` exists, and reports them as skipped (non-failing) otherwise.
- Templates are genericized: no arc-internal entity IDs (D-xxx/A-xxx/K-xxx from arc's own graph), no `bun run dev` (uses the installed `arc` binary), no arc-specific graph state (e.g. "2 known anomalies").
- Works in both dev (`bun run src/index.ts`) and compiled-binary execution (templates resolve via the same mechanism as `arc skill`).
- Idempotent: re-running updates the deployed templates.
