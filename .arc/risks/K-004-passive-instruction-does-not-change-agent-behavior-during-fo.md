---
id: K-004
title: Passive instruction does not change agent behavior during focused coding
status: identified
date: 2026-06-14
tags:
  - agents
  - integration
mitigated_by:
  - D-058
---

## Description

Passive instruction — the skill file, `arc init-agent`, and the SessionStart reminder — does not change what a coding agent does once it enters focused coding. This is not a hypothesis; it is recorded evidence inside this very graph.

## Evidence

- **A-013 (invalidated):** an agent implemented three issues without running a single arc command during the work, despite AGENTS.md instructing dogfooding. Instruction was "not sufficient to change behavior during focused coding."
- **A-014 (invalidated):** `arc list` / `arc status` do not give enough context to understand a codebase — entity titles are summaries, not implementation detail.
- **A-015 (invalidated):** `arc next` as a readiness categorizer is useless until the graph is fully populated (cold-start problem).

The skill file is already 447 lines including a full "Best Practices for Agents" section. Coverage is not the gap. **Timing and ownership are.**

## Impact

- The graph decays: entities are backfilled under validator pressure rather than authored before code.
- The dogfooding validator (`.ketchup/validators/arc-dogfooding.md`) is the only signal, and it fires at commit time — after code already exists. It is reactive, not generative.
- `appeal:` is a soft underbelly agents learn to abuse, weakening the only enforcement that exists.

## Planned mitigation

- D-058 — shift from instruction to delegation via a requirements-engineer agent.
- D-059 — the RE agent contract (capture-before-code, `arc context` hand-off).
- D-060 — move enforcement earlier (pre-edit reminder) and make it semantic (R-xxx must overlap the diff).

Linked as `mitigated_by` once D-058 is accepted and adopted; for now D-058 is proposed.
