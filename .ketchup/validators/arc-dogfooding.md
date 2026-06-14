---
name: arc-dogfooding
description: Ensures implementation commits are backed by arc requirements or decisions, and that referenced entities semantically relate to the diff
enabled: true
---

# Arc Dogfooding Validator (v2)

This project dogfoods arc. Every implementation change must be traceable to a requirement or decision. Graph capture is delegated to the **arc-requirements-engineer** agent (D-059) — the remedy for a missing R-xxx is to hand the request to that agent, not to `appeal:`.

> Ceiling: ketchup validators are LLM-evaluated prose, not mechanically enforced logic. The §2 semantic check is a judgment call by the validator agent running `arc context <id>`, not a compiled assertion. The escape hatch is only as narrow as the evaluating model is strict.

## Scope

Applies when the commit modifies files in `src/` (implementation code).

Does NOT apply to:

- Commits that only modify `.arc/` files
- Commits that only modify test files (`*.test.*`)
- Commits that only modify config (`package.json`, `tsconfig.json`, `.ketchup/`, `.pi/`, etc.)
- Commits that only modify documentation (`*.md` outside `src/`)

## Check

### 1. Missing traceability — NACK if ALL of these are true:

1. The commit modifies at least one file in `src/**/*.ts`
2. The commit does NOT modify any file in `.arc/`
3. The commit message does not reference an arc entity ID (`R-xxx`, `D-xxx`, `A-xxx`, `K-xxx`)
4. There is no valid `appeal:` (see §3)

**Remedy to ACK:** the coding agent should not backfill entities under pressure. Hand the request to `arc-requirements-engineer`, then implement against the returned `arc context <R-xxx>`.

### 2. Semantic relevance — NACK if:

The commit references an entity ID, but that entity does **not** plausibly relate to the diff. Check by running `arc context <id>` and judging whether the changed `src/` files could implement or affect it. A present-but-unrelated ID — cited only to satisfy §1 — is a NACK. This closes the loophole where an agent name-drops any entity to pass.

### 3. Constrained appeals — NACK if:

The commit uses `appeal:` but the justification is absent or generic. A valid appeal must state the *specific* reason traceability does not apply to this change (e.g. `appeal: revert of a failed experiment, no behavioral change`). Bare `appeal:`, `appeal: yes`, or `appeal: rushing` are NACKs.

### 4. Unhealthy graph — NACK if:

1. The commit modifies files in `.arc/`, AND
2. The commit message does NOT contain `arc-check-passed`

When modifying `.arc/`, run `arc check` and confirm no **new** anomalies. The repo carries 2 known intentional anomalies (D-034, D-045); `arc-check-passed` asserts "zero new anomalies," not "zero anomalies."

### ACK if any of these is true:

- The commit touches `.arc/` AND the message contains `arc-check-passed`
- The commit references an entity ID that passes the §2 semantic check
- The commit only modifies tests, config, or docs (no `src/` changes)
- The commit includes a valid §3 `appeal:` with a specific justification

## Why This Matters

K-004 (evidence: invalidated A-013/A-014/A-015) shows passive instruction does not change agent behavior during focused coding. The validator is the one signal that fires at the commit boundary. v2 makes it **semantic** (a cited ID must relate to the work, §2) and **constrains the appeal loophole** (§3), so enforcement is only as leaky as the escape hatch is narrow. Realizes D-060.
