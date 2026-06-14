---
id: D-058
title: Agent integration shifts from passive instruction to delegation via a requirements-engineer agent
status: proposed
date: 2026-06-14
tags:
  - agents
  - integration
driven_by:
  - R-010
enables:
  - D-059
  - D-060
depends_on: []
affects: []
---

## Context

K-004 captures the failure mode with recorded evidence (A-013/A-014/A-015, all invalidated). The current agent-integration stack is:

- **Instruction layer:** skill file (447 lines), `arc init-agent`, SessionStart reminder.
- **Enforcement layer:** the dogfooding validator, firing at commit time.

What is missing is a **capture step that happens before code exists, owned by a dedicated agent.** A-013 shows that asking the coding agent to *also* do architecture fails exactly when it is most loaded — during focused coding.

## Decision

Move from *instruct the coding agent to do architecture too* to **delegate architecture to a specialist.** Introduce a requirements-engineer (RE) agent whose entire job is graph capture. The coding agent's contract simplifies to: *no `src/` edits without a committed R-xxx and a read of `arc context <id>`.*

Arc itself is unchanged — it remains the graph (per V-001 / D-045). What changes is the **integration model around it**, not arc's features. This delegation needs no new arc command: it composes `arc add`, `arc link`, `arc check`, and `arc context`, all of which exist.

## Consequences

- Captures A-013's failure mode structurally: architecture work leaves the coding agent's focused-coding loop and moves to a specialist that is never in that loop.
- The coding agent gets a crisp, enforceable precondition instead of a 447-line manual.
- Does **not** supersede the skill — the skill remains the reference. Delegation provides the *timing* and *ownership* the skill lacks.
- Enables D-059 (the contract) and D-060 (earlier, semantic enforcement).
- Open question (to validate): whether a small local model (tier1 in `.ketchup/state.json`) is sufficient for capture-quality entities, or whether capture needs a stronger model. Capture is the RE agent's only job, so model choice is isolated.
